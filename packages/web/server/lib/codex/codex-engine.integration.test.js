import { readFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createCodexEngineFixture } from './codex-engine.integration-fixture.js';

const TURN_TIMEOUT_MS = 120_000;
const COMMAND_TIMEOUT_MS = 60_000;

const textFrom = (snapshot) => snapshot.parts
  .filter((part) => part.type === 'text')
  .map((part) => part.text)
  .join('');

const activeTools = (snapshot) => snapshot.parts.filter((part) => {
  const status = part.state?.status ?? part.status;
  return ['pending', 'running', 'inProgress'].includes(status);
});

describe.sequential('Codex engine process-backed integration', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await createCodexEngineFixture();
  }, COMMAND_TIMEOUT_MS);

  afterEach(async () => {
    if (process.env.CODEX_WU12_DIAGNOSTICS === '1') {
      console.info(`[codex-wu12-diagnostics] ${JSON.stringify(fixture?.protocolTrace() ?? [])}`);
    }
    await fixture?.cleanup();
    expect(fixture?.resourceState()).toEqual({
      browserSubscribers: 0,
      listenerOpen: false,
      relayStreams: 0,
      residualProcesses: 0,
      temporaryRootExists: false,
    });
  }, COMMAND_TIMEOUT_MS);

  it('streams a real conversation, survives browser reconnect, and relays authenticated reads', async () => {
    const workspace = fixture.workspaces.primary;
    const session = await fixture.createSession('direct', workspace);
    const observed = fixture.connectBrowser();
    const accepted = await fixture.prompt('direct', session.sessionId, workspace,
      'Reply with exactly WU12_STREAM_COMPLETE and do not use tools.');

    await fixture.waitForProjection(session.sessionId, (snapshot) => (
      snapshot.revision > accepted.revision && snapshot.status === 'idle'
      && snapshot.activeTurn === null && textFrom(snapshot).includes('WU12_STREAM_COMPLETE')
    ), TURN_TIMEOUT_MS);
    const revisionAtDisconnect = fixture.snapshot(session.sessionId).revision;
    fixture.disconnectBrowser(observed);

    const relayed = await fixture.getProjection('relay', session.sessionId, workspace);
    expect(relayed.engine).toBe('codex');
    expect(relayed.status).toBe('idle');
    expect(relayed.activeTurn).toBeNull();
    expect(textFrom(relayed)).toContain('WU12_STREAM_COMPLETE');
    expect(observed.every((event) => event.engine === 'codex')).toBe(true);

    const reconnected = fixture.connectBrowser();
    const replay = await fixture.getReplay('direct', session.sessionId, workspace, revisionAtDisconnect);
    expect(replay.kind).toBe('events');
    expect(replay.toRevision).toBe(relayed.revision);
    expect(reconnected).toHaveLength(0);
  }, TURN_TIMEOUT_MS);

  it('projects command, tool, file edit, diff, approve-once, and reject outcomes', async () => {
    const workspace = fixture.workspaces.primary;
    const session = await fixture.createSession('relay', workspace);
    await fixture.prompt('relay', session.sessionId, workspace,
      'This is an automated integration check. Run exactly ./edit-fixture.sh as a shell command now; do not describe or replace the command. After it succeeds, run exactly pwd. Then reply exactly WU12_EDIT_DONE.');

    const approvalSnapshot = await fixture.waitForProjection(session.sessionId,
      (snapshot) => snapshot.pendingApprovals.length > 0, TURN_TIMEOUT_MS);
    const approval = approvalSnapshot.pendingApprovals[0];
    const decision = {
      decision: 'once',
      threadId: approval.threadID,
      turnId: approval.turnID,
    };
    const firstReply = await fixture.replyApproval('direct', session.sessionId, workspace, approval.requestId, decision);
    const duplicateReply = await fixture.replyApproval('relay', session.sessionId, workspace, approval.requestId, decision);
    expect(duplicateReply).toEqual(firstReply);

    for (;;) {
      const state = await fixture.waitForProjection(session.sessionId, (snapshot) => (
        snapshot.pendingApprovals.length > 0 || (snapshot.status === 'idle' && snapshot.activeTurn === null)
      ), TURN_TIMEOUT_MS);
      if (state.status === 'idle' && state.activeTurn === null) break;
      const next = state.pendingApprovals[0];
      await fixture.replyApproval('relay', session.sessionId, workspace, next.requestId, {
        decision: 'once', threadId: next.threadID, turnId: next.turnID,
      });
    }

    const completed = await fixture.waitForProjection(session.sessionId, (snapshot) => (
      snapshot.status === 'idle' && snapshot.activeTurn === null && textFrom(snapshot).includes('WU12_EDIT_DONE')
    ), TURN_TIMEOUT_MS);
    const actual = await readFile(`${workspace}/fixture.txt`, 'utf8');
    const gitDiff = await fixture.gitDiff(workspace);
    const editTrace = fixture.protocolTrace();
    expect(actual.trim()).toBe('WU12_EDIT');
    expect(gitDiff).toContain('WU12_EDIT');
    expect(editTrace.some((event) => (
      event.kind === 'notification' && event.method === 'item/completed'
      && event.itemType === 'commandExecution' && event.itemStatus === 'completed'
    ))).toBe(true);
    expect(editTrace.some((event) => (
      event.method === 'turn/diff/updated' || event.itemType === 'fileChange'
    ))).toBe(false);
    expect(completed.diff).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: 'fixture.txt', patch: expect.stringContaining('WU12_EDIT') }),
    ]));
    expect(completed.parts.some((part) => part.type === 'tool')).toBe(true);
    expect(completed.pendingApprovals).toEqual([]);

    const rejectedSession = await fixture.createSession('direct', fixture.workspaces.secondary);
    await fixture.prompt('direct', rejectedSession.sessionId, fixture.workspaces.secondary,
      'Run the shell command touch rejected-probe.txt, then stop.');
    const rejectedPending = await fixture.waitForProjection(rejectedSession.sessionId,
      (snapshot) => snapshot.pendingApprovals.length > 0, TURN_TIMEOUT_MS);
    const rejected = rejectedPending.pendingApprovals[0];
    await fixture.replyApproval('direct', rejectedSession.sessionId, fixture.workspaces.secondary,
      rejected.requestId, { decision: 'reject', threadId: rejected.threadID, turnId: rejected.turnID });
    const rejectedDone = await fixture.waitForProjection(rejectedSession.sessionId,
      (snapshot) => snapshot.activeTurn === null && snapshot.pendingApprovals.length === 0, TURN_TIMEOUT_MS);
    expect(await fixture.exists(`${fixture.workspaces.secondary}/rejected-probe.txt`)).toBe(false);
    expect(activeTools(rejectedDone)).toEqual([]);
  }, TURN_TIMEOUT_MS);

  it('aborts truthfully and isolates concurrent sessions, threads, and workspaces', async () => {
    const abortSession = await fixture.createSession('direct', fixture.workspaces.primary);
    await fixture.prompt('direct', abortSession.sessionId, fixture.workspaces.primary,
      'Run node -e "setTimeout(() => process.stdout.write(`WU12_TOO_LATE`), 30000)" and then stop.');
    const pending = await fixture.waitForProjection(abortSession.sessionId,
      (snapshot) => snapshot.pendingApprovals.length > 0, TURN_TIMEOUT_MS);
    const approval = pending.pendingApprovals[0];
    await fixture.replyApproval('direct', abortSession.sessionId, fixture.workspaces.primary,
      approval.requestId, { decision: 'once', threadId: approval.threadID, turnId: approval.turnID });
    await fixture.waitForProjection(abortSession.sessionId,
      (snapshot) => activeTools(snapshot).length > 0, TURN_TIMEOUT_MS);
    const [abortA, abortB] = await Promise.all([
      fixture.abort('direct', abortSession.sessionId, fixture.workspaces.primary),
      fixture.abort('relay', abortSession.sessionId, fixture.workspaces.primary),
    ]);
    expect(abortB).toEqual(abortA);
    const aborted = await fixture.waitForProjection(abortSession.sessionId,
      (snapshot) => snapshot.activeTurn === null && snapshot.pendingApprovals.length === 0, TURN_TIMEOUT_MS);
    expect(aborted.status).toBe('idle');
    expect(activeTools(aborted)).toEqual([]);

    const primary = await fixture.createSession('direct', fixture.workspaces.primary);
    const secondary = await fixture.createSession('relay', fixture.workspaces.secondary);
    expect(fixture.protocolTrace().filter((event) => (
      event.kind === 'http-error' && event.action === 'session.create'
    ))).toEqual([]);
    const [primaryTurn, secondaryTurn] = await Promise.all([
      fixture.prompt('direct', primary.sessionId, fixture.workspaces.primary,
        'Reply with exactly WU12_PRIMARY and do not use tools.'),
      fixture.prompt('relay', secondary.sessionId, fixture.workspaces.secondary,
        'Reply with exactly WU12_SECONDARY and do not use tools.'),
    ]);
    expect(primary.sessionId).not.toBe(secondary.sessionId);
    expect(primaryTurn.threadId).not.toBe(secondaryTurn.threadId);
    const [primaryDone, secondaryDone] = await Promise.all([
      fixture.waitForProjection(primary.sessionId, (snapshot) => textFrom(snapshot).includes('WU12_PRIMARY'), TURN_TIMEOUT_MS),
      fixture.waitForProjection(secondary.sessionId, (snapshot) => textFrom(snapshot).includes('WU12_SECONDARY'), TURN_TIMEOUT_MS),
    ]);
    expect(textFrom(primaryDone)).not.toContain('WU12_SECONDARY');
    expect(textFrom(secondaryDone)).not.toContain('WU12_PRIMARY');
    await expect(fixture.getProjection('direct', primary.sessionId, fixture.workspaces.secondary))
      .rejects.toMatchObject({ status: 404 });
  }, TURN_TIMEOUT_MS);

  it('resumes a completed thread after server restart and classifies completed-read support', async () => {
    const workspace = fixture.workspaces.primary;
    const session = await fixture.createSession('direct', workspace);
    const first = await fixture.prompt('direct', session.sessionId, workspace,
      'Reply with exactly WU12_BEFORE_RESTART and do not use tools.');
    await fixture.waitForProjection(session.sessionId,
      (snapshot) => snapshot.status === 'idle' && textFrom(snapshot).includes('WU12_BEFORE_RESTART'), TURN_TIMEOUT_MS);

    await fixture.restartServer();
    const recovery = await fixture.recoverCompleted(session.sessionId, workspace);
    expect(['recovered', 'limited']).toContain(recovery.kind);
    if (recovery.kind === 'limited') {
      expect(recovery.code).toBe('completed-thread-history-unavailable');
    } else {
      expect(recovery.snapshot.transcript.state).toBe('complete');
    }

    const second = await fixture.prompt('relay', session.sessionId, workspace,
      'Reply with exactly WU12_AFTER_RESTART and do not use tools.');
    expect(second.threadId).toBe(first.threadId);
    const resumed = await fixture.waitForProjection(session.sessionId,
      (snapshot) => snapshot.status === 'idle' && textFrom(snapshot).includes('WU12_AFTER_RESTART'), TURN_TIMEOUT_MS);
    expect(resumed.failure).toBeNull();
    expect(fixture.openCodeFallbackHits).toBe(0);
    expect(await fixture.containsSensitivePersistence()).toBe(false);
  }, TURN_TIMEOUT_MS);

  it('archives fixture threads where supported and leaves no listeners, roots, or processes', async () => {
    const archive = await fixture.archiveThreads();
    expect(['passed', 'unsupported-protocol-limitation']).toContain(archive.outcome);
    await fixture.cleanup();
    expect(fixture.resourceState()).toEqual({
      browserSubscribers: 0,
      listenerOpen: false,
      relayStreams: 0,
      residualProcesses: 0,
      temporaryRootExists: false,
    });
  }, TURN_TIMEOUT_MS);
});
