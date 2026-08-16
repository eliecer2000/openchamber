import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

import { createCodexRoutesRuntime } from './routes.js';

const SESSION_ID = 'ses_codex_00000000-0000-0000-0000-000000000001';
const WORKSPACE = '/workspace';

const createHarness = ({
  runtimeName = 'web',
  apiOnly = false,
  bindingStore = {},
  codexRuntime = {},
  resolveProjectDirectory = async () => ({ directory: WORKSPACE, error: null }),
} = {}) => {
  const app = express();
  const proxy = vi.fn((_req, res) => res.status(599).json({ proxied: true }));
  app.use(express.json());
  app.use('/api', (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid') return next();
    return res.status(401).json({ error: 'Authentication required' });
  });
  const routes = createCodexRoutesRuntime({
    runtimeName,
    apiOnly,
    bindingStore,
    codexRuntime,
    resolveProjectDirectory,
  });
  routes.registerRoutes(app);
  app.use('/api', proxy);
  return { app, proxy, routes };
};

describe('Codex Web Server routes', () => {
  it.each([
    'desktop',
    'vscode',
    'hosted-mobile',
    'mobile-capacitor',
  ])('rejects unsupported %s runtimes even when the request spoofs a web surface', async (runtimeName) => {
    const { app, proxy } = createHarness({ runtimeName });

    const response = await request(app)
      .get('/api/codex/capabilities?surface=web')
      .set('Authorization', 'Bearer valid')
      .set('X-OpenChamber-Surface', 'web')
      .expect(501);

    expect(response.body).toEqual({ available: false, reason: 'unsupported-runtime' });
    expect(proxy).not.toHaveBeenCalled();
  });

  it('freezes launch eligibility and does not let later descriptor mutation grant access', async () => {
    const descriptor = { runtimeName: 'desktop', apiOnly: false };
    const routes = createCodexRoutesRuntime({ runtimeDescriptor: descriptor });
    descriptor.runtimeName = 'web';
    const app = express();
    routes.registerRoutes(app);

    const response = await request(app)
      .get('/api/codex/capabilities?surface=web')
      .expect(501);

    expect(response.body).toEqual({ available: false, reason: 'unsupported-runtime' });
    expect(Object.isFrozen(routes.eligibility)).toBe(true);
  });

  it('requires valid API authentication before capability evaluation or proxy fallback', async () => {
    const { app, proxy } = createHarness();

    await request(app).get('/api/codex/capabilities').expect(401);
    await request(app)
      .get('/api/codex/capabilities')
      .set('Authorization', 'Bearer invalid')
      .expect(401);

    expect(proxy).not.toHaveBeenCalled();
  });

  it('serves the authenticated web capability before the generic OpenCode proxy', async () => {
    const { app, proxy } = createHarness();

    const capability = await request(app)
      .get('/api/codex/capabilities')
      .set('Authorization', 'Bearer valid')
      .expect(200);
    const openCode = await request(app)
      .get('/api/session')
      .set('Authorization', 'Bearer valid')
      .expect(599);

    expect(capability.body).toEqual({
      available: true,
      harnessId: 'codex',
      target: { harnessId: 'codex', modelRef: { kind: 'default' } },
    });
    expect(openCode.body).toEqual({ proxied: true });
    expect(proxy).toHaveBeenCalledTimes(1);
  });

  it('uses frozen Web authority and production-shaped directory resolution for session listing and creation', async () => {
    const binding = { sessionId: SESSION_ID, directory: WORKSPACE, runtimeId: 'web', threadId: null };
    const bindingStore = {
      list: vi.fn(async () => [binding]),
      create: vi.fn(async () => binding),
    };
    const { app } = createHarness({ bindingStore });

    const listed = await request(app)
      .get('/api/codex/sessions?directory=%2Fworkspace&runtimeId=desktop')
      .set('Authorization', 'Bearer valid')
      .expect(200);
    const created = await request(app)
      .post('/api/codex/sessions')
      .set('Authorization', 'Bearer valid')
      .send({ directory: WORKSPACE, runtimeId: 'desktop', surface: 'web' })
      .expect(201);

    expect(listed.body).toEqual({ sessions: [binding] });
    expect(created.body).toEqual({ session: binding });
    expect(bindingStore.list).toHaveBeenCalledWith({
      directory: WORKSPACE,
      authoritativeDirectory: WORKSPACE,
      runtimeId: 'web',
    });
    expect(bindingStore.create).toHaveBeenCalledWith({
      directory: WORKSPACE,
      authoritativeDirectory: WORKSPACE,
      runtimeId: 'web',
    });
  });

  it('keeps failed structured directory resolution private and rejects session creation', async () => {
    const bindingStore = { create: vi.fn() };
    const { app } = createHarness({
      bindingStore,
      resolveProjectDirectory: async () => ({
        directory: null,
        error: 'Access to /private/secret-workspace denied',
      }),
    });

    const response = await request(app)
      .post('/api/codex/sessions')
      .set('Authorization', 'Bearer valid')
      .send({ directory: WORKSPACE })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Codex project directory is required',
      code: 'invalid-directory',
    });
    expect(JSON.stringify(response.body)).not.toContain('/private/secret-workspace');
    expect(bindingStore.create).not.toHaveBeenCalled();
  });

  it('exposes only authoritative server memory for session, messages, and status reads', async () => {
    const binding = { sessionId: SESSION_ID, directory: WORKSPACE, runtimeId: 'web', threadId: null };
    const memory = {
      revision: 3,
      status: 'running',
      transcript: { state: 'live', items: [{ id: 'message-1' }] },
      pendingApprovals: [],
      activeTurn: { id: 'turn-1' },
      failure: null,
      recovery: { kind: 'memory' },
    };
    const bindingStore = { get: vi.fn(async () => binding) };
    const projection = {
      engine: 'codex', sessionID: SESSION_ID, revision: 3,
      messages: [{ id: 'message-1' }], parts: [{ id: 'part-1', messageID: 'message-1' }],
      status: 'running', pendingApprovals: [], diff: [], activeTurn: { id: 'turn-1' },
      failure: null, recovery: { kind: 'memory' },
    };
    const codexRuntime = {
      getState: vi.fn(() => ({ status: 'ready', error: null, memory })),
      projectionSnapshot: vi.fn(() => projection),
      replay: vi.fn(() => ({ kind: 'events', fromRevision: 2, toRevision: 3, events: [{ revision: 3 }] })),
    };
    const { app } = createHarness({ bindingStore, codexRuntime });
    const auth = { Authorization: 'Bearer valid' };

    const session = await request(app).get(`/api/codex/sessions/${SESSION_ID}`).set(auth).expect(200);
    const messages = await request(app).get(`/api/codex/sessions/${SESSION_ID}/messages`).set(auth).expect(200);
    const status = await request(app).get(`/api/codex/sessions/${SESSION_ID}/status`).set(auth).expect(200);

    expect(session.body).toEqual({ session: binding, state: memory });
    expect(messages.body).toEqual(projection);
    expect(status.body).toEqual({
      revision: 3,
      status: 'running',
      activeTurn: { id: 'turn-1' },
      failure: null,
      recovery: { kind: 'memory' },
    });

    const replay = await request(app)
      .get(`/api/codex/sessions/${SESSION_ID}/messages?afterRevision=2`)
      .set(auth)
      .expect(200);
    expect(replay.body).toEqual({ kind: 'events', fromRevision: 2, toRevision: 3, events: [{ revision: 3 }] });
    expect(codexRuntime.replay).toHaveBeenCalledWith(SESSION_ID, 2);
  });

  it('rejects malformed replay revisions and non-absolute authoritative cwd before store access', async () => {
    const bindingStore = { get: vi.fn(async () => ({ sessionId: SESSION_ID })) };
    const codexRuntime = {
      getState: vi.fn(() => ({ status: 'ready', memory: { revision: 0 } })),
      projectionSnapshot: vi.fn(),
    };
    const { app } = createHarness({
      bindingStore,
      codexRuntime,
      resolveProjectDirectory: async () => ({ directory: 'relative/workspace', error: null }),
    });
    const auth = { Authorization: 'Bearer valid' };

    await request(app).get(`/api/codex/sessions/${SESSION_ID}/messages`).set(auth).expect(400);
    expect(bindingStore.get).not.toHaveBeenCalled();

    const absolute = createHarness({
      bindingStore,
      codexRuntime,
      resolveProjectDirectory: async () => ({ directory: WORKSPACE, error: null }),
    });
    await request(absolute.app)
      .get(`/api/codex/sessions/${SESSION_ID}/messages?afterRevision=1.5`)
      .set(auth)
      .expect(400);
    expect(codexRuntime.projectionSnapshot).not.toHaveBeenCalled();
  });

  it('keeps missing authoritative memory explicit instead of returning idle or empty state', async () => {
    const bindingStore = { get: vi.fn(async () => ({ sessionId: SESSION_ID, directory: WORKSPACE })) };
    const codexRuntime = { getState: vi.fn(() => null) };
    const { app } = createHarness({ bindingStore, codexRuntime });

    const response = await request(app)
      .get(`/api/codex/sessions/${SESSION_ID}/status`)
      .set('Authorization', 'Bearer valid')
      .expect(409);

    expect(response.body).toEqual({ error: 'Codex session has not started', code: 'session-not-started' });
  });

  it('starts a Codex turn only from the authoritative binding and rejects OpenCode fields', async () => {
    const binding = { sessionId: SESSION_ID, directory: WORKSPACE, runtimeId: 'web', threadId: 'thread-1' };
    const bindingStore = {
      get: vi.fn(async () => binding),
      bindThread: vi.fn(),
    };
    const accepted = { requestId: 'request-1', threadId: 'thread-1', turnId: 'turn-1', revision: 2 };
    const codexRuntime = { startTurn: vi.fn(async () => accepted) };
    const { app, proxy } = createHarness({ bindingStore, codexRuntime });
    const route = `/api/codex/sessions/${SESSION_ID}/prompt`;
    const auth = { Authorization: 'Bearer valid' };

    await request(app).post(route).set(auth).send({
      requestId: 'request-leak', text: 'hello', providerID: 'openai', modelID: 'gpt',
    }).expect(400);
    const response = await request(app).post(route).set(auth).send({ requestId: 'request-1', text: 'hello' }).expect(202);

    expect(response.body).toEqual(accepted);
    expect(codexRuntime.startTurn).toHaveBeenCalledWith(binding, {
      requestId: 'request-1',
      text: 'hello',
      bindThread: expect.any(Function),
    });
    expect(proxy).not.toHaveBeenCalled();
  });

  it('routes only once/reject approval decisions through authoritative scope', async () => {
    const binding = { sessionId: SESSION_ID, directory: WORKSPACE, runtimeId: 'web', threadId: 'thread-1' };
    const bindingStore = { get: vi.fn(async () => binding) };
    const result = { requestId: '91', decision: 'reject', revision: 4, pendingApprovals: [] };
    const codexRuntime = { replyApproval: vi.fn(async () => result) };
    const { app } = createHarness({ bindingStore, codexRuntime });
    const route = `/api/codex/sessions/${SESSION_ID}/approvals/91/reply`;
    const auth = { Authorization: 'Bearer valid' };

    await request(app).post(route).set(auth).send({
      directory: WORKSPACE, decision: 'always', threadId: 'thread-1', turnId: 'turn-1',
    }).expect(400);
    const response = await request(app).post(route).set(auth).send({
      directory: WORKSPACE, decision: 'reject', threadId: 'thread-1', turnId: 'turn-1',
    }).expect(200);

    expect(response.body).toEqual(result);
    expect(codexRuntime.replyApproval).toHaveBeenCalledWith(binding, {
      requestId: '91', decision: 'reject', threadId: 'thread-1', turnId: 'turn-1',
    });
  });

  it('routes abort through the authoritative Codex binding without OpenCode fallback', async () => {
    const binding = { sessionId: SESSION_ID, directory: WORKSPACE, runtimeId: 'web', threadId: 'thread-1' };
    const bindingStore = { get: vi.fn(async () => binding) };
    const result = { outcome: 'interrupted', status: 'idle', revision: 8 };
    const codexRuntime = { abort: vi.fn(async () => result) };
    const { app, proxy } = createHarness({ bindingStore, codexRuntime });

    const response = await request(app)
      .post(`/api/codex/sessions/${SESSION_ID}/abort`)
      .set('Authorization', 'Bearer valid')
      .send({ directory: WORKSPACE })
      .expect(200);

    expect(response.body).toEqual(result);
    expect(codexRuntime.abort).toHaveBeenCalledWith(binding);
    expect(proxy).not.toHaveBeenCalled();
  });
});
