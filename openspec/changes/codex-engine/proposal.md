# Proposal: Codex Engine MVP

## Intent

Today chat requires OpenCode provider/model and its SDK; no Codex engine, binding, or event projection exists. Web Server users need Codex turns and continuity.

## Scope

### In Scope
- Run the compatibility spike proving `thread/start → turn/start → streaming → completed → thread/resume`; failure blocks all `packages/` changes.
- Add Web Server Codex selection, execution, streaming, approvals, abort, persistent binding, and completed-thread resume.
- Server-owned turns survive browser closure; approvals override the plan's Milestone 2 placement.

### Out of Scope
- Codex in Electron, hosted/mobile, Capacitor, or VS Code; OpenCode stays unchanged.
- Milestone 2: questions, queue, titles, model/effort UX, attachments, advanced error/reconnect UX.
- Milestone 3: Goal, MultiRun, MCP, subagents, OpenChamber Tool, native import, usage/quota.
- In-flight server-restart survival; daemon/unix-socket ownership.

## Capabilities

### New Capabilities
- `codex-engine`: Web Server Codex execution, approvals, streaming, abort, binding, and completed-thread resume.

### Modified Capabilities
- None.

## Architectural Invariants

- Codex inference never enters the OpenCode provider/model/SDK prompt path.
- Existing OpenCode sessions are regression-protected.
- Browser lifetime never owns Codex execution lifetime.
- Failures never masquerade as empty or idle success.
- Codex credentials and sensitive JSON-RPC payloads are never persisted or logged.

## Approach

After the gate, add a Web Server Codex boundary projecting authoritative events into chat, approval, and Git surfaces. Preserve OpenCode; defer contracts/topology to design.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `docs/codex-app-server-spike.md` | New | Gate evidence |
| `packages/web/server/` | Modified | Lifecycle, binding, control, events |
| `packages/ui/src/components/chat/`, `packages/ui/src/sync/` | Modified | Web-gated selection and projection |
| `packages/electron/`, `packages/vscode/`, `packages/mobile/` | Protected | OpenCode regressions only |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Protocol drift | High | Hard spike; observed/generated contracts |
| Binding collision | Medium | Scoped identity; atomic validation |
| False idle/busy after failure | High | Explicit failure, cleanup, recovery evidence |
| Runtime leakage | Medium | Web gate; OpenCode regressions |

## Rollback Plan

Disable Codex, stop execution safely, preserve OpenCode data/defaults, and quarantine bindings.

## Dependencies

- Authenticated Codex CLI passing the gate.
- Process-backed fixture; no general E2E harness exists.

## Success Criteria

- [ ] Web users select Codex, bind a thread, and turn outside OpenCode.
- [ ] Text, tools, file changes, completion, and Git diff stream visibly in order.
- [ ] Approvals are resolvable without silent auto-approval; abort settles truthfully.
- [ ] Browser close/reopen preserves execution and recovers results.
- [ ] Server restart resumes a completed thread for a next turn; in-flight survival is excluded.
- [ ] OpenCode remains unchanged; failures are explicit and secrets/payloads unlogged.
