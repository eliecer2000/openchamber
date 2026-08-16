import { describe, expect, it } from 'vitest';
import { translateCodexEvent } from './event-translator.js';

const context = { sessionId: 'ses_codex_1', directory: '/repo', now: 2000 };

describe('translateCodexEvent', () => {
  it('projects ordered text, reasoning, command, tool, file, approval, status, and error shapes', () => {
    const cases = [
      [{ method: 'turn/started', params: { turn: { id: 'turn-1', status: 'inProgress', startedAt: 1 }, threadId: 'thread-1' } }, ['message.upsert', 'turn.changed', 'session.status']],
      [{ method: 'item/agentMessage/delta', params: { itemId: 'text-1', turnId: 'turn-1', delta: 'hello', threadId: 'thread-1' } }, ['part.upsert', 'part.delta']],
      [{ method: 'item/reasoning/textDelta', params: { itemId: 'reason-1', turnId: 'turn-1', contentIndex: 0, delta: 'why', threadId: 'thread-1' } }, ['part.upsert', 'part.delta']],
      [{ method: 'item/commandExecution/outputDelta', params: { itemId: 'cmd-1', turnId: 'turn-1', delta: 'ok', threadId: 'thread-1' } }, ['part.upsert', 'tool.output.delta']],
      [{ method: 'item/started', params: { turnId: 'turn-1', threadId: 'thread-1', startedAtMs: 1000, item: { type: 'mcpToolCall', id: 'tool-1', server: 'fs', tool: 'read', status: 'inProgress', arguments: {} } } }, ['part.upsert']],
      [{ method: 'item/fileChange/patchUpdated', params: { itemId: 'file-1', turnId: 'turn-1', threadId: 'thread-1', changes: [{ path: 'a.ts', kind: 'update', diff: '@@ real @@' }] } }, ['part.upsert', 'session.diff']],
      [{ id: 99, method: 'item/commandExecution/requestApproval', params: { itemId: 'cmd-1', turnId: 'turn-1', threadId: 'thread-1', startedAtMs: 1200, command: 'pwd', cwd: '/repo' } }, ['approval.pending', 'session.status']],
      [{ method: 'error', params: { turnId: 'turn-1', threadId: 'thread-1', willRetry: false, error: { message: 'failed' } } }, ['message.error', 'session.status']],
    ];

    for (const [frame, kinds] of cases) {
      const result = translateCodexEvent(frame, context);
      expect(result.accepted).toBe(true);
      expect(result.changes.map((change) => change.kind)).toEqual(kinds);
      expect(result).not.toHaveProperty('revision');
      if (frame.method.endsWith('/requestApproval')) {
        expect(result.changes[0].approval).toMatchObject({
          engine: 'codex', threadID: 'thread-1', turnID: 'turn-1', always: [],
        });
      }
    }
  });

  it('makes a partial delta independently projectable when its start event was missed', () => {
    const result = translateCodexEvent({
      method: 'item/agentMessage/delta',
      params: { itemId: 'text-1', turnId: 'turn-1', threadId: 'thread-1', delta: 'late' },
    }, context);

    expect(result.accepted).toBe(true);
    expect(result.changes[0]).toMatchObject({ kind: 'part.upsert', part: { id: 'prt_codex_text-1', text: '' } });
    expect(result.changes[1]).toMatchObject({ kind: 'part.delta', partID: 'prt_codex_text-1', delta: 'late' });
  });

  it('keeps a named real turn diff when a later file item has no usable patch', () => {
    const patch = [
      'diff --git a/fixture.txt b/fixture.txt',
      '--- a/fixture.txt',
      '+++ b/fixture.txt',
      '@@ -1 +1 @@',
      '-BASELINE',
      '+WU12_EDIT',
    ].join('\n');
    const turnDiff = translateCodexEvent({
      method: 'turn/diff/updated',
      params: { turnId: 'turn-1', threadId: 'thread-1', diff: patch },
    }, context);
    const completedFile = translateCodexEvent({
      method: 'item/completed',
      params: {
        turnId: 'turn-1',
        threadId: 'thread-1',
        item: {
          type: 'fileChange',
          id: 'file-1',
          status: 'completed',
          changes: [{ path: 'fixture.txt', kind: 'update', diff: '' }],
        },
      },
    }, context);

    expect(turnDiff).toMatchObject({
      accepted: true,
      changes: [{
        kind: 'session.diff',
        diff: [{ file: 'fixture.txt', status: 'modified', patch }],
      }],
    });
    expect(completedFile.changes.map((change) => change.kind)).toEqual(['part.upsert']);
  });

  it('normalizes file-item changes and splits multi-file turn diffs', () => {
    const fileItem = translateCodexEvent({
      method: 'item/fileChange/patchUpdated',
      params: {
        itemId: 'file-1', turnId: 'turn-1', threadId: 'thread-1',
        changes: [{ path: 'updated.txt', kind: 'update', diff: '@@ updated @@' }],
      },
    }, context);
    const patch = [
      'diff --git a/added.txt b/added.txt',
      'new file mode 100644',
      '--- /dev/null',
      '+++ b/added.txt',
      '@@ -0,0 +1 @@',
      '+added',
      'diff --git a/deleted.txt b/deleted.txt',
      'deleted file mode 100644',
      '--- a/deleted.txt',
      '+++ /dev/null',
      '@@ -1 +0,0 @@',
      '-deleted',
    ].join('\n');
    const turnDiff = translateCodexEvent({
      method: 'turn/diff/updated',
      params: { turnId: 'turn-1', threadId: 'thread-1', diff: patch },
    }, context);

    expect(fileItem.changes[1]).toEqual({
      kind: 'session.diff',
      diff: [{ file: 'updated.txt', status: 'modified', patch: '@@ updated @@' }],
    });
    expect(turnDiff.changes[0].diff).toEqual([
      expect.objectContaining({ file: 'added.txt', status: 'added' }),
      expect.objectContaining({ file: 'deleted.txt', status: 'deleted' }),
    ]);
  });

  it('rejects unknown and malformed events without retaining their payloads', () => {
    expect(translateCodexEvent({ method: 'future/event', params: { secret: 'x' } }, context)).toEqual({ accepted: false, reason: 'unknown-event' });
    expect(translateCodexEvent({ method: 'item/agentMessage/delta', params: { delta: 1 } }, context)).toEqual({ accepted: false, reason: 'malformed-event' });
  });
});
