import { describe, expect, it } from 'vitest';
import { translateCodexEvent } from './event-translator.js';

const context = { sessionId: 'ses_codex_1', revision: 7, directory: '/repo', now: 2000 };

describe('translateCodexEvent', () => {
  it('projects ordered text, reasoning, command, tool, file, approval, status, and error shapes', () => {
    const cases = [
      [{ method: 'turn/started', params: { turn: { id: 'turn-1', status: 'inProgress', startedAt: 1 }, threadId: 'thread-1' } }, ['message.upsert', 'session.status']],
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
      expect(result.event.changes.map((change) => change.kind)).toEqual(kinds);
      expect(result.event).toMatchObject({ engine: 'codex', sessionID: 'ses_codex_1', revision: 7 });
      if (frame.method.endsWith('/requestApproval')) {
        expect(result.event.changes[0].approval).toMatchObject({
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
    expect(result.event.changes[0]).toMatchObject({ kind: 'part.upsert', part: { id: 'prt_codex_text-1', text: '' } });
    expect(result.event.changes[1]).toMatchObject({ kind: 'part.delta', partID: 'prt_codex_text-1', delta: 'late' });
  });

  it('rejects unknown and malformed events without retaining their payloads', () => {
    expect(translateCodexEvent({ method: 'future/event', params: { secret: 'x' } }, context)).toEqual({ accepted: false, reason: 'unknown-event' });
    expect(translateCodexEvent({ method: 'item/agentMessage/delta', params: { delta: 1 } }, context)).toEqual({ accepted: false, reason: 'malformed-event' });
  });
});
