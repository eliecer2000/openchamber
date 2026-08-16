import { execFile as execFileCallback } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import express from 'express';

import { CodexAppServerSession } from './app-server-session.js';
import { CodexBindingStore } from './binding-store.js';
import { createCodexRoutesRuntime } from './routes.js';
import { CodexRuntime } from './runtime.js';
import { createTunnelHost } from '../relay/tunnel-host.js';
import {
  TunnelFrameType,
  decodeJsonPayload,
  decodeTunnelFrame,
  encodeJsonPayload,
  encodeTunnelFrame,
} from '../relay/tunnel-codec.js';

const execFile = promisify(execFileCallback);
const POLL_INTERVAL_MS = 40;
const MAX_DIAGNOSTIC_EVENTS = 256;

const requestAction = (route) => {
  const pathname = new URL(route, 'http://fixture.invalid').pathname;
  if (pathname.endsWith('/prompt')) return 'prompt';
  if (pathname.includes('/approvals/')) return 'approval.reply';
  if (pathname.endsWith('/abort')) return 'abort';
  if (pathname.endsWith('/messages')) return 'projection.read';
  if (pathname.endsWith('/sessions')) return 'session.create';
  return 'other';
};

const notificationDiagnostic = (frame) => {
  const item = frame?.params?.item;
  const changes = Array.isArray(frame?.params?.changes)
    ? frame.params.changes
    : (Array.isArray(item?.changes) ? item.changes : []);
  return {
    kind: Object.hasOwn(frame ?? {}, 'id') ? 'server-request' : 'notification',
    method: typeof frame?.method === 'string' ? frame.method : 'invalid',
    ...(typeof item?.type === 'string' ? { itemType: item.type } : {}),
    ...(typeof item?.status === 'string' ? { itemStatus: item.status } : {}),
    changeCount: changes.length,
    nonEmptyPatchCount: changes.filter((change) => typeof change?.diff === 'string' && change.diff.length > 0).length,
  };
};

class HttpFailure extends Error {
  constructor(status, body) {
    super(`Fixture HTTP request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    server.off('error', reject);
    resolve();
  });
});

const closeServer = (server) => new Promise((resolve, reject) => {
  if (!server?.listening) return resolve();
  server.close((error) => error ? reject(error) : resolve());
});

const initializeRepository = async (directory) => {
  await mkdir(directory, { recursive: true });
  await execFile('git', ['init', '--quiet'], { cwd: directory });
  await execFile('git', ['config', 'user.name', 'OpenChamber WU12'], { cwd: directory });
  await execFile('git', ['config', 'user.email', 'wu12@openchamber.invalid'], { cwd: directory });
  await writeFile(path.join(directory, 'fixture.txt'), 'BASELINE\n');
  await writeFile(path.join(directory, 'edit-fixture.sh'), [
    '#!/bin/sh',
    'set -eu',
    "printf 'WU12_EDIT\\n' > fixture.txt",
    '',
  ].join('\n'));
  await chmod(path.join(directory, 'edit-fixture.sh'), 0o755);
  await execFile('git', ['add', 'fixture.txt', 'edit-fixture.sh'], { cwd: directory });
  await execFile('git', ['commit', '--quiet', '-m', 'fixture baseline'], { cwd: directory });
  return await stat(directory).then(() => directory);
};

const readTree = async (root) => {
  const values = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile()) values.push(await readFile(target, 'utf8').catch(() => ''));
    }
  };
  if (existsSync(root)) await visit(root);
  return values.join('\n');
};

class RelayHttpTransport {
  constructor({ getPort, token }) {
    this.token = token;
    this.nextStreamId = 1;
    this.pending = new Map();
    this.host = createTunnelHost({
      connectionId: 'wu12-relay',
      getLocalPort: getPort,
      getBufferedAmount: () => 0,
      sendFrame: (frame) => this.receive(frame),
    });
  }

  receive(bytes) {
    const frame = decodeTunnelFrame(bytes);
    const pending = this.pending.get(frame.streamId);
    if (!pending) return;
    if (frame.frameType === TunnelFrameType.HttpResponse) {
      pending.response = decodeJsonPayload(frame.payload, (value) => value);
    } else if (frame.frameType === TunnelFrameType.HttpBody) {
      pending.body.push(Buffer.from(frame.payload));
    } else if (frame.frameType === TunnelFrameType.StreamAbort) {
      this.pending.delete(frame.streamId);
      pending.reject(new Error('Relayed fixture request was aborted'));
    } else if (frame.frameType === TunnelFrameType.StreamEnd) {
      this.pending.delete(frame.streamId);
      const text = Buffer.concat(pending.body).toString('utf8');
      const body = text ? JSON.parse(text) : null;
      const status = pending.response?.status ?? 500;
      if (status < 200 || status >= 300) pending.reject(new HttpFailure(status, body));
      else pending.resolve(body);
    }
  }

  request(route, { method = 'GET', body } = {}) {
    const streamId = this.nextStreamId++;
    const url = new URL(route, 'http://relay.invalid');
    const serialized = body === undefined ? null : Buffer.from(JSON.stringify(body));
    const result = new Promise((resolve, reject) => {
      this.pending.set(streamId, { resolve, reject, response: null, body: [] });
    });
    void (async () => {
      await this.host.handleFrame(encodeTunnelFrame(TunnelFrameType.HttpRequest, streamId, encodeJsonPayload({
        method,
        path: url.pathname,
        query: url.searchParams.toString(),
        hasBody: serialized !== null,
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${this.token}`,
          ...(serialized ? { 'content-type': 'application/json' } : {}),
        },
      })));
      if (serialized) {
        await this.host.handleFrame(encodeTunnelFrame(TunnelFrameType.HttpBody, streamId, serialized));
      }
      if (method !== 'GET' && method !== 'HEAD') {
        await this.host.handleFrame(encodeTunnelFrame(TunnelFrameType.StreamEnd, streamId, new Uint8Array(0)));
      }
    })().catch((error) => {
      const pending = this.pending.get(streamId);
      this.pending.delete(streamId);
      pending?.reject(error);
    });
    return result;
  }

  close() {
    this.host.close();
    for (const pending of this.pending.values()) pending.reject(new Error('Relay fixture closed'));
    this.pending.clear();
  }
}

export const createCodexEngineFixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'openchamber-codex-wu12-'));
  const dataDirectory = path.join(root, 'data');
  const workspaces = {
    primary: await initializeRepository(path.join(root, 'primary')),
    secondary: await initializeRepository(path.join(root, 'secondary')),
  };
  const token = randomBytes(24).toString('base64url');
  const bindingStore = new CodexBindingStore({ dataDirectory, serverId: 'wu12-server' });
  const subscribers = new Set();
  const sessions = new Set();
  let listener = null;
  let runtime = null;
  let routes = null;
  let openCodeFallbackHits = 0;
  let cleaned = false;
  const diagnostics = [];
  const recordDiagnostic = (event) => {
    if (diagnostics.length < MAX_DIAGNOSTIC_EVENTS) diagnostics.push(event);
  };

  const canonicalWorkspace = (candidate) => Object.values(workspaces).find((value) => value === candidate) ?? null;
  const scopeFor = (directory) => ({
    directory,
    authoritativeDirectory: directory,
    runtimeId: 'web',
  });

  const startServer = async () => {
    runtime = new CodexRuntime({
      idleMs: 10 * 60 * 1000,
      createSession: (options) => {
        const session = new CodexAppServerSession({
          ...options,
          onNotification: (frame) => {
            recordDiagnostic(notificationDiagnostic(frame));
            options.onNotification(frame);
          },
          onRequest: (frame) => {
            recordDiagnostic(notificationDiagnostic(frame));
            options.onRequest(frame);
          },
        });
        const control = session.control.bind(session);
        const turn = session.turn.bind(session);
        session.control = (method, ...args) => {
          recordDiagnostic({ kind: 'client-request', method });
          return control(method, ...args);
        };
        session.turn = (method, ...args) => {
          recordDiagnostic({ kind: 'client-request', method });
          return turn(method, ...args);
        };
        sessions.add(session);
        return session;
      },
      broadcastProjection: (event) => {
        for (const subscriber of subscribers) subscriber.push(structuredClone(event));
      },
    });
    routes = createCodexRoutesRuntime({
      runtimeDescriptor: { runtimeName: 'web', apiOnly: false },
      bindingStore,
      codexRuntime: runtime,
      resolveProjectDirectory: async (req) => canonicalWorkspace(req.body?.directory ?? req.query?.directory),
    });
    const app = express();
    app.use(express.json({ limit: '64kb' }));
    app.use('/api', (req, res, next) => {
      if (req.headers.authorization !== `Bearer ${token}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next();
    });
    routes.registerRoutes(app);
    app.use('/api', (req, res) => {
      openCodeFallbackHits += 1;
      res.status(599).json({ error: 'OpenCode fallback reached' });
    });
    listener = http.createServer(app);
    await listen(listener);
  };

  await startServer();
  const relay = new RelayHttpTransport({
    token,
    getPort: () => listener.address().port,
  });

  const request = async (transport, route, options) => {
    const action = requestAction(route);
    try {
      if (transport === 'relay') return await relay.request(route, options);
      const address = listener.address();
      const response = await fetch(`http://127.0.0.1:${address.port}${route}`, {
        method: options?.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options?.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new HttpFailure(response.status, body);
      return body;
    } catch (error) {
      recordDiagnostic({
        kind: 'http-error', action, transport,
        status: Number.isInteger(error?.status) ? error.status : null,
        code: typeof error?.body?.code === 'string' ? error.body.code : 'unknown',
      });
      throw error;
    }
  };

  const waitForProjection = async (sessionId, predicate, timeoutMs) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const snapshot = runtime?.projectionSnapshot(sessionId);
      if (snapshot && predicate(snapshot)) return snapshot;
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error('Timed out waiting for Codex projection');
  };

  const listBindings = async () => (await Promise.all(Object.values(workspaces)
    .map((directory) => bindingStore.list(scopeFor(directory))))).flat();

  const residualProcesses = () => [...sessions].filter((session) => {
    const child = session.child;
    return child && child.exitCode === null && child.signalCode === null;
  }).length;

  const fixture = {
    workspaces,
    get openCodeFallbackHits() { return openCodeFallbackHits; },
    protocolTrace() { return structuredClone(diagnostics); },
    connectBrowser() {
      const events = [];
      subscribers.add(events);
      return events;
    },
    disconnectBrowser(events) { subscribers.delete(events); },
    snapshot(sessionId) { return runtime.projectionSnapshot(sessionId); },
    waitForProjection,
    async createSession(transport, directory) {
      const result = await request(transport, '/api/codex/sessions', {
        method: 'POST', body: { directory },
      });
      return result.session;
    },
    prompt(transport, sessionId, directory, text) {
      return request(transport, `/api/codex/sessions/${sessionId}/prompt`, {
        method: 'POST', body: { directory, requestId: `req-${randomBytes(8).toString('hex')}`, text },
      });
    },
    getProjection(transport, sessionId, directory) {
      return request(transport,
        `/api/codex/sessions/${sessionId}/messages?directory=${encodeURIComponent(directory)}`);
    },
    getReplay(transport, sessionId, directory, revision) {
      return request(transport,
        `/api/codex/sessions/${sessionId}/messages?directory=${encodeURIComponent(directory)}&afterRevision=${revision}`);
    },
    replyApproval(transport, sessionId, directory, requestId, decision) {
      return request(transport, `/api/codex/sessions/${sessionId}/approvals/${requestId}/reply`, {
        method: 'POST', body: { directory, ...decision },
      });
    },
    abort(transport, sessionId, directory) {
      return request(transport, `/api/codex/sessions/${sessionId}/abort`, {
        method: 'POST', body: { directory },
      });
    },
    async restartServer() {
      await closeServer(listener);
      await routes.shutdown();
      listener = null;
      runtime = null;
      routes = null;
      await startServer();
    },
    async recoverCompleted(sessionId, directory) {
      const binding = await bindingStore.get({ sessionId, ...scopeFor(directory) });
      return runtime.recoverCompleted({ ...binding, lastCompletedAt: new Date().toISOString() });
    },
    async archiveThreads() {
      const threadIds = [...new Set((await listBindings()).map((binding) => binding.threadId).filter(Boolean))];
      const controller = [...sessions].find((session) => session.state === 'ready');
      if (!controller || threadIds.length === 0) return { outcome: 'unsupported-protocol-limitation', count: 0 };
      let count = 0;
      try {
        for (const threadId of threadIds) {
          await controller.control('thread/archive', { threadId });
          count += 1;
        }
        return { outcome: 'passed', count };
      } catch (error) {
        if (error?.code === -32601 || error?.code === 'method-not-found') {
          return { outcome: 'unsupported-protocol-limitation', count };
        }
        throw error;
      }
    },
    async gitDiff(directory) {
      return (await execFile('git', ['diff', '--', 'fixture.txt'], { cwd: directory })).stdout;
    },
    exists(target) { return existsSync(target); },
    async containsSensitivePersistence() {
      const persisted = await readTree(dataDirectory);
      return persisted.includes(token)
        || persisted.includes('WU12_STREAM_COMPLETE')
        || persisted.includes('Reply with exactly')
        || persisted.includes('authorization');
    },
    resourceState() {
      return {
        browserSubscribers: subscribers.size,
        listenerOpen: listener?.listening === true,
        relayStreams: relay.host.streamCount,
        residualProcesses: residualProcesses(),
        temporaryRootExists: existsSync(root),
      };
    },
    async cleanup() {
      if (cleaned) return;
      cleaned = true;
      subscribers.clear();
      relay.close();
      await closeServer(listener).catch(() => {});
      await routes?.shutdown().catch(() => {});
      listener = null;
      runtime = null;
      routes = null;
      await rm(root, { recursive: true, force: true });
    },
  };

  return fixture;
};
