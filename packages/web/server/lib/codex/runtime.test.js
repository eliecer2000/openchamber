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
