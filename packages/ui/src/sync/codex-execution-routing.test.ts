import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { CODEX_EXECUTION_TARGET } from '@/types/execution-target';
import { getRuntimeKey } from '@/lib/runtime-switch';

const codexCreateCalls: Array<Record<string, unknown>> = [];
const codexPromptCalls: Array<Record<string, unknown>> = [];

mock.module('@/lib/codex/client', () => ({
  createCodexSession: mock(async (input: Record<string, unknown>) => {
    codexCreateCalls.push(input);
    return { sessionId: 'ses_codex_created', directory: input.directory };
  }),
  startCodexTurn: mock(async (input: Record<string, unknown>) => {
    codexPromptCalls.push(input);
    return { requestId: input.requestId, threadId: 'thread-1', turnId: 'turn-1', revision: 1 };
  }),
  abortCodexTurn: mock(async () => ({ outcome: 'idle', status: 'idle', revision: 1 })),
  replyToCodexApproval: mock(async () => ({ requestId: '1', decision: 'once', revision: 1, pendingApprovals: [] })),
}));

const { materializeOpenDraftSession, routeMessage, useSessionUIStore } = await import('./session-ui-store');

describe('Codex execution routing', () => {
  beforeEach(() => {
    codexCreateCalls.length = 0;
    codexPromptCalls.length = 0;
    useSessionUIStore.setState({
      currentSessionId: null,
      currentSessionDirectory: null,
      newSessionDraft: { open: true, directoryOverride: '/repo', parentID: null },
    });
  });

  test('materializes a Codex draft without creating an OpenCode provider/model session', async () => {
    const created = await materializeOpenDraftSession(CODEX_EXECUTION_TARGET, {
      open: true,
      directoryOverride: '/repo',
      parentID: null,
    });

    expect(created).toEqual({ sessionId: 'ses_codex_created', directory: '/repo' });
    expect(codexCreateCalls).toEqual([{ directory: '/repo' }]);
  });

  test('routes a Codex prompt without provider/model or OpenCode prompt semantics', async () => {
    await routeMessage({
      runtimeKey: getRuntimeKey(),
      sessionId: 'ses_codex_created',
      directory: '/repo',
      content: 'hello',
      executionTarget: CODEX_EXECUTION_TARGET,
    });

    expect(codexPromptCalls).toHaveLength(1);
    expect(Object.keys(codexPromptCalls[0]).sort()).toEqual(['directory', 'requestId', 'sessionId', 'text']);
  });

  test('sends a selected Codex draft end to end without provider/model selection', async () => {
    const draftSnapshot = { open: true, directoryOverride: '/repo', parentID: null };

    await useSessionUIStore.getState().sendMessage(
      'hello from draft',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'normal',
      { executionTarget: CODEX_EXECUTION_TARGET, draftSnapshot },
    );

    expect(codexCreateCalls).toEqual([{ directory: '/repo' }]);
    expect(codexPromptCalls).toHaveLength(1);
    expect(codexPromptCalls[0].text).toBe('hello from draft');
  });

  test('rejects unsupported Codex shell and attachment payloads before transport', async () => {
    await expect(routeMessage({
      runtimeKey: getRuntimeKey(),
      sessionId: 'ses_codex_created',
      directory: '/repo',
      content: 'pwd',
      executionTarget: CODEX_EXECUTION_TARGET,
      inputMode: 'shell',
    })).rejects.toThrow('does not support');
    expect(codexPromptCalls).toHaveLength(0);
  });
});
