const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;
const messageId = (turnId) => `msg_codex_${turnId}`;
const partId = (itemId) => `prt_codex_${itemId}`;
const fileStatus = (kind) => ({ add: 'added', delete: 'deleted', update: 'modified' })[kind] ?? 'modified';

const assistantMessage = (sessionId, turnId, directory, created, completed, error) => ({
  id: messageId(turnId), sessionID: sessionId, role: 'assistant', parentID: '',
  modelID: 'codex', providerID: 'codex', mode: 'codex', agent: 'codex',
  path: { cwd: directory, root: directory }, cost: 0,
  tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
  time: { created, ...(completed ? { completed } : {}) },
  ...(error ? { error: { name: 'UnknownError', data: { message: error } } } : {}),
});

const textPart = (sessionId, turnId, itemId, type, text, now) => ({
  id: partId(itemId), sessionID: sessionId, messageID: messageId(turnId), type, text,
  ...(type === 'reasoning' ? { time: { start: now } } : {}),
});

const toolPart = (sessionId, turnId, item, now, completedAt) => {
  const input = item.type === 'commandExecution'
    ? { command: item.command ?? '', cwd: item.cwd ?? '' }
    : item.type === 'fileChange'
      ? { changes: item.changes ?? [] }
      : { server: item.server ?? item.namespace ?? '', tool: item.tool ?? '', arguments: item.arguments ?? {} };
  const status = item.status === 'completed' ? 'completed'
    : item.status === 'inProgress' ? 'running' : 'error';
  const base = {
    id: partId(item.id), sessionID: sessionId, messageID: messageId(turnId),
    type: 'tool', callID: item.id,
    tool: item.type === 'commandExecution' ? 'bash' : item.type === 'fileChange' ? 'apply_patch' : item.tool ?? item.type,
  };
  if (status === 'running') return { ...base, state: { status, input, time: { start: now } } };
  if (status === 'completed') return {
    ...base,
    state: {
      status, input, output: item.aggregatedOutput ?? '', title: base.tool,
      metadata: {}, time: { start: now, end: completedAt ?? now },
    },
  };
  return {
    ...base,
    state: { status: 'error', input, error: 'Codex tool failed', time: { start: now, end: completedAt ?? now } },
  };
};

const fileDiffs = (changes) => changes
  .filter((change) => isRecord(change) && isText(change.path) && typeof change.diff === 'string')
  .filter((change) => change.diff.length > 0)
  .map((change) => ({ file: change.path, status: fileStatus(change.kind), patch: change.diff }));

export const parseCodexTurnDiff = (diff) => {
  const starts = [...diff.matchAll(/^diff --git /gm)].map((match) => match.index);
  if (starts.length === 0) return [{ status: 'modified', patch: diff }];
  return starts.map((start, index) => {
    const patch = diff.slice(start, starts[index + 1] ?? diff.length).replace(/\n$/, '');
    const file = patch.match(/^\+\+\+ b\/(.+)$/m)?.[1]
      ?? patch.match(/^--- a\/(.+)$/m)?.[1]
      ?? '';
    const status = /^new file mode /m.test(patch) ? 'added'
      : /^deleted file mode /m.test(patch) ? 'deleted' : 'modified';
    return { file, status, patch };
  });
};

const itemChanges = (item, params, context, completedAt) => {
  if (!isRecord(item) || !isText(item.id) || !isText(item.type)) return null;
  const { sessionId, now } = context;
  const turnId = params.turnId;
  if (item.type === 'agentMessage') {
    return [{ kind: 'part.upsert', part: textPart(sessionId, turnId, item.id, 'text', typeof item.text === 'string' ? item.text : '', now) }];
  }
  if (item.type === 'reasoning') {
    const text = [...(Array.isArray(item.summary) ? item.summary : []), ...(Array.isArray(item.content) ? item.content : [])]
      .filter((value) => typeof value === 'string').join('\n');
    return [{ kind: 'part.upsert', part: textPart(sessionId, turnId, item.id, 'reasoning', text, now) }];
  }
  if (['commandExecution', 'mcpToolCall', 'dynamicToolCall'].includes(item.type)) {
    return [{ kind: 'part.upsert', part: toolPart(sessionId, turnId, item, now, completedAt) }];
  }
  if (item.type === 'fileChange' && Array.isArray(item.changes)) {
    const diff = fileDiffs(item.changes);
    return [
      { kind: 'part.upsert', part: toolPart(sessionId, turnId, item, now, completedAt) },
      ...(diff.length > 0 ? [{ kind: 'session.diff', diff }] : []),
    ];
  }
  return null;
};

export function translateCodexEvent(frame, context) {
  if (!isRecord(frame) || !isText(frame.method) || !isRecord(frame.params) ||
    !isRecord(context) || !isText(context.sessionId)) {
    return { accepted: false, reason: 'malformed-event' };
  }
  const params = frame.params;
  const now = Number.isFinite(context.now) ? context.now : Date.now();
  const directory = isText(context.directory) ? context.directory : '/';
  const base = isText(params.turnId) && isText(params.threadId);
  let changes = null;

  if (frame.method === 'turn/started' && isText(params.turn?.id)) {
    const created = Number.isFinite(params.turn.startedAt) ? params.turn.startedAt * 1000 : now;
    changes = [
      { kind: 'message.upsert', message: assistantMessage(context.sessionId, params.turn.id, directory, created) },
      { kind: 'turn.changed', turn: { id: params.turn.id, threadId: params.threadId ?? null } },
      { kind: 'session.status', status: 'running' },
    ];
  } else if (frame.method === 'turn/completed' && isText(params.turn?.id) && isText(params.turn.status)) {
    const created = Number.isFinite(params.turn.startedAt) ? params.turn.startedAt * 1000 : now;
    const completed = Number.isFinite(params.turn.completedAt) ? params.turn.completedAt * 1000 : now;
    const error = params.turn.status === 'failed' ? params.turn.error?.message ?? 'Codex turn failed' : null;
    changes = [
      { kind: 'message.upsert', message: { ...assistantMessage(context.sessionId, params.turn.id, directory, created, completed, error), finish: params.turn.status } },
      { kind: 'turn.changed', turn: null },
      { kind: 'session.status', status: error ? 'failed' : 'idle' },
    ];
  } else if (base && frame.method === 'item/agentMessage/delta' && isText(params.itemId) && typeof params.delta === 'string') {
    changes = [
      { kind: 'part.upsert', part: textPart(context.sessionId, params.turnId, params.itemId, 'text', '', now) },
      { kind: 'part.delta', messageID: messageId(params.turnId), partID: partId(params.itemId), field: 'text', delta: params.delta },
    ];
  } else if (base && ['item/reasoning/textDelta', 'item/reasoning/summaryTextDelta'].includes(frame.method) && isText(params.itemId) && typeof params.delta === 'string') {
    changes = [
      { kind: 'part.upsert', part: textPart(context.sessionId, params.turnId, params.itemId, 'reasoning', '', now) },
      { kind: 'part.delta', messageID: messageId(params.turnId), partID: partId(params.itemId), field: 'text', delta: params.delta },
    ];
  } else if (base && frame.method === 'item/reasoning/summaryPartAdded' && isText(params.itemId)) {
    changes = [{ kind: 'part.upsert', part: textPart(context.sessionId, params.turnId, params.itemId, 'reasoning', '', now) }];
  } else if (base && ['item/started', 'item/completed'].includes(frame.method)) {
    const completedAt = Number.isFinite(params.completedAtMs) ? params.completedAtMs : undefined;
    changes = itemChanges(params.item, params, { ...context, now }, completedAt);
  } else if (base && frame.method === 'item/commandExecution/outputDelta' && isText(params.itemId) && typeof params.delta === 'string') {
    changes = [
      { kind: 'part.upsert', part: toolPart(context.sessionId, params.turnId, { type: 'commandExecution', id: params.itemId, status: 'inProgress' }, now) },
      { kind: 'tool.output.delta', messageID: messageId(params.turnId), partID: partId(params.itemId), delta: params.delta },
    ];
  } else if (base && frame.method === 'item/fileChange/patchUpdated' && isText(params.itemId) && Array.isArray(params.changes)) {
    changes = itemChanges({ type: 'fileChange', id: params.itemId, status: 'inProgress', changes: params.changes }, params, { ...context, now });
  } else if (base && ['item/commandExecution/requestApproval', 'item/fileChange/requestApproval'].includes(frame.method) && frame.id != null && isText(params.itemId)) {
    changes = [
      {
        kind: 'approval.pending',
         approval: {
          id: String(frame.id), engine: 'codex', sessionID: context.sessionId,
          threadID: params.threadId, turnID: params.turnId,
          permission: frame.method.includes('fileChange') ? 'edit' : 'bash',
          patterns: [params.cwd ?? params.grantRoot].filter(isText), always: [],
          metadata: { reason: typeof params.reason === 'string' ? params.reason : '', command: typeof params.command === 'string' ? params.command : '' },
          tool: { messageID: messageId(params.turnId), callID: params.itemId },
        },
      },
      { kind: 'session.status', status: 'waiting_approval' },
    ];
  } else if (base && frame.method === 'turn/diff/updated' && typeof params.diff === 'string') {
    changes = [{ kind: 'session.diff', diff: parseCodexTurnDiff(params.diff) }];
  } else if (base && frame.method === 'error' && typeof params.error?.message === 'string') {
    changes = [
      { kind: 'message.error', message: assistantMessage(context.sessionId, params.turnId, directory, now, now, params.error.message) },
      { kind: 'session.status', status: params.willRetry ? 'running' : 'failed' },
    ];
  }

  if (!changes) {
    const known = ['turn/started', 'turn/completed', 'item/agentMessage/delta', 'item/reasoning/textDelta',
      'item/reasoning/summaryTextDelta', 'item/reasoning/summaryPartAdded', 'item/started', 'item/completed',
      'item/commandExecution/outputDelta', 'item/fileChange/patchUpdated', 'item/commandExecution/requestApproval',
      'item/fileChange/requestApproval', 'turn/diff/updated', 'error'].includes(frame.method);
    return { accepted: false, reason: known ? 'malformed-event' : 'unknown-event' };
  }
  return { accepted: true, changes };
}
