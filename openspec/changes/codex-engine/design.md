# Design: Codex Engine MVP

## Technical Approach

Add Web Server Codex beside OpenCode. UI projects SDK shapes via authenticated `runtimeFetch`; spike supplies protocol evidence.

## Architecture Decisions

| Decision | Choice | Rejected / rationale |
|---|---|---|
| Harness boundary | `ExecutionTarget = {harnessId:"opencode", providerID, modelID, agent?, variant?} | {harnessId:"codex", modelRef:{kind:"default"}}`. Branch once; preserve exact OpenCode calls. | A registry is premature; Codex-as-provider breaks isolation. |
| Availability | `startWebUiServer` freezes eligibility from authoritative launch/host/runtime mode and server-owned descriptor/config; only Web Server qualifies. Client `surface` cannot grant/override access. Electron, hosted-mobile, Capacitor, and VS Code are unsupported; OpenCode remains usable. | UI/request surface is not authorization; broad `RuntimeAPIs` is unnecessary. |
| Identity/binding | Server owns `ses_codex_<uuid>` apart from OpenCode/thread IDs. Atomic `0600` `codex/bindings.v1.json` keys by `serverId` + canonical directory + session ID. | OpenCode shell sessions conflict; thread IDs expose foreign identity. |
| Process | Direct stdio `spawn(codex,["app-server"],{cwd,shell:false,windowsHide:true})` per active session; initialize-gated, 30-minute idle disposal, bounded shutdown escalation. | No daemon/socket or OpenCode lifecycle coupling. |
| State/events | Runtime owns in-memory transcript, status, turn, approvals, revision, and replay; it survives browser disconnect, not restart. Snapshots precede newer events. | Browser/raw JSON-RPC cannot own authority. |
| Schema | Spike generates TS/JSON Schema, records CLI version/SHA-256, and derives a committed protocol descriptor parsed from `unknown`. | Hand assumptions drift; schema libraries add dependencies. |

## Data Flow

```text
Web composer -> target switch -> runtimeFetch /api/codex -> CodexSessionRuntime
                                                     -> JSON-RPC client -> codex app-server
Codex frames -> generated validator -> translator -> canonical store
                                      -> synthetic WS/SSE -> existing reducer
Reconnect -> subscribe/buffer -> HTTP snapshots@revision -> apply newer events
Restart -> binding -> Codex resume/read -> fresh snapshot@revision or explicit recovery error
```

## Interfaces / Contracts

Binding is `{version,revision,sessionId,harnessId:"codex",threadId,runtimeId,directory,target,createdAt,updatedAt,firstTurnAt,lastCompletedAt}` metadata only—never credentials, prompts, reasoning, tool/command output. Identity/target freeze at first turn; conflicts or scope mismatch return `409`.

Missing store means empty. Top-level syntax/integrity/version failure atomically quarantines the whole store, preserves evidence, disables binding operations, and never becomes empty success. Per-record quarantine requires a valid envelope; valid records remain available and failures explicit/non-destructive. Unused threadless reservations prune. Missing threads fail without recreation.

Authenticated pre-proxy routes: `GET /api/codex/capabilities`, `GET|POST /api/codex/sessions`, `GET /api/codex/sessions/:id`, `/messages`, `/status`; `POST /prompt`, `/approvals/:requestId/reply`, `/abort`. Every route guards server eligibility and rejects excluded modes; surface hints confer no authority. No models route. Prompt needs a dedupe ID and returns after `turn/start`.

Status: `idle|starting|running|waiting_approval|interrupting|failed`; only completion is idle. Active transcript/status/turn/approval/replay is server-memory: it survives browser disconnect, not restart. Completed sessions reconstruct authoritatively on demand from bindings through spike-proven `thread/resume` and/or `thread/read`, yielding fresh snapshot/revision. Unsupported authoritative read returns an explicit limitation without changing the binding or fabricating content. Prior in-flight turn is marked interrupted/unknown and not claimed to have survived.

JSONL uses `StringDecoder` for fragmented/multiple lines, size bounds, monotonic IDs, 10s init, bounded control/start, 5s shutdown, and no turn timeout. Late IDs/unknown valid notifications warn. Framing/schema corruption fails turn, approvals, requests, and process. Ordinary request timeout rejects only that request; status stays busy/unknown.

Server approvals project `permission.asked` without `always`; atomic replies allow `once|reject` exactly once. OpenCode auto-accept sees only upstream events. Exit/abort fails pending approvals.

Abort validates runtime+directory+session, idempotently interrupts, rejects requests, terminalizes tools, clears ownership, and disposes on failure/shutdown. Codex content bypasses browser storage; INFO is lifecycle-only; stderr/DEBUG are bounded/redacted. Typed errors cover availability/auth, scope/binding/corruption, missing thread, protocol/schema, timeout/ambiguous start, rejection, interrupt, and exit.

## File Changes

| File | Action | Ownership |
|---|---|---|
| `packages/web/server/lib/codex/{routes,runtime,binding-store,jsonrpc-client,app-server-session,event-translator}.js` | Create | Identity, state, process, translation |
| `packages/web/server/lib/codex/generated/*` | Create | Generated schema/manifest/descriptor |
| `packages/web/server/index.js`, `lib/opencode/{feature-routes-runtime,shutdown-runtime}.js` | Modify | Composition, registration, shutdown |
| `packages/ui/src/{types/execution-target.ts,lib/codex/client.ts}` | Create | Target and trusted HTTP adapter |
| `packages/ui/src/sync/{session-actions,session-ui-store,bootstrap,session-message-loader,event-pipeline}.ts*` | Modify | Branch, snapshots, revisions |
| `packages/ui/src/components/chat/{ChatInput,ModelControls,PermissionCard}.tsx` | Modify | Selection and approvals |

## Testing Strategy

Strict RED-GREEN: fake-stream JSON-RPC; temp-data/injected-spawn eligibility/surface-spoof, whole-store/record quarantine, lifecycle/approval/abort/restart/isolation; UI routing/reducer/reference/reload; authenticated Codex Git fixture for gate, edit/diff, command, approval, abort, reconnect, reconstruction, unsupported-read, and interruption. OpenCode tests preserve provider/model/agent/variant, shell/command, optimistic, permission, and abort. Static checks prove contracts; fixtures prove lifecycle. Streaming stays O(affected session/part), batched, reference-stable.

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior and planned RED test |
|---|---|---|
| Documentation-like paths | N/A | No executable-file classification. |
| Git repository selection | Applicable | No `git -C`; accept canonical absolute directory; reject relative/mismatch/symlink escape; test absolute, relative, authoritative cwd. |
| Commit state | N/A | No commit automation. |
| Push state | N/A | No push automation. |
| PR commands | N/A | No PR command composition. |

## Migration / Rollout

Capabilities default off. Missing/incompatible/unauthenticated Codex disables only Codex. Rollback interrupts, disables Codex, preserves OpenCode, and quarantines bindings; no migration. Auto-chain: 800 lines.

## Open Questions

None; the spike determines wire/approval payloads, and failure blocks implementation.
