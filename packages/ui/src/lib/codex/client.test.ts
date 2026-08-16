import { beforeEach, describe, expect, mock, test } from 'bun:test';

const calls: Array<{ path: string; init: RequestInit }> = [];
let nextResponse = new Response('{}', { headers: { 'Content-Type': 'application/json' } });

mock.module('@/lib/runtime-fetch', () => ({
  runtimeFetch: mock(async (path: string, init: RequestInit) => {
    calls.push({ path, init });
    return nextResponse;
  }),
}));

const {
  abortCodexTurn,
  createCodexSession,
  getCodexCapability,
  replyToCodexApproval,
  startCodexTurn,
} = await import('./client');

describe('Codex client', () => {
  beforeEach(() => {
    calls.length = 0;
    nextResponse = new Response(JSON.stringify({
      requestId: 'request-1', threadId: 'thread-1', turnId: 'turn-1', revision: 2,
    }), { status: 202, headers: { 'Content-Type': 'application/json' } });
  });

  test('sends only the Codex dedupe ID, prompt text, and authoritative directory', async () => {
    const result = await startCodexTurn({
      sessionId: 'ses_codex_1', directory: '/repo', requestId: 'request-1', text: 'hello',
    });
    expect(result.turnId).toBe('turn-1');

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe('/api/codex/sessions/ses_codex_1/prompt');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      directory: '/repo', requestId: 'request-1', text: 'hello',
    });
  });

  test('sends a scoped once/reject approval reply without OpenCode semantics', async () => {
    nextResponse = new Response(JSON.stringify({
      requestId: '91', decision: 'reject', revision: 4, pendingApprovals: [],
    }), { headers: { 'Content-Type': 'application/json' } });

    await replyToCodexApproval({
      sessionId: 'ses_codex_1', directory: '/repo', requestId: '91',
      decision: 'reject', threadId: 'thread-1', turnId: 'turn-1',
    });

    expect(calls[0].path).toBe('/api/codex/sessions/ses_codex_1/approvals/91/reply');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      directory: '/repo', decision: 'reject', threadId: 'thread-1', turnId: 'turn-1',
    });
  });

  test('rejects malformed success payloads instead of granting authority', async () => {
    nextResponse = new Response(JSON.stringify({ requestId: 'request-1' }), {
      headers: { 'Content-Type': 'application/json' },
    });

    const error = await startCodexTurn({
      sessionId: 'ses_codex_1', directory: '/repo', requestId: 'request-1', text: 'hello',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('malformed');
  });

  test('sends Codex abort to its isolated route and parses the authoritative outcome', async () => {
    nextResponse = new Response(JSON.stringify({
      outcome: 'interrupted', status: 'idle', revision: 8,
    }), { headers: { 'Content-Type': 'application/json' } });

    const result = await abortCodexTurn({ sessionId: 'ses_codex_1', directory: '/repo' });
    expect(result).toEqual({ outcome: 'interrupted', status: 'idle', revision: 8 });
    expect(calls[0].path).toBe('/api/codex/sessions/ses_codex_1/abort');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ directory: '/repo' });
  });

  test('parses authoritative capability and explicit unsupported responses', async () => {
    nextResponse = new Response(JSON.stringify({
      available: true,
      harnessId: 'codex',
      target: { harnessId: 'codex', modelRef: { kind: 'default' } },
    }), { headers: { 'Content-Type': 'application/json' } });
    expect(await getCodexCapability()).toEqual({ available: true, harnessId: 'codex' });

    nextResponse = new Response(JSON.stringify({ available: false, reason: 'unsupported-runtime' }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(await getCodexCapability()).toEqual({ available: false, reason: 'unsupported-runtime' });
  });

  test('creates a Codex session without provider or model fields', async () => {
    nextResponse = new Response(JSON.stringify({
      session: { sessionId: 'ses_codex_1', directory: '/repo', runtimeId: 'web', threadId: null },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

    expect(await createCodexSession({ directory: '/repo' })).toEqual({
      sessionId: 'ses_codex_1',
      directory: '/repo',
    });
    expect(calls[0].path).toBe('/api/codex/sessions');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ directory: '/repo' });
  });
});
