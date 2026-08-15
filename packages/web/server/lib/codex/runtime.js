import { CodexAppServerSession } from './app-server-session.js';

const DEFAULT_IDLE_MS = 30 * 60 * 1000;
const DEFAULT_REPLAY_EVENTS = 256;
const STATUSES = new Set(['idle', 'starting', 'running', 'waiting_approval', 'interrupting', 'failed']);
const TERMINAL_TURNS = new Set(['completed', 'interrupted', 'failed']);

class CodexRuntimeStateError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CodexRuntimeStateError';
    this.code = code;
  }
}

const fail = (code, message) => { throw new CodexRuntimeStateError(code, message); };
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isId = (value) => typeof value === 'string' && value.length > 0 && !/[\r\n]/.test(value);
const clone = (value) => structuredClone(value);

class ReplayBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.values = new Array(capacity);
    this.start = 0;
    this.size = 0;
  }

  push(value) {
    const index = (this.start + this.size) % this.capacity;
    this.values[index] = value;
    if (this.size < this.capacity) this.size += 1;
    else this.start = (this.start + 1) % this.capacity;
  }

  clear() {
    this.values = new Array(this.capacity);
    this.start = 0;
    this.size = 0;
  }

  firstRevision() {
    return this.size === 0 ? null : this.values[this.start].revision;
  }

  after(revision) {
    const result = [];
    for (let offset = 0; offset < this.size; offset += 1) {
      const value = this.values[(this.start + offset) % this.capacity];
      if (value.revision > revision) result.push(clone(value));
    }
    return result;
  }
}

const createMemory = () => ({
  revision: 0,
  status: 'starting',
  transcript: { state: 'live', items: [] },
  pendingApprovals: new Map(),
  activeTurn: null,
  failure: null,
  recovery: { kind: 'memory' },
});

const publicSnapshot = (memory) => ({
  revision: memory.revision,
  status: memory.status,
  transcript: clone(memory.transcript),
  pendingApprovals: clone([...memory.pendingApprovals.values()]),
  activeTurn: clone(memory.activeTurn),
  failure: clone(memory.failure),
  recovery: clone(memory.recovery),
});

const validateSnapshot = (snapshot) => {
  if (!isObject(snapshot) || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 ||
    !STATUSES.has(snapshot.status) || !isObject(snapshot.transcript) ||
    !['live', 'complete'].includes(snapshot.transcript.state) || !Array.isArray(snapshot.transcript.items) ||
    !Array.isArray(snapshot.pendingApprovals) ||
    !(snapshot.activeTurn === null || isObject(snapshot.activeTurn))) {
    fail('invalid-snapshot', 'Codex runtime snapshot is invalid');
  }
  const approvals = new Map();
  for (const approval of snapshot.pendingApprovals) {
    if (!isObject(approval) || !isId(approval.requestId)) fail('invalid-snapshot', 'Codex runtime snapshot is invalid');
    approvals.set(approval.requestId, clone(approval));
  }
  return {
    revision: snapshot.revision,
    status: snapshot.status,
    transcript: clone(snapshot.transcript),
    pendingApprovals: approvals,
    activeTurn: clone(snapshot.activeTurn),
    failure: null,
    recovery: { kind: 'memory' },
  };
};

export class CodexRuntime {
  constructor({
    createSession = (options) => new CodexAppServerSession(options),
    idleMs = DEFAULT_IDLE_MS,
    maxReplayEvents = DEFAULT_REPLAY_EVENTS,
  } = {}) {
    if (!Number.isSafeInteger(maxReplayEvents) || maxReplayEvents <= 0) {
      throw new TypeError('maxReplayEvents must be a positive safe integer');
    }
    this.createSession = createSession;
    this.idleMs = idleMs;
    this.maxReplayEvents = maxReplayEvents;
    this.entries = new Map();
  }

  async open(sessionId, directory) {
    const existing = this.entries.get(sessionId);
    if (existing) {
      if (existing.status === 'failed') throw existing.error;
      return existing.session;
    }
    const entry = {
      session: null,
      status: 'starting',
      error: null,
      active: false,
      idleTimer: null,
      disposal: null,
      memory: createMemory(),
      replay: new ReplayBuffer(this.maxReplayEvents),
    };
    const session = this.createSession({
      directory,
      onExit: (error) => this.handleExit(sessionId, error),
    });
    entry.session = session;
    this.entries.set(sessionId, entry);
    try {
      await session.start();
      entry.status = 'ready';
      entry.memory.status = 'idle';
      this.scheduleIdle(sessionId, entry);
      return session;
    } catch (error) {
      entry.status = 'failed';
      entry.error = error;
      entry.memory.status = 'failed';
      entry.memory.transcript = { state: 'failed', items: null };
      entry.memory.failure = { code: 'process-start-failed', message: 'Codex app-server failed to start' };
      entry.memory.recovery = { kind: 'failed' };
      throw error;
    }
  }

  beginTurn(sessionId, turn = null) {
    const entry = this.requireReady(sessionId);
    entry.active = true;
    this.clearIdle(entry);
    if (turn !== null) this.record(sessionId, { type: 'turn.changed', turn });
  }

  completeTurn(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry || entry.status !== 'ready') return;
    entry.active = false;
    if (entry.memory.activeTurn !== null) {
      this.commit(entry, { type: 'turn.changed', turn: null }, () => {
        entry.memory.activeTurn = null;
        entry.memory.status = 'idle';
      });
    }
    this.scheduleIdle(sessionId, entry);
  }

  closeBrowser(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry) return;
    if (!entry.active) this.scheduleIdle(sessionId, entry);
  }

  getState(sessionId) {
    const entry = this.entries.get(sessionId);
    return entry ? { status: entry.status, error: entry.error, memory: publicSnapshot(entry.memory) } : null;
  }

  snapshot(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry) fail('session-not-found', 'Codex session memory was not found');
    return publicSnapshot(entry.memory);
  }

  applySnapshot(sessionId, snapshot) {
    const entry = this.requireReady(sessionId);
    const next = validateSnapshot(snapshot);
    if (next.revision <= entry.memory.revision) {
      return { applied: false, reason: 'stale-snapshot', revision: entry.memory.revision };
    }
    entry.memory = next;
    entry.replay.clear();
    return { applied: true, revision: next.revision };
  }

  record(sessionId, event) {
    const entry = this.requireReady(sessionId);
    if (!isObject(event) || !isId(event.type)) fail('invalid-runtime-event', 'Codex runtime event is invalid');
    let mutate;
    switch (event.type) {
      case 'transcript.append':
        if (!isObject(event.item) || !isId(event.item.id)) fail('invalid-runtime-event', 'Codex runtime event is invalid');
        mutate = () => entry.memory.transcript.items.push(clone(event.item));
        break;
      case 'status.changed':
        if (!STATUSES.has(event.status)) fail('invalid-runtime-event', 'Codex runtime event is invalid');
        mutate = () => { entry.memory.status = event.status; };
        break;
      case 'approval.pending':
        if (!isObject(event.approval) || !isId(event.approval.requestId)) fail('invalid-runtime-event', 'Codex runtime event is invalid');
        mutate = () => entry.memory.pendingApprovals.set(event.approval.requestId, clone(event.approval));
        break;
      case 'approval.resolved':
        if (!isId(event.requestId)) fail('invalid-runtime-event', 'Codex runtime event is invalid');
        mutate = () => entry.memory.pendingApprovals.delete(event.requestId);
        break;
      case 'turn.changed':
        if (!(event.turn === null || (isObject(event.turn) && isId(event.turn.id)))) {
          fail('invalid-runtime-event', 'Codex runtime event is invalid');
        }
        mutate = () => { entry.memory.activeTurn = clone(event.turn); };
        break;
      default:
        return { applied: false, reason: 'unknown-event', revision: entry.memory.revision };
    }
    return this.commit(entry, event, mutate);
  }

  commit(entry, event, mutate) {
    mutate();
    entry.memory.revision += 1;
    entry.replay.push({ revision: entry.memory.revision, event: clone(event) });
    return { applied: true, revision: entry.memory.revision };
  }

  replay(sessionId, afterRevision) {
    const entry = this.entries.get(sessionId);
    if (!entry) fail('session-not-found', 'Codex session memory was not found');
    if (!Number.isSafeInteger(afterRevision) || afterRevision < 0 || afterRevision > entry.memory.revision) {
      fail('invalid-replay-revision', 'Codex replay revision is invalid');
    }
    const first = entry.replay.firstRevision();
    if (afterRevision < entry.memory.revision && (first === null || afterRevision < first - 1)) {
      return { kind: 'snapshot-required', snapshot: publicSnapshot(entry.memory) };
    }
    return {
      kind: 'events',
      fromRevision: afterRevision,
      toRevision: entry.memory.revision,
      events: entry.replay.after(afterRevision),
    };
  }

  async recoverCompleted(binding) {
    if (!isObject(binding) || !isId(binding.sessionId) || !isId(binding.threadId) ||
      !isId(binding.directory) || !isId(binding.lastCompletedAt)) {
      fail('in-flight-recovery-unsupported', 'Codex in-flight turns do not survive server restart');
    }
    try {
      const session = await this.open(binding.sessionId, binding.directory);
      const resumed = await session.control('thread/resume', {
        threadId: binding.threadId,
        cwd: binding.directory,
        excludeTurns: true,
      });
      if (resumed?.thread?.id !== binding.threadId) throw new Error('invalid resume response');
      let read;
      try {
        read = await session.control('thread/read', { threadId: binding.threadId, includeTurns: true });
      } catch (error) {
        if (error?.code === -32601 || error?.code === 'method-not-found') {
          return this.markRecoveryLimited(binding.sessionId, binding.threadId);
        }
        throw error;
      }
      const items = this.readCompletedTranscript(read, binding.threadId);
      const entry = this.requireReady(binding.sessionId);
      this.commit(entry, { type: 'recovery.completed', threadId: binding.threadId }, () => {
        entry.memory.status = 'idle';
        entry.memory.transcript = { state: 'complete', items };
        entry.memory.pendingApprovals.clear();
        entry.memory.activeTurn = null;
        entry.memory.failure = null;
        entry.memory.recovery = { kind: 'recovered', threadId: binding.threadId };
      });
      return { kind: 'recovered', snapshot: publicSnapshot(entry.memory) };
    } catch {
      const entry = this.entries.get(binding.sessionId);
      if (entry) {
        entry.memory.status = 'failed';
        entry.memory.transcript = { state: 'failed', items: null };
        entry.memory.failure = { code: 'recovery-failed', message: 'Codex completed-thread recovery failed' };
        entry.memory.recovery = { kind: 'failed' };
      }
      fail('recovery-failed', 'Codex completed-thread recovery failed');
    }
  }

  readCompletedTranscript(response, threadId) {
    const thread = response?.thread;
    if (!isObject(thread) || thread.id !== threadId || thread.status?.type !== 'idle' ||
      !Array.isArray(thread.turns) || thread.turns.length === 0) {
      throw new Error('invalid thread read response');
    }
    const items = [];
    for (const turn of thread.turns) {
      if (!isObject(turn) || !isId(turn.id) || !TERMINAL_TURNS.has(turn.status) ||
        turn.itemsView !== 'full' || !Array.isArray(turn.items)) throw new Error('incomplete thread history');
      for (const item of turn.items) {
        if (!isObject(item) || !isId(item.id)) throw new Error('invalid thread item');
        items.push({ turnId: turn.id, item: clone(item) });
      }
    }
    return items;
  }

  markRecoveryLimited(sessionId, threadId) {
    const entry = this.requireReady(sessionId);
    const code = 'completed-thread-history-unavailable';
    this.commit(entry, { type: 'recovery.limited', code }, () => {
      entry.memory.status = 'idle';
      entry.memory.transcript = { state: 'unavailable', items: null };
      entry.memory.failure = null;
      entry.memory.recovery = { kind: 'limited', code, threadId };
    });
    return { kind: 'limited', code, snapshot: publicSnapshot(entry.memory) };
  }

  requireReady(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry || entry.status !== 'ready') throw new Error('Codex session is not ready');
    return entry;
  }

  handleExit(sessionId, error) {
    const entry = this.entries.get(sessionId);
    if (!entry) return;
    this.clearIdle(entry);
    entry.active = false;
    entry.status = 'failed';
    entry.error = error;
    this.commit(entry, { type: 'process.failed', code: error?.code ?? 'process-exit' }, () => {
      entry.memory.status = 'failed';
      entry.memory.failure = { code: error?.code ?? 'process-exit', message: 'Codex app-server process failed' };
      entry.memory.recovery = { kind: 'failed' };
    });
  }

  scheduleIdle(sessionId, entry) {
    if (entry.active || entry.status !== 'ready' || entry.idleTimer) return;
    entry.idleTimer = setTimeout(() => {
      entry.idleTimer = null;
      if (!entry.active && entry.status === 'ready') void this.dispose(sessionId);
    }, this.idleMs);
  }

  clearIdle(entry) {
    if (entry.idleTimer) clearTimeout(entry.idleTimer);
    entry.idleTimer = null;
  }

  dispose(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry) return Promise.resolve();
    if (entry.disposal) return entry.disposal;
    this.clearIdle(entry);
    entry.disposal = Promise.resolve(entry.session.shutdown()).finally(() => {
      if (this.entries.get(sessionId) === entry) this.entries.delete(sessionId);
    });
    return entry.disposal;
  }

  async shutdown() {
    await Promise.all([...this.entries.keys()].map((sessionId) => this.dispose(sessionId)));
  }
}
