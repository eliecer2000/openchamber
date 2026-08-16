import { describe, expect, it, vi } from 'vitest';
import { CodexRuntime } from './runtime.js';

const completedBinding = Object.freeze({
  sessionId: 'ses_codex_00000000-0000-0000-0000-000000000001',
  threadId: 'thread-1',
  directory: '/workspace',
  lastCompletedAt: '2026-08-15T00:00:00.000Z',
});

const createSession = ({ read, readError } = {}) => ({
  start: vi.fn(async () => {}),
  shutdown: vi.fn(async () => {}),
  control: vi.fn(async (method) => {
    if (method === 'thread/resume') return { thread: { id: 'thread-1' } };
    if (readError) throw readError;
    return read;
  }),
});

const openRuntime = async (options = {}) => {
  const session = createSession(options);
  const runtime = new CodexRuntime({ createSession: () => session, idleMs: 60_000 });
  await runtime.open('session-1', '/workspace');
  return { runtime, session };
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const turnBinding = (threadId = null) => ({
  sessionId: 'session-1',
  directory: '/workspace',
  runtimeId: 'web',
  threadId,
});

const openTurnRuntime = async ({ turn, control, respond } = {}) => {
  let requestHandler;
  const session = {
    start: vi.fn(async () => {}),
    shutdown: vi.fn(async () => {}),
    control: vi.fn(control ?? (async (method) => (
      method === 'thread/start' ? { thread: { id: 'thread-1' } } : { thread: { id: 'thread-1' } }
    ))),
    turn: vi.fn(turn ?? (async () => ({ turn: { id: 'turn-1' } }))),
    respond: vi.fn(respond ?? (async () => {})),
    respondError: vi.fn(),
    interrupt: vi.fn(async () => ({ turn: { id: 'turn-1', status: 'interrupted' } })),
  };
  const runtime = new CodexRuntime({
    createSession: ({ onRequest }) => {
      requestHandler = onRequest;
      return session;
    },
    idleMs: 60_000,
  });
  await runtime.open('session-1', '/workspace');
  return { runtime, session, emitRequest: (frame) => requestHandler(frame) };
};

describe('CodexRuntime abort ownership', () => {
  it('converges concurrent aborts, terminalizes work, rejects approvals, and ignores late activity', async () => {
    const interrupted = deferred();
    const { runtime, session, emitRequest } = await openTurnRuntime();
    session.interrupt.mockImplementation(() => interrupted.promise);
    await runtime.startTurn(turnBinding('thread-1'), {
      requestId: 'turn-request', text: 'hello', bindThread: vi.fn(),
    });
    for (const item of [
      { id: 'tool-1', type: 'mcpToolCall', status: 'inProgress' },
      { id: 'command-1', type: 'commandExecution', status: 'running' },
      { id: 'edit-1', type: 'fileChange', status: 'pending' },
    ]) runtime.record('session-1', { type: 'transcript.append', item });
    emitRequest(approvalFrame());

    const first = runtime.abort(turnBinding('thread-1'));
    const concurrent = runtime.abort(turnBinding('thread-1'));
    expect(runtime.snapshot('session-1')).toMatchObject({
      status: 'interrupting', activeTurn: null, pendingApprovals: [],
    });
    interrupted.resolve({ turn: { id: 'turn-1', status: 'interrupted' } });

    await expect(first).resolves.toMatchObject({ outcome: 'interrupted', status: 'idle' });
    await expect(concurrent).resolves.toEqual(await first);
    await expect(runtime.abort(turnBinding('thread-1'))).resolves.toEqual(await first);
    expect(session.interrupt).toHaveBeenCalledTimes(1);
    expect(session.interrupt).toHaveBeenCalledWith('thread-1', 'turn-1');
    expect(session.respondError).toHaveBeenCalledTimes(1);
    expect(runtime.snapshot('session-1').transcript.items.map((item) => item.status))
      .toEqual(['interrupted', 'interrupted', 'interrupted']);

    const revision = runtime.snapshot('session-1').revision;
    expect(runtime.record('session-1', { type: 'status.changed', status: 'running' }))
      .toEqual({ applied: false, reason: 'turn-terminal', revision });
    emitRequest(approvalFrame(92));
    await expect(runtime.replyApproval(turnBinding('thread-1'), {
      requestId: '91', decision: 'once', threadId: 'thread-1', turnId: 'turn-1',
    })).rejects.toMatchObject({ code: 'approval-scope-mismatch' });
    expect(runtime.snapshot('session-1')).toMatchObject({ status: 'idle', pendingApprovals: [], activeTurn: null });
  });

  it('returns an authoritative idle outcome when no turn is active', async () => {
    const { runtime, session } = await openTurnRuntime();

    await expect(runtime.abort(turnBinding(null))).resolves.toMatchObject({ outcome: 'idle', status: 'idle' });
    expect(session.interrupt).not.toHaveBeenCalled();
    expect(runtime.snapshot('session-1')).toMatchObject({ status: 'idle', pendingApprovals: [], activeTurn: null });
  });

  it('keeps process exit during abort as failure and retries incomplete cleanup', async () => {
    const interrupted = deferred();
    let exit;
    let shutdownAttempts = 0;
    const session = {
      start: vi.fn(async () => {}),
      shutdown: vi.fn(async () => {
        shutdownAttempts += 1;
        if (shutdownAttempts === 1) throw new Error('cleanup unavailable');
      }),
      control: vi.fn(async () => ({ thread: { id: 'thread-1' } })),
      turn: vi.fn(async () => ({ turn: { id: 'turn-1' } })),
      respondError: vi.fn(),
      interrupt: vi.fn(() => interrupted.promise),
    };
    const runtime = new CodexRuntime({
      createSession: ({ onExit }) => { exit = onExit; return session; }, idleMs: 60_000,
    });
    await runtime.open('session-1', '/workspace');
    await runtime.startTurn(turnBinding('thread-1'), {
      requestId: 'turn-request', text: 'hello', bindThread: vi.fn(),
    });

    const aborted = runtime.abort(turnBinding('thread-1'));
    const processError = Object.assign(new Error('private process detail'), { code: 'process-exit' });
    exit(processError);
    interrupted.reject(processError);
    await expect(aborted).rejects.toMatchObject({ code: 'process-exit' });
    expect(runtime.snapshot('session-1')).toMatchObject({
      status: 'failed', activeTurn: null, pendingApprovals: [],
      failure: { code: 'process-exit', message: 'Codex app-server process failed' },
    });
    expect(session.shutdown).toHaveBeenCalledTimes(1);

    await expect(runtime.abort(turnBinding('thread-1'))).rejects.toMatchObject({ code: 'process-exit' });
    expect(session.shutdown).toHaveBeenCalledTimes(2);
  });

  it('keeps an interrupt rejection as explicit failure instead of idle success', async () => {
    const { runtime, session } = await openTurnRuntime();
    session.interrupt.mockRejectedValue(new Error('interrupt transport failed'));
    await runtime.startTurn(turnBinding('thread-1'), {
      requestId: 'turn-request', text: 'hello', bindThread: vi.fn(),
    });

    await expect(runtime.abort(turnBinding('thread-1'))).rejects.toMatchObject({ code: 'interrupt-failed' });
    expect(runtime.snapshot('session-1')).toMatchObject({
      status: 'failed', activeTurn: null, pendingApprovals: [],
      failure: { code: 'interrupt-failed', message: 'Codex turn interrupt failed' },
    });
    expect(session.shutdown).toHaveBeenCalledTimes(1);
  });

  it('still interrupts and fails cleanup truthfully when a pending approval cannot be rejected', async () => {
    const { runtime, session, emitRequest } = await openTurnRuntime();
    session.respondError.mockImplementation(() => { throw new Error('response channel closed'); });
    await runtime.startTurn(turnBinding('thread-1'), {
      requestId: 'turn-request', text: 'hello', bindThread: vi.fn(),
    });
    emitRequest(approvalFrame());

    await expect(runtime.abort(turnBinding('thread-1'))).rejects.toMatchObject({ code: 'interrupt-failed' });
    expect(session.interrupt).toHaveBeenCalledTimes(1);
    expect(session.shutdown).toHaveBeenCalledTimes(1);
    expect(runtime.snapshot('session-1')).toMatchObject({
      status: 'failed', activeTurn: null, pendingApprovals: [],
    });
  });
});

describe('CodexRuntime turn ownership', () => {
  it('deduplicates concurrent and accepted retries while rejecting another active turn', async () => {
    const pending = deferred();
    const { runtime, session } = await openTurnRuntime({ turn: () => pending.promise });
    const bindThread = vi.fn(async ({ threadId }) => ({ ...turnBinding(threadId) }));
    const input = { requestId: 'request-1', text: 'hello', bindThread };

    const first = runtime.startTurn(turnBinding(), input);
    const duplicate = runtime.startTurn(turnBinding(), input);
    await expect(runtime.startTurn(turnBinding(), { ...input, requestId: 'request-2' }))
      .rejects.toMatchObject({ code: 'turn-active' });
    pending.resolve({ turn: { id: 'turn-1' } });

    await expect(first).resolves.toMatchObject({ requestId: 'request-1', threadId: 'thread-1', turnId: 'turn-1' });
    await expect(duplicate).resolves.toEqual(await first);
    await expect(runtime.startTurn(turnBinding('thread-1'), input)).resolves.toEqual(await first);
    expect(session.turn).toHaveBeenCalledTimes(1);
    expect(session.turn).toHaveBeenCalledWith('turn/start', {
      threadId: 'thread-1',
      input: [{ type: 'text', text: 'hello', text_elements: [] }],
    });
    expect(bindThread).toHaveBeenCalledTimes(1);
  });

  it('retains an ambiguous start claim so a retry cannot start duplicate inference', async () => {
    const { runtime, session } = await openTurnRuntime({
      turn: async () => { throw new Error('connection lost after dispatch'); },
    });
    const input = { requestId: 'request-ambiguous', text: 'hello', bindThread: vi.fn() };

    await expect(runtime.startTurn(turnBinding('thread-1'), input))
      .rejects.toMatchObject({ code: 'turn-start-ambiguous' });
    await expect(runtime.startTurn(turnBinding('thread-1'), input))
      .rejects.toMatchObject({ code: 'turn-start-ambiguous' });
    expect(session.turn).toHaveBeenCalledTimes(1);
  });

  it('rejects a changed session-to-thread binding before dispatch', async () => {
    const { runtime, session } = await openTurnRuntime();
    const input = { requestId: 'request-1', text: 'hello', bindThread: vi.fn() };
    await runtime.startTurn(turnBinding('thread-1'), input);
    runtime.completeTurn('session-1');

    await expect(runtime.startTurn(turnBinding('thread-other'), { ...input, requestId: 'request-2' }))
      .rejects.toMatchObject({ code: 'binding-conflict' });
    expect(session.turn).toHaveBeenCalledTimes(1);
  });
});

const approvalFrame = (id = 91) => ({
  id,
  method: 'item/commandExecution/requestApproval',
  params: { threadId: 'thread-1', turnId: 'turn-1', itemId: 'item-1', command: 'pwd', cwd: '/workspace' },
});

describe('CodexRuntime approval ownership', () => {
  it('projects one pending approval and atomically emits one response across concurrent retries', async () => {
    const pending = deferred();
    const { runtime, session, emitRequest } = await openTurnRuntime({ respond: () => pending.promise });
    await runtime.startTurn(turnBinding('thread-1'), { requestId: 'turn-request', text: 'hello', bindThread: vi.fn() });
    emitRequest(approvalFrame());
    emitRequest(approvalFrame());

    expect(runtime.snapshot('session-1').pendingApprovals).toHaveLength(1);
    expect(runtime.snapshot('session-1').pendingApprovals[0]).toMatchObject({
      id: '91', engine: 'codex', threadID: 'thread-1', turnID: 'turn-1', always: [],
    });
    const input = { requestId: '91', decision: 'once', threadId: 'thread-1', turnId: 'turn-1' };
    const first = runtime.replyApproval(turnBinding('thread-1'), input);
    const concurrent = runtime.replyApproval(turnBinding('thread-1'), input);
    await expect(runtime.replyApproval(turnBinding('thread-1'), { ...input, decision: 'reject' }))
      .rejects.toMatchObject({ code: 'approval-already-resolved' });
    pending.resolve();

    await expect(first).resolves.toMatchObject({ requestId: '91', decision: 'once', pendingApprovals: [] });
    await expect(concurrent).resolves.toEqual(await first);
    await expect(runtime.replyApproval(turnBinding('thread-1'), input)).resolves.toEqual(await first);
    expect(session.respond).toHaveBeenCalledTimes(1);
    expect(session.respond).toHaveBeenCalledWith(91, { decision: 'accept' });
  });

  it('rejects stale, unsupported, and wrong session/thread/turn replies before responding', async () => {
    const { runtime, session, emitRequest } = await openTurnRuntime();
    await runtime.startTurn(turnBinding('thread-1'), { requestId: 'turn-request', text: 'hello', bindThread: vi.fn() });
    emitRequest(approvalFrame());
    const base = { requestId: '91', decision: 'once', threadId: 'thread-1', turnId: 'turn-1' };

    for (const [binding, input, code] of [
      [{ ...turnBinding('thread-1'), sessionId: 'session-other' }, base, 'approval-scope-mismatch'],
      [turnBinding('thread-other'), base, 'approval-scope-mismatch'],
      [turnBinding('thread-1'), { ...base, turnId: 'turn-other' }, 'approval-scope-mismatch'],
      [turnBinding('thread-1'), { ...base, decision: 'always' }, 'invalid-approval-decision'],
      [turnBinding('thread-1'), { ...base, requestId: 'stale' }, 'stale-approval'],
    ]) {
      await expect(runtime.replyApproval(binding, input)).rejects.toMatchObject({ code });
    }
    expect(session.respond).not.toHaveBeenCalled();
  });
});

describe('CodexRuntime authoritative session memory', () => {
  it('keeps a newer event authoritative when a stale snapshot arrives later', async () => {
    const { runtime } = await openRuntime();
    runtime.applySnapshot('session-1', {
      revision: 4,
      status: 'idle',
      transcript: { state: 'complete', items: [{ id: 'history-1' }] },
      pendingApprovals: [],
      activeTurn: null,
    });
    runtime.record('session-1', { type: 'status.changed', status: 'running' });

    expect(runtime.applySnapshot('session-1', {
      revision: 4,
      status: 'idle',
      transcript: { state: 'complete', items: [] },
      pendingApprovals: [],
      activeTurn: null,
    })).toEqual({ applied: false, reason: 'stale-snapshot', revision: 5 });
    expect(runtime.snapshot('session-1')).toMatchObject({
      revision: 5,
      status: 'running',
      transcript: { state: 'complete', items: [{ id: 'history-1' }] },
    });
  });

  it('owns canonical transcript, status, pending approvals, and active turn state', async () => {
    const { runtime } = await openRuntime();
    runtime.record('session-1', { type: 'transcript.append', item: { id: 'message-1', type: 'agentMessage', text: 'complete' } });
    runtime.record('session-1', { type: 'turn.changed', turn: { id: 'turn-1', status: 'inProgress' } });
    runtime.record('session-1', { type: 'approval.pending', approval: { requestId: 'approval-1', kind: 'command' } });
    runtime.record('session-1', { type: 'status.changed', status: 'waiting_approval' });

    expect(runtime.snapshot('session-1')).toEqual({
      revision: 4,
      status: 'waiting_approval',
      transcript: { state: 'live', items: [{ id: 'message-1', type: 'agentMessage', text: 'complete' }] },
      pendingApprovals: [{ requestId: 'approval-1', kind: 'command' }],
      activeTurn: { id: 'turn-1', status: 'inProgress' },
      failure: null,
      recovery: { kind: 'memory' },
    });
  });

  it('assigns monotonic revisions and keeps replay writes O(1) with bounded storage', async () => {
    const session = createSession();
    const runtime = new CodexRuntime({ createSession: () => session, idleMs: 60_000, maxReplayEvents: 3 });
    await runtime.open('session-1', '/workspace');
    for (let index = 1; index <= 5; index += 1) {
      runtime.record('session-1', { type: 'transcript.append', item: { id: `message-${index}` } });
    }

    expect(runtime.replay('session-1', 2)).toMatchObject({
      kind: 'events',
      fromRevision: 2,
      toRevision: 5,
      events: [
        { revision: 3, event: { type: 'transcript.append', item: { id: 'message-3' } } },
        { revision: 4, event: { type: 'transcript.append', item: { id: 'message-4' } } },
        { revision: 5, event: { type: 'transcript.append', item: { id: 'message-5' } } },
      ],
    });
    expect(runtime.replay('session-1', 1)).toMatchObject({ kind: 'snapshot-required', snapshot: { revision: 5 } });
  });

  it('rejects malformed canonical events and ignores unknown events without erasing state', async () => {
    const { runtime } = await openRuntime();
    runtime.applySnapshot('session-1', {
      revision: 3,
      status: 'idle',
      transcript: { state: 'complete', items: [{ id: 'message-1' }] },
      pendingApprovals: [],
      activeTurn: null,
    });
    const before = runtime.snapshot('session-1');

    expect(() => runtime.record('session-1', { type: 'status.changed', status: 'idle-ish' })).toThrowError(
      expect.objectContaining({ code: 'invalid-runtime-event' }),
    );
    expect(runtime.record('session-1', { type: 'future.event', value: 1 })).toEqual({
      applied: false,
      reason: 'unknown-event',
      revision: 3,
    });
    expect(runtime.snapshot('session-1')).toEqual(before);
  });

  it('records process failure as a newer revision without erasing completed transcript', async () => {
    let exit;
    const session = createSession();
    const runtime = new CodexRuntime({
      createSession: ({ onExit }) => { exit = onExit; return session; },
      idleMs: 60_000,
    });
    await runtime.open('session-1', '/workspace');
    runtime.record('session-1', { type: 'transcript.append', item: { id: 'message-1' } });
    exit(Object.assign(new Error('private process detail'), { code: 'process-exit' }));

    expect(runtime.snapshot('session-1')).toMatchObject({
      revision: 2,
      status: 'failed',
      transcript: { state: 'live', items: [{ id: 'message-1' }] },
      failure: { code: 'process-exit', message: 'Codex app-server process failed' },
    });
  });
});

describe('CodexRuntime completed-thread restart recovery', () => {
  it('reconstructs completed history only from binding plus full authoritative Codex read evidence', async () => {
    const session = createSession({
      read: {
        thread: {
          id: 'thread-1',
          status: { type: 'idle' },
          turns: [
            { id: 'turn-1', status: 'completed', itemsView: 'full', items: [{ id: 'user-1' }, { id: 'agent-1' }] },
            { id: 'turn-2', status: 'interrupted', itemsView: 'full', items: [{ id: 'user-2' }] },
          ],
        },
      },
    });
    const runtime = new CodexRuntime({ createSession: () => session, idleMs: 60_000 });

    await expect(runtime.recoverCompleted(completedBinding)).resolves.toMatchObject({
      kind: 'recovered',
      snapshot: {
        status: 'idle',
        transcript: {
          state: 'complete',
          items: [
            { turnId: 'turn-1', item: { id: 'user-1' } },
            { turnId: 'turn-1', item: { id: 'agent-1' } },
            { turnId: 'turn-2', item: { id: 'user-2' } },
          ],
        },
        recovery: { kind: 'recovered', threadId: 'thread-1' },
      },
    });
    expect(session.control.mock.calls).toEqual([
      ['thread/resume', { threadId: 'thread-1', cwd: '/workspace', excludeTurns: true }],
      ['thread/read', { threadId: 'thread-1', includeTurns: true }],
    ]);
  });

  it('represents unsupported completed-history reads as a limitation without fabricating transcript', async () => {
    const session = createSession({ readError: Object.assign(new Error('method unavailable'), { code: -32601 }) });
    const runtime = new CodexRuntime({ createSession: () => session, idleMs: 60_000 });

    await expect(runtime.recoverCompleted(completedBinding)).resolves.toMatchObject({
      kind: 'limited',
      code: 'completed-thread-history-unavailable',
      snapshot: {
        status: 'idle',
        transcript: { state: 'unavailable', items: null },
        recovery: { kind: 'limited', code: 'completed-thread-history-unavailable' },
      },
    });
    expect(completedBinding).toEqual(expect.objectContaining({ threadId: 'thread-1' }));
  });

  it('keeps read and malformed-response failures explicit instead of publishing idle empty success', async () => {
    for (const options of [
      { readError: Object.assign(new Error('private upstream detail'), { code: 'read-failed' }) },
      { read: { thread: { id: 'thread-1', turns: [] } } },
      { read: { thread: { id: 'thread-1', status: { type: 'idle' }, turns: [] } } },
    ]) {
      const session = createSession(options);
      const runtime = new CodexRuntime({ createSession: () => session, idleMs: 60_000 });
      await expect(runtime.recoverCompleted(completedBinding)).rejects.toMatchObject({ code: 'recovery-failed' });
      expect(runtime.snapshot(completedBinding.sessionId)).toMatchObject({
        status: 'failed',
        transcript: { state: 'failed', items: null },
        failure: { code: 'recovery-failed', message: 'Codex completed-thread recovery failed' },
        recovery: { kind: 'failed' },
      });
    }
  });

  it('refuses to claim that an in-flight turn survived restart', async () => {
    const runtime = new CodexRuntime({ createSession: () => createSession() });
    await expect(runtime.recoverCompleted({ ...completedBinding, lastCompletedAt: null })).rejects.toMatchObject({
      code: 'in-flight-recovery-unsupported',
    });
    expect(runtime.getState(completedBinding.sessionId)).toBe(null);
  });
});
