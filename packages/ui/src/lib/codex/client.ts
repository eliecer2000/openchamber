import { runtimeFetch } from '@/lib/runtime-fetch';

export type CodexTurnAcceptance = {
  requestId: string;
  threadId: string;
  turnId: string;
  revision: number;
};

export type CodexApprovalResult = {
  requestId: string;
  decision: 'once' | 'reject';
  revision: number;
  pendingApprovals: unknown[];
};

export type CodexAbortResult = {
  outcome: 'idle' | 'interrupted';
  status: 'idle';
  revision: number;
};

export type CodexCapability =
  | { available: true; harnessId: 'codex' }
  | { available: false; reason: string };

export type CodexSessionIdentity = {
  sessionId: string;
  directory: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

class CodexClientError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'CodexClientError';
    this.code = code;
  }
}

const readJson = async (response: Response, fallback: string): Promise<unknown> => {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = isRecord(payload) ? payload : null;
    throw new CodexClientError(
      typeof error?.error === 'string' ? error.error : fallback,
      typeof error?.code === 'string' ? error.code : undefined,
    );
  }
  if (!payload) throw new CodexClientError('Codex server returned a malformed response');
  return payload;
};

const malformed = (): never => { throw new CodexClientError('Codex server returned a malformed response'); };

const parseTurnAcceptance = (value: unknown): CodexTurnAcceptance => {
  if (!isRecord(value) || typeof value.requestId !== 'string' || typeof value.threadId !== 'string' ||
    typeof value.turnId !== 'string' || !Number.isSafeInteger(value.revision)) return malformed();
  return value as CodexTurnAcceptance;
};

const parseApprovalResult = (value: unknown): CodexApprovalResult => {
  if (!isRecord(value) || typeof value.requestId !== 'string' ||
    !['once', 'reject'].includes(String(value.decision)) || !Number.isSafeInteger(value.revision) ||
    !Array.isArray(value.pendingApprovals)) return malformed();
  return value as CodexApprovalResult;
};

const parseAbortResult = (value: unknown): CodexAbortResult => {
  if (!isRecord(value) || !['idle', 'interrupted'].includes(String(value.outcome)) ||
    value.status !== 'idle' || !Number.isSafeInteger(value.revision)) return malformed();
  return value as CodexAbortResult;
};

export async function getCodexCapability(): Promise<CodexCapability> {
  const response = await runtimeFetch('/api/codex/capabilities');
  const payload: unknown = await response.json().catch(() => null);
  if (response.status === 501 && isRecord(payload) && payload.available === false &&
    typeof payload.reason === 'string') {
    return { available: false, reason: payload.reason };
  }
  if (!response.ok) throw new CodexClientError('Failed to read Codex capability');
  if (!isRecord(payload) || payload.available !== true || payload.harnessId !== 'codex' ||
    !isRecord(payload.target) || payload.target.harnessId !== 'codex' ||
    !isRecord(payload.target.modelRef) || payload.target.modelRef.kind !== 'default') return malformed();
  return { available: true, harnessId: 'codex' };
}

export async function createCodexSession(input: { directory: string }): Promise<CodexSessionIdentity> {
  const response = await runtimeFetch('/api/codex/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory: input.directory }),
  });
  const payload = await readJson(response, 'Failed to create Codex session');
  const session = isRecord(payload) && isRecord(payload.session) ? payload.session : null;
  if (!session || typeof session.sessionId !== 'string' || !session.sessionId.startsWith('ses_codex_') ||
    typeof session.directory !== 'string') return malformed();
  return { sessionId: session.sessionId, directory: session.directory };
}

export async function startCodexTurn(input: {
  sessionId: string;
  directory: string;
  requestId: string;
  text: string;
}): Promise<CodexTurnAcceptance> {
  const response = await runtimeFetch(`/api/codex/sessions/${encodeURIComponent(input.sessionId)}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory: input.directory, requestId: input.requestId, text: input.text }),
  });
  return parseTurnAcceptance(await readJson(response, 'Failed to start Codex turn'));
}

export async function replyToCodexApproval(input: {
  sessionId: string;
  directory: string;
  requestId: string;
  decision: 'once' | 'reject';
  threadId: string;
  turnId: string;
}): Promise<CodexApprovalResult> {
  const response = await runtimeFetch(
    `/api/codex/sessions/${encodeURIComponent(input.sessionId)}/approvals/${encodeURIComponent(input.requestId)}/reply`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directory: input.directory,
        decision: input.decision,
        threadId: input.threadId,
        turnId: input.turnId,
      }),
    },
  );
  return parseApprovalResult(await readJson(response, 'Failed to reply to Codex approval'));
}

export async function abortCodexTurn(input: {
  sessionId: string;
  directory: string;
}): Promise<CodexAbortResult> {
  const response = await runtimeFetch(`/api/codex/sessions/${encodeURIComponent(input.sessionId)}/abort`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory: input.directory }),
  });
  return parseAbortResult(await readJson(response, 'Failed to abort Codex turn'));
}
