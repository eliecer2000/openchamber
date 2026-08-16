import { CodexAppServerSession } from './app-server-session.js';
import { parseCodexTurnDiff, translateCodexEvent } from './event-translator.js';

const DEFAULT_IDLE_MS = 30 * 60 * 1000;
const DEFAULT_REPLAY_EVENTS = 256;
const MAX_DEDUPE_RECORDS = 128;
const MAX_PROJECTED_DIFF_BYTES = 8 * 1024 * 1024;
const MAX_PROJECTED_DIFF_FILES = 512;
const STATUSES = new Set(['idle', 'starting', 'running', 'waiting_approval', 'interrupting', 'failed']);
const TERMINAL_TURNS = new Set(['completed', 'interrupted', 'failed']);
const APPROVAL_METHODS = new Map([
  ['item/commandExecution/requestApproval', 'bash'],
  ['item/fileChange/requestApproval', 'edit'],
]);
const ACTIVE_ITEM_STATUSES = new Set(['inProgress', 'pending', 'running']);

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
const replaceById = (values, value) => {
  const index = values.findIndex((candidate) => candidate.id === value.id);
  if (index < 0) values.push(clone(value));
  else values[index] = clone(value);
};
const upsertProjectionPart = (values, value) => {
  const index = values.findIndex((candidate) => candidate.id === value.id);
  if (index < 0) {
    values.push(clone(value));
    return;
  }
  const existing = values[index];
  const next = clone(value);
  if (typeof existing.text === 'string' && existing.text && next.text === '') next.text = existing.text;
  if (isObject(existing.state) && isObject(next.state) && typeof existing.state.output === 'string' &&
    (!Object.hasOwn(next.state, 'output') || next.state.output === '')) {
    next.state = { ...next.state, output: existing.state.output };
  }
  values[index] = next;
};
const textInput = (text) => [{ type: 'text', text, text_elements: [] }];
const terminalizeItem = (value) => {
  const next = clone(value);
  const item = isObject(next.item) ? next.item : next;
  if (ACTIVE_ITEM_STATUSES.has(item.status)) item.status = 'interrupted';
  if (isObject(item.state) && ACTIVE_ITEM_STATUSES.has(item.state.status)) {
    item.state = { ...item.state, status: 'error', error: 'Interrupted' };
  }
  return next;
};
const terminalizeProjectionParts = (parts) => parts
  .filter((part) => isObject(part.state) && ACTIVE_ITEM_STATUSES.has(part.state.status))
  .map(terminalizeItem);

const readAuthoritativeWorkingTreeDiff = async (directory) => {
  const { getDiff, getUntrackedDiffs, listUntrackedPaths } = await import('../git/service.js');
  const [unstaged, staged, untrackedPaths] = await Promise.all([
    getDiff(directory),
    getDiff(directory, { staged: true }),
    listUntrackedPaths(directory),
  ]);
  if (untrackedPaths.length > MAX_PROJECTED_DIFF_FILES) {
    throw new Error('Codex working-tree projection exceeded the file limit');
  }
  const untracked = await getUntrackedDiffs(directory, untrackedPaths);
  const patches = [unstaged, staged, ...untracked].filter((patch) => typeof patch === 'string' && patch.length > 0);
  if (patches.reduce((bytes, patch) => bytes + Buffer.byteLength(patch), 0) > MAX_PROJECTED_DIFF_BYTES) {
    throw new Error('Codex working-tree projection exceeded the byte limit');
  }
  return patches.flatMap(parseCodexTurnDiff);
};

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
  projection: { messages: [], parts: [], diff: [] },
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

const projectionSnapshot = (sessionId, memory) => ({
  engine: 'codex',
  sessionID: sessionId,
  revision: memory.revision,
  messages: clone(memory.projection.messages),
  parts: clone(memory.projection.parts),
  status: memory.status,
  pendingApprovals: clone([...memory.pendingApprovals.values()]),
  diff: clone(memory.projection.diff),
  activeTurn: clone(memory.activeTurn),
  failure: clone(memory.failure),
  recovery: clone(memory.recovery),
});

const validateProjectionChange = (change) => {
  if (!isObject(change) || !isId(change.kind)) return false;
  if (change.kind === 'message.upsert' || change.kind === 'message.error') {
    return isObject(change.message) && isId(change.message.id);
  }
  if (change.kind === 'part.upsert') {
    return isObject(change.part) && isId(change.part.id) && isId(change.part.messageID);
  }
  if (change.kind === 'part.delta') {
    return isId(change.messageID) && isId(change.partID) && ['text', 'output'].includes(change.field)
      && typeof change.delta === 'string';
  }
  if (change.kind === 'tool.output.delta') {
    return isId(change.messageID) && isId(change.partID) && typeof change.delta === 'string';
  }
  if (change.kind === 'session.status') return STATUSES.has(change.status);
  if (change.kind === 'session.diff') return Array.isArray(change.diff);
  if (change.kind === 'approval.pending') return isObject(change.approval) && isId(change.approval.id);
  if (change.kind === 'approval.resolved') return isId(change.requestId);
  if (change.kind === 'turn.changed') {
    return change.turn === null || (isObject(change.turn) && isId(change.turn.id));
  }
  return false;
};

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
    projection: { messages: [], parts: [], diff: [] },
  };
};

export class CodexRuntime {
  constructor({
    createSession = (options) => new CodexAppServerSession(options),
    broadcastProjection = () => undefined,
    readWorkingTreeDiff = readAuthoritativeWorkingTreeDiff,
    idleMs = DEFAULT_IDLE_MS,
    maxReplayEvents = DEFAULT_REPLAY_EVENTS,
  } = {}) {
    if (!Number.isSafeInteger(maxReplayEvents) || maxReplayEvents <= 0) {
      throw new TypeError('maxReplayEvents must be a positive safe integer');
    }
    this.createSession = createSession;
    this.broadcastProjection = broadcastProjection;
    this.readWorkingTreeDiff = readWorkingTreeDiff;
    this.idleMs = idleMs;
    this.maxReplayEvents = maxReplayEvents;
    this.entries = new Map();
    this.projectionMetrics = {
      translated: 0,
      rejected: 0,
      published: 0,
      broadcastFailures: 0,
      droppedClients: 0,
      replayMisses: 0,
    };
  }

  async open(sessionId, directory) {
    const existing = this.entries.get(sessionId);
    if (existing) {
      if (existing.status === 'starting') return existing.opening;
      if (existing.status === 'failed') throw existing.error;
      return existing.session;
    }
    const entry = {
      session: null,
      opening: null,
      status: 'starting',
      error: null,
      active: false,
      idleTimer: null,
      disposal: null,
      cleanupPromise: null,
      processDisposed: false,
      abortClaim: null,
      directory,
      sessionId,
      threadId: null,
      turnRequests: new Map(),
      approvalReplies: new Map(),
      turnDiffObserved: false,
      terminalNotification: null,
      memory: createMemory(),
      replay: new ReplayBuffer(this.maxReplayEvents),
    };
    const session = this.createSession({
      directory,
      onExit: (error) => this.handleExit(sessionId, error),
      onNotification: (notification) => this.handleNotification(sessionId, notification),
      onRequest: (request) => this.handleRequest(sessionId, request),
    });
    entry.session = session;
    this.entries.set(sessionId, entry);
    entry.opening = Promise.resolve().then(() => session.start()).then(() => {
      entry.status = 'ready';
      entry.memory.status = 'idle';
      this.scheduleIdle(sessionId, entry);
      return session;
    }).catch((error) => {
      entry.status = 'failed';
      entry.error = error;
      entry.memory.status = 'failed';
      entry.memory.transcript = { state: 'failed', items: null };
      entry.memory.failure = { code: 'process-start-failed', message: 'Codex app-server failed to start' };
      entry.memory.recovery = { kind: 'failed' };
      throw error;
    });
    return entry.opening;
  }

  async startTurn(binding, { requestId, text, bindThread }) {
    if (!isObject(binding) || !isId(binding.sessionId) || !isId(binding.directory) ||
      !(binding.threadId === null || isId(binding.threadId)) || !isId(requestId) ||
      typeof text !== 'string' || !text.trim() || typeof bindThread !== 'function') {
      fail('invalid-turn-request', 'Codex turn request is invalid');
    }
    await this.open(binding.sessionId, binding.directory);
    const entry = this.requireReady(binding.sessionId);
    if (entry.abortClaim) {
      if (!entry.abortClaim.settled) fail('turn-active', 'Codex session abort is still active');
      if (entry.abortClaim.error) throw entry.abortClaim.error;
      entry.abortClaim = null;
    }
    const prior = entry.turnRequests.get(requestId);
    if (prior) {
      if (prior.text !== text) fail('dedupe-conflict', 'Codex turn request ID was reused with different input');
      return prior.promise;
    }
    if (entry.threadId !== null && entry.threadId !== binding.threadId) {
      fail('binding-conflict', 'Codex session thread binding does not match runtime ownership');
    }
    if (entry.active) fail('turn-active', 'Codex session already has an active turn');

    entry.active = true;
    this.clearIdle(entry);
    const claim = { text, promise: null };
    claim.promise = this.performTurnStart(entry, binding, { requestId, text, bindThread });
    entry.turnRequests.set(requestId, claim);
    return claim.promise;
  }

  async performTurnStart(entry, binding, { requestId, text, bindThread }) {
    try {
      let threadId = binding.threadId;
      if (threadId === null) {
        const started = await entry.session.control('thread/start', {
          cwd: binding.directory,
          approvalPolicy: 'untrusted',
        });
        threadId = started?.thread?.id;
        if (!isId(threadId)) fail('ambiguous-thread-start', 'Codex thread start was not authoritative');
        const stored = await bindThread({ threadId });
        if (stored?.threadId !== threadId) fail('binding-conflict', 'Codex thread binding was not accepted');
      } else if (entry.threadId === null) {
        const resumed = await entry.session.control('thread/resume', {
          threadId,
          cwd: binding.directory,
          excludeTurns: true,
        });
        if (resumed?.thread?.id !== threadId) fail('binding-conflict', 'Codex resumed a different thread');
      }
      entry.threadId = threadId;
      entry.turnDiffObserved = false;
      entry.terminalNotification = null;
      const started = await entry.session.turn('turn/start', { threadId, input: textInput(text) });
      const turnId = started?.turn?.id;
      if (!isId(turnId)) fail('turn-start-ambiguous', 'Codex turn start was not authoritative');
      const committed = this.commit(entry, { type: 'turn.changed', turn: { id: turnId, threadId } }, () => {
        entry.memory.activeTurn = { id: turnId, threadId };
        entry.memory.status = 'running';
      });
      if (entry.turnRequests.size > MAX_DEDUPE_RECORDS) entry.turnRequests.delete(entry.turnRequests.keys().next().value);
      return Object.freeze({ requestId, threadId, turnId, revision: committed.revision });
    } catch (cause) {
      const error = cause?.code === 'binding-conflict' || cause?.code === 'dedupe-conflict'
        ? cause
        : new CodexRuntimeStateError('turn-start-ambiguous', 'Codex turn start outcome is ambiguous');
      throw error;
    }
  }

  handleNotification(sessionId, frame) {
    const entry = this.entries.get(sessionId);
    if (!entry || entry.status !== 'ready' || entry.abortClaim) return;
    const translated = translateCodexEvent(frame, {
      sessionId,
      directory: entry.directory,
      now: Date.now(),
    });
    if (!translated.accepted) {
      this.projectionMetrics.rejected += 1;
      return;
    }
    this.projectionMetrics.translated += 1;
    if (frame.method === 'turn/completed') {
      if (!entry.terminalNotification) {
        entry.terminalNotification = this.publishTerminalNotification(sessionId, entry, frame, translated.changes);
      }
      return entry.terminalNotification;
    }
    this.publishProjection(sessionId, translated.changes);
    if (translated.changes.some((change) => change.kind === 'session.diff')) entry.turnDiffObserved = true;
    if (frame.method === 'turn/started') {
      entry.active = true;
      this.clearIdle(entry);
    } else if (frame.method === 'error' && frame.params?.willRetry !== true) {
      entry.active = false;
      this.scheduleIdle(sessionId, entry);
    }
  }

  async publishTerminalNotification(sessionId, entry, frame, terminalChanges) {
    let diff = null;
    let diffFailure = false;
    if (!entry.turnDiffObserved) {
      try {
        diff = await this.readWorkingTreeDiff(entry.directory);
      } catch {
        diffFailure = true;
      }
    }
    if (this.entries.get(sessionId) !== entry || entry.status !== 'ready' || entry.abortClaim ||
      entry.memory.activeTurn?.id !== frame.params?.turn?.id) {
      return { applied: false, reason: 'stale-terminal', revision: entry.memory.revision };
    }

    const changes = [
      ...(Array.isArray(diff) && diff.length > 0 ? [{ kind: 'session.diff', diff }] : []),
      ...terminalChanges.map((change) => (
        diffFailure && change.kind === 'session.status' ? { ...change, status: 'failed' } : change
      )),
    ];
    const published = this.publishEntry(entry, changes, () => {
      entry.memory.failure = diffFailure
        ? { code: 'diff-read-failed', message: 'Codex working-tree projection failed' }
        : null;
    });
    entry.active = false;
    this.scheduleIdle(sessionId, entry);
    return published;
  }

  publishProjection(sessionId, changes) {
    const entry = this.requireReady(sessionId);
    return this.publishEntry(entry, changes);
  }

  publishEntry(entry, changes, mutate = () => {}) {
    if (!Array.isArray(changes) || changes.length === 0 || changes.some((change) => !validateProjectionChange(change))) {
      fail('invalid-projection', 'Codex projection changes are invalid');
    }
    for (const change of changes) this.applyProjectionChange(entry, change);
    mutate();
    entry.memory.revision += 1;
    const envelope = Object.freeze({
      engine: 'codex',
      sessionID: entry.sessionId,
      revision: entry.memory.revision,
      changes: clone(changes),
    });
    entry.replay.push(envelope);
    this.projectionMetrics.published += 1;

    let broadcastFailed = false;
    try {
      const delivery = this.broadcastProjection(envelope, { directory: entry.directory });
      broadcastFailed = delivery?.failed === true;
      this.projectionMetrics.droppedClients += Number.isSafeInteger(delivery?.dropped) ? delivery.dropped : 0;
    } catch {
      broadcastFailed = true;
    }
    if (broadcastFailed) this.projectionMetrics.broadcastFailures += 1;
    return { applied: true, revision: envelope.revision, broadcastFailed };
  }

  applyProjectionChange(entry, change) {
    const projection = entry.memory.projection;
    if (change.kind === 'message.upsert' || change.kind === 'message.error') {
      replaceById(projection.messages, change.message);
      return;
    }
    if (change.kind === 'part.upsert') {
      upsertProjectionPart(projection.parts, change.part);
      return;
    }
    if (change.kind === 'part.delta' || change.kind === 'tool.output.delta') {
      const index = projection.parts.findIndex((part) => part.id === change.partID && part.messageID === change.messageID);
      if (index < 0) return;
      const part = projection.parts[index];
      if (change.kind === 'part.delta') {
        projection.parts[index] = { ...part, [change.field]: `${part[change.field] ?? ''}${change.delta}` };
      } else {
        projection.parts[index] = {
          ...part,
          state: { ...(isObject(part.state) ? part.state : {}), output: `${part.state?.output ?? ''}${change.delta}` },
        };
      }
      return;
    }
    if (change.kind === 'session.status') entry.memory.status = change.status;
    else if (change.kind === 'session.diff') projection.diff = clone(change.diff);
    else if (change.kind === 'approval.pending') {
      const requestId = change.approval.requestId ?? change.approval.id;
      if (!entry.memory.pendingApprovals.has(requestId)) {
        entry.memory.pendingApprovals.set(requestId, clone(change.approval));
      }
    } else if (change.kind === 'approval.resolved') entry.memory.pendingApprovals.delete(change.requestId);
    else if (change.kind === 'turn.changed') entry.memory.activeTurn = clone(change.turn);
  }

  getProjectionMetrics() {
    return { ...this.projectionMetrics };
  }

  handleRequest(sessionId, frame) {
    const entry = this.entries.get(sessionId);
    const permission = APPROVAL_METHODS.get(frame?.method);
    const params = frame?.params;
    const rpcId = frame?.id;
    const requestId = rpcId === null || rpcId === undefined ? '' : String(rpcId);
    if (!entry || entry.status !== 'ready' || !permission || !isObject(params) || !isId(requestId) ||
      !isId(params.threadId) || !isId(params.turnId) || !isId(params.itemId) ||
      entry.threadId !== params.threadId || entry.memory.activeTurn?.id !== params.turnId) {
      if (entry?.status === 'ready' && rpcId !== null && rpcId !== undefined) {
        entry.session.respondError(rpcId, { code: -32602, message: 'Stale Codex approval request' });
      }
      return;
    }
    if (entry.memory.pendingApprovals.has(requestId) || entry.approvalReplies.has(requestId)) return;
    const approval = {
      requestId,
      rpcId,
      id: requestId,
      engine: 'codex',
      sessionID: sessionId,
      threadID: params.threadId,
      turnID: params.turnId,
      permission,
      patterns: [params.cwd ?? params.grantRoot].filter(isId),
      always: [],
      metadata: {
        reason: typeof params.reason === 'string' ? params.reason : '',
        command: typeof params.command === 'string' ? params.command : '',
      },
      tool: { messageID: `msg_codex_${params.turnId}`, callID: params.itemId },
    };
    this.commit(entry, { type: 'approval.pending', approval: clone(approval) }, () => {
      entry.memory.pendingApprovals.set(requestId, approval);
      entry.memory.status = 'waiting_approval';
    });
  }

  async replyApproval(binding, { requestId, decision, threadId, turnId }) {
    if (!isObject(binding) || !isId(binding.sessionId) || !isId(requestId) ||
      !['once', 'reject'].includes(decision)) {
      fail(decision === 'always' ? 'invalid-approval-decision' : 'invalid-approval-request',
        decision === 'always' ? 'Codex approvals do not support always' : 'Codex approval reply is invalid');
    }
    const entry = this.entries.get(binding.sessionId);
    if (!entry || entry.status !== 'ready' || binding.threadId !== threadId || entry.threadId !== threadId ||
      entry.memory.activeTurn?.id !== turnId) {
      fail('approval-scope-mismatch', 'Codex approval scope does not match active ownership');
    }
    const prior = entry.approvalReplies.get(requestId);
    if (prior) {
      if (prior.decision !== decision) fail('approval-already-resolved', 'Codex approval already has a different decision');
      return prior.promise;
    }
    const approval = entry.memory.pendingApprovals.get(requestId);
    if (!approval) fail('stale-approval', 'Codex approval is no longer pending');
    if (approval.sessionID !== binding.sessionId || approval.threadID !== threadId || approval.turnID !== turnId) {
      fail('approval-scope-mismatch', 'Codex approval scope does not match active ownership');
    }
    const claim = { decision, promise: null };
    claim.promise = this.performApprovalReply(entry, approval, decision);
    entry.approvalReplies.set(requestId, claim);
    return claim.promise;
  }

  async performApprovalReply(entry, approval, decision) {
    try {
      entry.session.respond(approval.rpcId, { decision: decision === 'once' ? 'accept' : 'decline' });
      const committed = this.commit(entry, { type: 'approval.resolved', requestId: approval.requestId }, () => {
        entry.memory.pendingApprovals.delete(approval.requestId);
        entry.memory.status = 'running';
      });
      if (entry.approvalReplies.size > MAX_DEDUPE_RECORDS) {
        entry.approvalReplies.delete(entry.approvalReplies.keys().next().value);
      }
      return Object.freeze({
        requestId: approval.requestId,
        decision,
        revision: committed.revision,
        pendingApprovals: publicSnapshot(entry.memory).pendingApprovals,
      });
    } catch {
      fail('approval-response-ambiguous', 'Codex approval response outcome is ambiguous');
    }
  }

  abort(binding) {
    if (!isObject(binding) || !isId(binding.sessionId) || !isId(binding.directory) ||
      !(binding.threadId === null || isId(binding.threadId))) {
      return Promise.reject(new CodexRuntimeStateError('invalid-abort-request', 'Codex abort request is invalid'));
    }
    const entry = this.entries.get(binding.sessionId);
    if (!entry) {
      return Promise.resolve(Object.freeze({ outcome: 'idle', status: 'idle', revision: 0 }));
    }
    if (entry.directory !== binding.directory ||
      (entry.threadId !== null && entry.threadId !== binding.threadId)) {
      return Promise.reject(new CodexRuntimeStateError('abort-scope-mismatch', 'Codex abort scope does not match runtime ownership'));
    }
    if (entry.abortClaim) {
      if (!entry.abortClaim.settled) return entry.abortClaim.promise;
      if (entry.abortClaim.cleanupRequired) return this.retryAbortCleanup(entry);
      return entry.abortClaim.error
        ? Promise.reject(entry.abortClaim.error)
        : Promise.resolve(entry.abortClaim.result);
    }
    if (entry.status === 'failed') return Promise.reject(entry.error);
    const turn = entry.memory.activeTurn;
    if (!entry.active && turn === null) {
      return Promise.resolve(Object.freeze({
        outcome: 'idle', status: entry.memory.status, revision: entry.memory.revision,
      }));
    }
    if (!turn || !isId(turn.id) || !isId(turn.threadId)) {
      return Promise.reject(new CodexRuntimeStateError(
        'interrupt-unavailable', 'Codex active turn cannot be interrupted authoritatively',
      ));
    }

    const approvals = [...entry.memory.pendingApprovals.values()];
    const terminalParts = terminalizeProjectionParts(entry.memory.projection.parts);
    this.commit(entry, { type: 'turn.abort.requested', turnId: turn.id, terminalParts }, () => {
      entry.active = false;
      entry.memory.status = 'interrupting';
      entry.memory.activeTurn = null;
      entry.memory.pendingApprovals.clear();
      entry.memory.transcript.items = entry.memory.transcript.items.map(terminalizeItem);
      for (const part of terminalParts) replaceById(entry.memory.projection.parts, part);
    });
    const claim = {
      settled: false,
      cleanupRequired: false,
      result: null,
      error: null,
      promise: null,
    };
    entry.abortClaim = claim;
    claim.promise = this.performAbort(binding.sessionId, entry, turn, approvals, claim);
    return claim.promise;
  }

  async performAbort(sessionId, entry, turn, approvals, claim) {
    try {
      let approvalError = null;
      for (const approval of approvals) {
        try {
          entry.session.respondError(approval.rpcId, { code: -32800, message: 'Codex turn interrupted' });
        } catch (error) {
          approvalError ??= error;
        }
      }
      await entry.session.interrupt(turn.threadId, turn.id);
      if (entry.status === 'failed') throw entry.error;
      if (approvalError) throw approvalError;
      const committed = this.commit(entry, { type: 'turn.aborted', turnId: turn.id }, () => {
        entry.memory.status = 'idle';
        entry.memory.failure = null;
      });
      claim.result = Object.freeze({ outcome: 'interrupted', status: 'idle', revision: committed.revision });
      claim.settled = true;
      this.scheduleIdle(sessionId, entry);
      return claim.result;
    } catch (cause) {
      const error = entry.error ?? (cause?.code === 'process-exit' ? cause : new CodexRuntimeStateError(
        'interrupt-failed', 'Codex turn interrupt failed',
      ));
      entry.status = 'failed';
      entry.error = error;
      if (entry.memory.status !== 'failed') {
        this.commit(entry, { type: 'turn.abort.failed', code: error.code }, () => {
          entry.memory.status = 'failed';
          entry.memory.failure = { code: error.code, message: 'Codex turn interrupt failed' };
          entry.memory.recovery = { kind: 'failed' };
        });
      }
      claim.error = error;
      claim.cleanupRequired = true;
      claim.settled = true;
      try {
        await this.cleanupFailedSession(entry);
        claim.cleanupRequired = false;
      } catch {
        // A later abort or shutdown retries cleanup while preserving this failure.
      }
      throw error;
    }
  }

  async retryAbortCleanup(entry) {
    const error = entry.abortClaim.error;
    try {
      await this.cleanupFailedSession(entry);
      entry.abortClaim.cleanupRequired = false;
    } catch {
      // Keep the cleanup retryable and preserve the authoritative abort failure.
    }
    throw error;
  }

  cleanupFailedSession(entry) {
    if (entry.processDisposed) return Promise.resolve();
    if (entry.cleanupPromise) return entry.cleanupPromise;
    entry.cleanupPromise = Promise.resolve(entry.session.shutdown()).then(() => {
      entry.processDisposed = true;
    }).catch((error) => {
      entry.cleanupPromise = null;
      throw error;
    });
    return entry.cleanupPromise;
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
    if (entry.abortClaim) return;
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

  projectionSnapshot(sessionId) {
    const entry = this.entries.get(sessionId);
    if (!entry) fail('session-not-found', 'Codex session memory was not found');
    return projectionSnapshot(sessionId, entry.memory);
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
    if (entry.abortClaim && (
      ['transcript.append', 'approval.pending', 'turn.changed'].includes(event.type) ||
      (event.type === 'status.changed' && event.status !== 'failed')
    )) {
      return { applied: false, reason: 'turn-terminal', revision: entry.memory.revision };
    }
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
    let changes;
    if (event.type === 'approval.pending') changes = [{
      kind: 'approval.pending',
      approval: { ...event.approval, id: event.approval.id ?? event.approval.requestId },
    }];
    else if (event.type === 'approval.resolved') changes = [{ kind: 'approval.resolved', requestId: event.requestId }];
    else if (event.type === 'turn.changed') changes = [
      { kind: 'turn.changed', turn: event.turn },
      { kind: 'session.status', status: entry.memory.status },
    ];
    else if (event.type === 'turn.abort.requested' || event.type === 'process.failed') changes = [
      ...(Array.isArray(event.terminalParts)
        ? event.terminalParts.map((part) => ({ kind: 'part.upsert', part }))
        : []),
      { kind: 'turn.changed', turn: null },
      { kind: 'session.status', status: entry.memory.status },
    ];
    else changes = [{ kind: 'session.status', status: entry.memory.status }];
    return this.publishEntry(entry, changes);
  }

  replay(sessionId, afterRevision) {
    const entry = this.entries.get(sessionId);
    if (!entry) fail('session-not-found', 'Codex session memory was not found');
    if (!Number.isSafeInteger(afterRevision) || afterRevision < 0 || afterRevision > entry.memory.revision) {
      fail('invalid-replay-revision', 'Codex replay revision is invalid');
    }
    const first = entry.replay.firstRevision();
    if (afterRevision < entry.memory.revision && (first === null || afterRevision < first - 1)) {
      this.projectionMetrics.replayMisses += 1;
      return { kind: 'snapshot-required', snapshot: projectionSnapshot(sessionId, entry.memory) };
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
    if (!entry || entry.status === 'failed') return;
    this.clearIdle(entry);
    entry.active = false;
    entry.status = 'failed';
    entry.error = error;
    const terminalParts = terminalizeProjectionParts(entry.memory.projection.parts);
    this.commit(entry, { type: 'process.failed', code: error?.code ?? 'process-exit', terminalParts }, () => {
      entry.memory.status = 'failed';
      entry.memory.activeTurn = null;
      entry.memory.pendingApprovals.clear();
      entry.memory.transcript.items = entry.memory.transcript.items.map(terminalizeItem);
      for (const part of terminalParts) replaceById(entry.memory.projection.parts, part);
      entry.memory.failure = { code: error?.code ?? 'process-exit', message: 'Codex app-server process failed' };
      entry.memory.recovery = { kind: 'failed' };
    });
    void this.cleanupFailedSession(entry).catch(() => {});
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
    if (entry.processDisposed) {
      this.entries.delete(sessionId);
      return Promise.resolve();
    }
    if (entry.cleanupPromise) {
      entry.disposal = entry.cleanupPromise.then(() => {
        if (this.entries.get(sessionId) === entry) this.entries.delete(sessionId);
      }).catch((error) => {
        entry.disposal = null;
        throw error;
      });
      return entry.disposal;
    }
    entry.disposal = Promise.resolve(entry.session.shutdown()).then(() => {
      if (this.entries.get(sessionId) === entry) this.entries.delete(sessionId);
    }).catch((error) => {
      entry.disposal = null;
      throw error;
    });
    return entry.disposal;
  }

  async shutdown() {
    await Promise.all([...this.entries.keys()].map((sessionId) => this.dispose(sessionId)));
  }
}
