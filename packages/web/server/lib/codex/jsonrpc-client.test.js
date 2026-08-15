import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import {
  CodexJsonRpcClient,
  CodexProtocolError,
  CodexRpcError,
} from './jsonrpc-client.js';
import {
  CODEX_PROTOCOL,
  parseCodexProtocolMessage,
} from './generated/protocol-descriptor.js';

const generatedUrl = new URL('./generated/', import.meta.url);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const createClient = (overrides = {}) => {
  const writes = [];
  const notifications = [];
  const requests = [];
  const warnings = [];
  const protocolErrors = [];
  const client = new CodexJsonRpcClient({
    write: (frame) => writes.push(frame),
    onNotification: (message) => notifications.push(message),
    onRequest: (message) => requests.push(message),
    onWarning: (warning) => warnings.push(warning),
    onProtocolError: (error) => protocolErrors.push(error),
    ...overrides,
  });
  return { client, notifications, protocolErrors, requests, warnings, writes };
};

describe('CodexJsonRpcClient JSONL framing', () => {
  it('decodes one UTF-8 notification split across chunks', () => {
    const state = createClient();
    const frame = Buffer.from(`${JSON.stringify({ method: 'item/agentMessage/delta', params: { delta: 'héllo' } })}\n`);
    const splitInsideAccent = frame.indexOf(0xc3) + 1;

    state.client.push(frame.subarray(0, splitInsideAccent));
    expect(state.notifications).toEqual([]);
    state.client.push(frame.subarray(splitInsideAccent));

    expect(state.notifications).toEqual([
      { method: 'item/agentMessage/delta', params: { delta: 'héllo' } },
    ]);
  });

  it('decodes multiple notification and server-request frames from one chunk', () => {
    const state = createClient();
    state.client.push(Buffer.from([
      JSON.stringify({ method: 'turn/started', params: { turn: { id: 'turn-1' } } }),
      JSON.stringify({ id: 'approval-1', method: 'item/commandExecution/requestApproval', params: { reason: 'test' } }),
      '',
    ].join('\n')));

    expect(state.notifications).toEqual([
      { method: 'turn/started', params: { turn: { id: 'turn-1' } } },
    ]);
    expect(state.requests).toEqual([
      { id: 'approval-1', method: 'item/commandExecution/requestApproval', params: { reason: 'test' } },
    ]);
  });

  it('fails pending and future work after malformed JSONL', async () => {
    const state = createClient();
    const pending = state.client.request('initialize', { clientInfo: { name: 'test' } });

    state.client.push(Buffer.from('{"method":broken}\n'));

    await expect(pending).rejects.toBeInstanceOf(CodexProtocolError);
    await expect(state.client.request('thread/start', {})).rejects.toBeInstanceOf(CodexProtocolError);
    expect(state.protocolErrors).toHaveLength(1);
    expect(state.protocolErrors[0]).toMatchObject({ code: 'malformed-jsonl' });
    expect(state.protocolErrors[0].message).not.toContain('{"method":broken}');
    expect(state.writes).toHaveLength(1);
  });

  it('fails schema-invalid JSON without exposing its payload', async () => {
    const state = createClient();
    const pending = state.client.request('initialize', {});

    state.client.push(Buffer.from(`${JSON.stringify({ id: 1 })}\n`));

    await expect(pending).rejects.toMatchObject({ code: 'invalid-protocol-message' });
    expect(state.protocolErrors[0].message).not.toContain('{"id":1}');
  });

  it('fails before an unterminated frame can exceed the byte bound', async () => {
    const state = createClient({ maxFrameBytes: 16 });
    const pending = state.client.request('initialize', {});

    state.client.push(Buffer.from('x'.repeat(17)));

    await expect(pending).rejects.toMatchObject({ code: 'frame-too-large' });
    expect(state.protocolErrors).toHaveLength(1);
  });

  it('rejects an oversized complete frame before dispatching it', () => {
    const state = createClient({ maxFrameBytes: 32 });
    const oversized = `${JSON.stringify({ method: 'warning', params: { message: 'x'.repeat(40) } })}\n`;

    state.client.push(Buffer.from(oversized));

    expect(state.notifications).toEqual([]);
    expect(state.protocolErrors).toHaveLength(1);
    expect(state.protocolErrors[0]).toMatchObject({ code: 'frame-too-large' });
  });
});

describe('CodexJsonRpcClient correlation', () => {
  it('uses monotonic IDs and resolves each request with its matching response', async () => {
    const state = createClient();
    const first = state.client.request('initialize', { capabilities: {} });
    const second = state.client.request('thread/start', { cwd: '/workspace' });

    expect(state.writes.map((frame) => JSON.parse(frame))).toEqual([
      { id: 1, method: 'initialize', params: { capabilities: {} } },
      { id: 2, method: 'thread/start', params: { cwd: '/workspace' } },
    ]);

    state.client.push(Buffer.from(`${JSON.stringify({ id: 2, result: { thread: { id: 'thread-1' } } })}\n`));
    state.client.push(Buffer.from(`${JSON.stringify({ id: 1, result: { userAgent: 'codex' } })}\n`));

    await expect(first).resolves.toEqual({ userAgent: 'codex' });
    await expect(second).resolves.toEqual({ thread: { id: 'thread-1' } });
  });

  it('rejects a correlated JSON-RPC error without retaining error data', async () => {
    const state = createClient();
    const pending = state.client.request('thread/resume', { threadId: 'thread-1' });

    state.client.push(Buffer.from(`${JSON.stringify({
      id: 1,
      error: { code: -32001, message: 'thread missing', data: { sensitive: 'payload' } },
    })}\n`));

    await expect(pending).rejects.toMatchObject({
      code: -32001,
      message: 'Codex JSON-RPC request failed: thread missing',
      method: 'thread/resume',
    });
    await pending.catch((error) => {
      expect(error).toBeInstanceOf(CodexRpcError);
      expect(error).not.toHaveProperty('data');
    });
  });

  it('reports an unknown response ID without failing trustworthy pending work', async () => {
    const state = createClient();
    const pending = state.client.request('initialize', {});

    state.client.push(Buffer.from(`${JSON.stringify({ id: 999, result: null })}\n`));
    state.client.push(Buffer.from(`${JSON.stringify({ id: 1, result: { ready: true } })}\n`));

    await expect(pending).resolves.toEqual({ ready: true });
    expect(state.warnings).toEqual([{ code: 'unknown-response-id', id: 999 }]);
    expect(state.protocolErrors).toEqual([]);
  });

  it('times out only the affected request and accepts a later response', async () => {
    vi.useFakeTimers();
    try {
      const state = createClient();
      const timedOut = state.client.request('thread/start', {}, { timeoutMs: 10 });
      const active = state.client.request('turn/start', {}, { timeoutMs: 100 });
      const timedOutAssertion = expect(timedOut).rejects.toMatchObject({
        code: 'request-timeout',
        method: 'thread/start',
      });

      await vi.advanceTimersByTimeAsync(11);
      await timedOutAssertion;
      state.client.push(Buffer.from(`${JSON.stringify({ id: 2, result: { turn: { id: 'turn-1' } } })}\n`));

      await expect(active).resolves.toEqual({ turn: { id: 'turn-1' } });
      expect(state.client.failed).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('generated Codex 0.147.0 protocol contract', () => {
  it('parses authoritative JSON-RPC envelope shapes from unknown input', () => {
    expect(parseCodexProtocolMessage({ id: 1, result: null })).toEqual({ id: 1, result: null });
    expect(parseCodexProtocolMessage({ id: 'approval', method: 'item/fileChange/requestApproval' }))
      .toEqual({ id: 'approval', method: 'item/fileChange/requestApproval' });
    expect(() => parseCodexProtocolMessage({ id: 1 })).toThrow(CodexProtocolError);
    expect(() => parseCodexProtocolMessage(['not', 'an', 'object'])).toThrow(CodexProtocolError);
  });

  it('contains the methods proven by WU0 and generated by Codex 0.147.0', () => {
    expect(CODEX_PROTOCOL.codexVersion).toBe('codex-cli 0.147.0');
    expect(CODEX_PROTOCOL.clientRequests).toEqual(expect.arrayContaining([
      'initialize',
      'thread/start',
      'thread/resume',
      'turn/start',
      'turn/interrupt',
    ]));
    expect(CODEX_PROTOCOL.serverRequests).toEqual(expect.arrayContaining([
      'item/commandExecution/requestApproval',
      'item/fileChange/requestApproval',
    ]));
    expect(CODEX_PROTOCOL.serverNotifications).toEqual(expect.arrayContaining([
      'item/agentMessage/delta',
      'turn/completed',
    ]));
  });

  it('binds the generated files to deterministic manifest hashes', async () => {
    const [descriptor, schema, manifestText] = await Promise.all([
      readFile(new URL('protocol-descriptor.js', generatedUrl)),
      readFile(new URL('protocol.schema.json', generatedUrl)),
      readFile(new URL('manifest.json', generatedUrl), 'utf8'),
    ]);
    const manifest = JSON.parse(manifestText);

    expect(manifest).toMatchObject({
      schemaVersion: 1,
      codexVersion: 'codex-cli 0.147.0',
      experimental: true,
      sourceAggregateSha256: 'e0e83a5379d87b58746426d7d7f53dafc151ec40910a1f3e7c9f2b838b663e2a',
      outputs: {
        'protocol-descriptor.js': sha256(descriptor),
        'protocol.schema.json': sha256(schema),
      },
    });
  });
});
