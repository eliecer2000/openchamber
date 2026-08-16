import { CodexBindingStore } from './binding-store.js';
import { CodexRuntime } from './runtime.js';

const CODEX_TARGET = Object.freeze({
  harnessId: 'codex',
  modelRef: Object.freeze({ kind: 'default' }),
});

const SUPPORTED_RUNTIME = 'web';

const normalizeRuntimeName = (value) => (
  typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : SUPPORTED_RUNTIME
);

const createEligibility = ({ runtimeName, apiOnly }) => {
  const frozenRuntimeName = normalizeRuntimeName(runtimeName);
  return Object.freeze({
    available: frozenRuntimeName === SUPPORTED_RUNTIME && apiOnly !== true,
    runtimeName: frozenRuntimeName,
    runtimeId: SUPPORTED_RUNTIME,
    reason: frozenRuntimeName === SUPPORTED_RUNTIME && apiOnly !== true ? null : 'unsupported-runtime',
  });
};

const statusForError = (error) => {
  if (error?.code === 'binding-not-found') return 404;
  if (['binding-conflict', 'write-conflict', 'dedupe-conflict', 'turn-active',
    'turn-start-ambiguous', 'approval-already-resolved', 'approval-scope-mismatch',
    'stale-approval', 'approval-response-ambiguous', 'abort-scope-mismatch'].includes(error?.code)) return 409;
  if (error?.code === 'store-corrupt' || error?.code === 'record-corrupt') return 503;
  if (error?.code === 'invalid-directory' || error?.code === 'non-canonical-directory' ||
    error?.code === 'directory-mismatch' || error?.code === 'invalid-binding' ||
    error?.code === 'invalid-turn-request' || error?.code === 'invalid-approval-decision' ||
    error?.code === 'invalid-approval-request' || error?.code === 'invalid-abort-request') return 400;
  return 500;
};

const publicError = (error) => {
  const status = statusForError(error);
  if (status === 500) return { status, body: { error: 'Codex request failed', code: 'codex-request-failed' } };
  return { status, body: { error: error.message, code: error.code } };
};

export const createCodexRoutesRuntime = ({
  runtimeDescriptor,
  runtimeName,
  apiOnly,
  bindingStore = null,
  codexRuntime = new CodexRuntime(),
  dataDirectory,
  getServerId = async () => null,
  resolveProjectDirectory = async () => null,
} = {}) => {
  const descriptor = runtimeDescriptor && typeof runtimeDescriptor === 'object'
    ? { runtimeName: runtimeDescriptor.runtimeName, apiOnly: runtimeDescriptor.apiOnly }
    : { runtimeName, apiOnly };
  const eligibility = createEligibility(descriptor);
  let store = bindingStore;
  let storePromise = null;

  const requireAvailable = (res) => {
    if (eligibility.available) return true;
    res.status(501).json({ available: false, reason: eligibility.reason });
    return false;
  };

  const getBindingStore = async () => {
    if (store) return store;
    if (!storePromise) {
      storePromise = Promise.resolve(getServerId()).then((serverId) => {
        if (typeof serverId !== 'string' || !serverId.trim()) {
          const error = new Error('Codex server identity is unavailable');
          error.code = 'server-identity-unavailable';
          throw error;
        }
        store = new CodexBindingStore({ dataDirectory, serverId: serverId.trim() });
        return store;
      }).catch((error) => {
        storePromise = null;
        throw error;
      });
    }
    return storePromise;
  };

  const resolveScope = async (req) => {
    const authoritativeDirectory = await resolveProjectDirectory(req);
    if (typeof authoritativeDirectory !== 'string' || !authoritativeDirectory) {
      const error = new Error('Codex project directory is required');
      error.code = 'invalid-directory';
      throw error;
    }
    const requestedDirectory = typeof req.body?.directory === 'string'
      ? req.body.directory
      : (typeof req.query?.directory === 'string' ? req.query.directory : authoritativeDirectory);
    return {
      directory: requestedDirectory,
      authoritativeDirectory,
      runtimeId: eligibility.runtimeId,
    };
  };

  const run = (handler) => async (req, res) => {
    if (!requireAvailable(res)) return;
    try {
      await handler(req, res);
    } catch (error) {
      const response = publicError(error);
      res.status(response.status).json(response.body);
    }
  };

  const readSession = async (req) => {
    const scope = await resolveScope(req);
    const currentStore = await getBindingStore();
    const session = await currentStore.get({ sessionId: req.params.id, ...scope });
    const state = codexRuntime.getState(session.sessionId)?.memory ?? null;
    if (!state) {
      return { session, state: null };
    }
    return { session, state };
  };

  const requireState = (res, result) => {
    if (result.state) return true;
    res.status(409).json({ error: 'Codex session has not started', code: 'session-not-started' });
    return false;
  };

  const registerRoutes = (app) => {
    app.get('/api/codex/capabilities', (req, res) => {
      if (!requireAvailable(res)) return;
      res.setHeader('Cache-Control', 'no-store');
      res.json({ available: true, harnessId: 'codex', target: CODEX_TARGET });
    });

    app.get('/api/codex/sessions', run(async (req, res) => {
      const currentStore = await getBindingStore();
      const sessions = await currentStore.list(await resolveScope(req));
      res.json({ sessions });
    }));

    app.post('/api/codex/sessions', run(async (req, res) => {
      const currentStore = await getBindingStore();
      const session = await currentStore.create(await resolveScope(req));
      res.status(201).json({ session });
    }));

    app.get('/api/codex/sessions/:id', run(async (req, res) => {
      const result = await readSession(req);
      if (!requireState(res, result)) return;
      res.json(result);
    }));

    app.get('/api/codex/sessions/:id/messages', run(async (req, res) => {
      const result = await readSession(req);
      if (!requireState(res, result)) return;
      res.json({ revision: result.state.revision, transcript: result.state.transcript });
    }));

    app.get('/api/codex/sessions/:id/status', run(async (req, res) => {
      const result = await readSession(req);
      if (!requireState(res, result)) return;
      const { revision, status, activeTurn, failure, recovery } = result.state;
      res.json({ revision, status, activeTurn, failure, recovery });
    }));

    app.post('/api/codex/sessions/:id/prompt', run(async (req, res) => {
      const body = req.body;
      const allowed = new Set(['directory', 'requestId', 'text']);
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).some((key) => !allowed.has(key)) ||
        typeof body.requestId !== 'string' || typeof body.text !== 'string') {
        const error = new Error('Codex turn request is invalid');
        error.code = 'invalid-turn-request';
        throw error;
      }
      const scope = await resolveScope(req);
      const currentStore = await getBindingStore();
      const binding = await currentStore.get({ sessionId: req.params.id, ...scope });
      const accepted = await codexRuntime.startTurn(binding, {
        requestId: body.requestId,
        text: body.text,
        bindThread: ({ threadId }) => currentStore.bindThread({
          sessionId: binding.sessionId,
          ...scope,
          target: CODEX_TARGET,
          threadId,
        }),
      });
      res.status(202).json(accepted);
    }));

    app.post('/api/codex/sessions/:id/approvals/:requestId/reply', run(async (req, res) => {
      const body = req.body;
      const allowed = new Set(['directory', 'decision', 'threadId', 'turnId']);
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).some((key) => !allowed.has(key)) ||
        !['once', 'reject'].includes(body.decision) ||
        typeof body.threadId !== 'string' || typeof body.turnId !== 'string') {
        const error = new Error('Codex approval reply is invalid');
        error.code = body?.decision === 'always' ? 'invalid-approval-decision' : 'invalid-approval-request';
        throw error;
      }
      const scope = await resolveScope(req);
      const currentStore = await getBindingStore();
      const binding = await currentStore.get({ sessionId: req.params.id, ...scope });
      const result = await codexRuntime.replyApproval(binding, {
        requestId: req.params.requestId,
        decision: body.decision,
        threadId: body.threadId,
        turnId: body.turnId,
      });
      res.json(result);
    }));

    app.post('/api/codex/sessions/:id/abort', run(async (req, res) => {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).some((key) => key !== 'directory')) {
        const error = new Error('Codex abort request is invalid');
        error.code = 'invalid-abort-request';
        throw error;
      }
      const scope = await resolveScope(req);
      const currentStore = await getBindingStore();
      const binding = await currentStore.get({ sessionId: req.params.id, ...scope });
      res.json(await codexRuntime.abort(binding));
    }));
  };

  return {
    eligibility,
    registerRoutes,
    shutdown: () => codexRuntime.shutdown(),
  };
};
