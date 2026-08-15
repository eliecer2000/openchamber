# Exploration: Codex Engine Current Harness, Session Sync, and Runtime Architecture

## Exploration: Codex Engine preparation

### Current State

This report maps the supplied checkout only. No Git command was run, so branch name and SHA were not independently verified. No `.codegraph/` index exists; investigation used bounded file reads and searches as requested.

#### 1. ChatInput-to-OpenCode execution path

- `ChatInput` has no engine boundary. It reads `sendMessage` directly from `useSessionUIStore` (`packages/ui/src/components/chat/ChatInput.tsx:299-303`), rejects submission when provider or model is absent (`:1000-1006`), and passes provider, model, agent, variant, attachments, and input mode to the store (`:1217-1228`).
- `useSessionUIStore.sendMessage` creates a session for an open draft and then calls `routeMessage` (`packages/ui/src/sync/session-ui-store.ts:1277-1326`); existing sessions use the same route (`:1329-1408`).
- `routeMessage` is a mode switch, not a harness router: shell mode calls `opencodeClient.shellSession`, recognized slash commands call `opencodeClient.sendCommand`, and normal prompts call `opencodeClient.sendMessage` through `optimisticSend` (`packages/ui/src/sync/session-ui-store.ts:124-221`).
- `optimisticSend` inserts SDK-shaped `Message` and `Part` records, sets a temporary busy status, and reconciles or rolls back failures (`packages/ui/src/sync/session-actions.ts:1270-1387`, `:1389-1461`). Ambiguous POST failures are confirmed from recent server messages before rollback (`:1393-1406`, `:1465-1494`).
- `opencodeClient.sendMessage` builds OpenCode SDK part inputs and calls `client.session.promptAsync` (`packages/ui/src/lib/opencode/client.ts:753-883`). The SDK client itself is created with `runtimeFetch` (`:187-190`), preserving active-runtime routing and auth.

No `ExecutionTarget`, `HarnessId`, harness registry, harness router, backend registry, `useHarnessStore`, or `packages/**/harness/` implementation exists in this checkout. The existing `routeMessage` symbol is fully OpenCode-coupled.

#### 2. Provider/model and ExecutionTarget-like contracts

- The send contract requires `providerID` and `modelID`; engine identity is not represented (`packages/ui/src/sync/session-ui-store.ts:124-138`, `:335-347`).
- `NewSessionDraftState` stores project, directory, worktree, title, synthetic context, and permission-auto-accept state, but no engine target (`packages/ui/src/sync/session-ui-store.ts:258-271`).
- `selection-store.ts` persists per-session provider/model/agent maps, capped at 150 sessions; variants are in-memory only (`packages/ui/src/sync/selection-store.ts:10-44`, `:46-168`). Keys are session IDs, not runtime + session identities.
- MultiRun creates OpenCode sessions directly and records each run as provider/model/variant (`packages/ui/src/stores/useMultiRunStore.ts:165-172`, `:211-267`, `:296-317`).
- The server-side OpenChamber session facade also parses `provider/model`, resolves defaults from OpenCode providers/agents/config, creates an OpenCode session, and invokes `prompt_async` (`packages/web/server/lib/openchamber-sessions/routes.js:15-33`, `:97-173`, `:176-220`, `:565-672`). It is a control facade over OpenCode, not a backend-neutral session service.
- Existing `codex` identifiers are presentation/quota provider labels only (`packages/ui/src/lib/modelDisplay.ts:49-53`; `packages/ui/src/lib/quota/providers/index.ts:8-18`). They are not a Codex execution engine.

#### 3. Session persistence and foreign-session binding

- UI session CRUD delegates to the OpenCode SDK (`packages/ui/src/lib/opencode/client.ts:523-585`; `packages/ui/src/sync/session-actions.ts:724-756`). The session ID exposed to the UI is the OpenCode session ID.
- `POST /api/openchamber/sessions` likewise returns the newly created OpenCode `sessionId`; send/fork routes remain OpenCode-backed (`packages/web/server/lib/openchamber-sessions/routes.js:637-672`, `:797-853`).
- OpenChamber local persistence is continuity/cache data, not transcript authority. `persist-cache.ts` explicitly persists bounded session-list metadata while messages/parts are always loaded from the server (`packages/ui/src/sync/persist-cache.ts:1-17`, `:208-241`). `last-session-cache.ts` stores only the last active session and directory per runtime, requiring authoritative confirmation before restore (`packages/ui/src/sync/last-session-cache.ts:3-16`, `:59-90`).
- `selection-store.ts` persists user selection preferences, while server `session-runtime.js` keeps status/attention/activity maps in memory (`packages/web/server/lib/opencode/session-runtime.js:41-46`, `:179-190`).
- No foreign-session binding exists. `foreignSessionId` and every PR #884 harness filename occur only in `PLAN_OPENCHAMBER_CODEX_CLI.md`; no source implementation was found. Generic OpenCode session metadata is available, but there is no binding schema, atomic binding store, harness-conflict rule, or foreign-session lifecycle.

#### 4. Session/message/part/status synchronization

- Directory child stores own live per-directory `Session`, `Message`, `Part`, status, permission, and question data; the global sessions store is for complete active/archived sidebar coverage (`packages/ui/src/sync/DOCUMENTATION.md:7-39`). Store state imports all authoritative domain types from `@opencode-ai/sdk/v2/client` (`packages/ui/src/sync/types.ts:1-19`, `:41-69`).
- The event pipeline defaults to WebSocket when available, with SSE fallback. It opens `/api/global/event/ws` through `openRuntimeWebSocket`, including runtime URL-token/relay handling (`packages/ui/src/sync/event-pipeline.ts:15-31`, `:208-233`, `:597-642`, `:786-818`). SSE uses the SDK `global.event()` async iterator with `Last-Event-ID` (`:557-595`).
- The web server's browser-facing WS paths are `/api/global/event/ws` and `/api/event/ws` (`packages/web/server/lib/event-stream/protocol.js:1-12`). They bridge to OpenCode upstream SSE; the global hub keeps a bounded 2,048-event replay window (`packages/web/server/lib/event-stream/global-hub.js:1-17`, `:56-114`, `:149-156`).
- Upstream SSE parsing tracks `Last-Event-ID`, aborts stalled reads, and reconnects (`packages/web/server/lib/event-stream/upstream-reader.js:48-66`, `:123-183`, `:205-239`). Browser reconnect uses exponential backoff, heartbeat aborts, visibility/online interruption, and WS-to-SSE fallback (`packages/ui/src/sync/event-pipeline.ts:427-465`, `:542-548`, `:799-854`).
- `SyncProvider` batches each ordered directory flush and runs reconnect/transport-switch HTTP resync across materialized directories (`packages/ui/src/sync/sync-context.tsx:2168-2201`, `:2203-2243`).
- Authoritative event shapes consumed by the reducer are:
  - `session.created|updated`: `properties.info: Session`; `session.deleted`: `properties.info` or `sessionID` (`packages/ui/src/sync/event-reducer.ts:247-306`).
  - `session.status`: `{ sessionID, status }`; `session.idle|error`: `{ sessionID }` and both settle to idle (`:325-351`).
  - `message.updated`: `{ info: Message }`; `message.removed`: `{ sessionID, messageID }` (`:354-399`).
  - `message.part.updated`: `{ sessionID?, part: Part }`; delta: `{ sessionID?, messageID, partID, field, delta }` (`:401-455`, `:475-511`).
  - `permission.asked`: the request in `properties`; `permission.replied`: `{ sessionID, requestID }` (`:521-547`). Questions follow analogous asked/replied/rejected shapes (`:549-569`).
- Full message snapshots come from `sdk.session.messages`; missing data is an error, successful empty is authoritative, records are chronological by message creation time, and part arrays preserve response/event order (`packages/ui/src/sync/session-message-loader.ts:567-618`; `packages/ui/src/sync/DOCUMENTATION.md:171-188`).
- Status has dual authority: live events update an incremental non-idle index, while authoritative per-directory `/session/status` snapshots seed and repair missed events (`packages/ui/src/sync/global-session-status.ts:15-21`, `:67-108`, `:110-166`).
- The pipeline already normalizes one OpenChamber-owned synthetic shape, `openchamber:session-status`, into `session.status` (`packages/ui/src/sync/event-pipeline.ts:79-135`). Server-side `createGlobalUiEventBroadcaster` can fan synthetic events to both SSE and WS clients (`packages/web/server/lib/event-stream/runtime.js:18-50`). There is no equivalent current translator for foreign message/part/tool events.

#### 5. UI/server runtime boundaries

- Official OpenCode calls use the v2 SDK through `opencodeClient`; that client injects `runtimeFetch` (`packages/ui/src/lib/opencode/client.ts:1-14`, `:187-190`).
- `runtimeFetch` resolves `/api`, `/auth`, and `/health`, adds active-runtime auth, preserves request fidelity, and transparently routes through the private relay when active (`packages/ui/src/lib/runtime-fetch.ts:10-12`, `:80-99`, `:144-203`).
- `RuntimeAPIs` currently covers runtime descriptor, terminal, git, files, settings, permission policy, notifications, GitHub, push, diagnostics, client auth, tools, editor, and VS Code features; it has no agent-execution or harness API (`packages/ui/src/lib/api/types.ts:1225-1241`).
- Web and VS Code deliberately provide different `RuntimeAPIs` implementations (`packages/web/src/api/index.ts:34-51`; `packages/vscode/webview/api/index.ts:12-40`). VS Code handles OpenCode proxy/SSE via its extension bridge and does not run the OpenChamber web server runtime (`packages/vscode/src/DOCUMENTATION.md:53-77`).
- Electron starts the web server in-process and reuses web/server behavior (`packages/electron/README.md:5-15`). Capacitor bundles only the UI and connects to an existing OpenChamber server (`packages/mobile/README.md:3-16`).
- OpenChamber-owned feature routes register before `setupProxy(app)` installs the generic `/api/*` OpenCode proxy (`packages/web/server/index.js:1712-1756`; `packages/web/server/lib/opencode/startup-pipeline-runtime.js:90-109`; `packages/web/server/lib/opencode/proxy.js:769-846`).
- Existing shared workspace infrastructure—Git, files, terminal, worktrees, relay, notifications—already lives outside the OpenCode SDK send path. The server feature composer registers Git/FS/OpenChamber routes independently (`packages/web/server/lib/opencode/feature-routes-runtime.js:171-202`, `:295-323`).

#### 6. Approvals and permissions

- `PermissionCard` consumes the generic OpenChamber `PermissionRequest` shape and exposes `once | always | reject` (`packages/ui/src/types/permission.ts:1-14`; `packages/ui/src/components/chat/PermissionCard.tsx:44-47`, `:91-119`). Tool display already recognizes common edit/write/shell/fetch aliases (`PermissionCard.tsx:49-88`).
- Cards are rendered beside pending questions from directory sync state (`packages/ui/src/components/chat/ChatContainer.tsx:371-379`).
- Replies currently call OpenCode's `permission.reply` SDK method using the authoritative session directory (`packages/ui/src/sync/session-actions.ts:1548-1570`). The reducer removes a card only on `permission.replied` (`packages/ui/src/sync/event-reducer.ts:535-546`).
- Web/desktop/mobile have a server-owned persisted auto-accept policy that survives UI disconnects and server restarts; it subscribes to the global OpenCode event hub and replies `once` to eligible requests (`packages/web/server/lib/permission-auto-accept/DOCUMENTATION.md:3-30`; `packages/web/server/lib/permission-auto-accept/runtime.js:21-38`, `:147-177`, `:211-236`). VS Code intentionally retains a foreground-only responder (`packages/vscode/src/DOCUMENTATION.md:75-77`).
- The UI and reducer are reusable as normalized projections, but the current reply backend is OpenCode-specific. There is no engine-neutral pending-request registry or response dispatch path.

#### 7. Long-running process, reconnect, timeout, and exit patterns

- Managed OpenCode lifecycle uses direct `spawn(binary, args)` without shell parsing, detached Unix process groups, piped stdout/stderr, a bounded startup handshake, and pre-ready exit/error handling (`packages/web/server/lib/opencode/lifecycle.js:254-355`).
- Shutdown escalates process-group `SIGTERM` to `SIGKILL`; Windows uses bounded `taskkill` fallbacks (`packages/web/server/lib/opencode/lifecycle.js:158-228`). Restart is single-flight, distinguishes managed from external ownership, waits for port release, and rebinds event readers after a port change (`:620-709`).
- Managed children are atomically registered per PID and reaped on later startup only after owner death and process identity verification (`packages/web/server/lib/opencode/managed-process-registry.js:1-35`, `:51-61`, `:90-120`, `:191-250`).
- Health monitoring avoids restarting a merely slow busy process until a bounded stale-busy grace expires; a definitely exited process restarts immediately (`packages/web/server/lib/opencode/lifecycle.js:984-1089`).
- `DictationWorkerClient` demonstrates correlated pending requests, per-request timeouts, bounded stderr tail, reject-all-pending on unexpected process exit, session error fan-out, and idle shutdown (`packages/web/server/lib/dictation/local/worker-client.js:33-47`, `:137-184`, `:223-283`). No focused worker-client test file was found.
- The terminal runtime demonstrates browser-independent server process ownership, reconnect snapshots with monotonic sequence numbers, a 30-minute idle timeout, serialized restarts, and bounded terminate/kill escalation (`packages/web/server/lib/terminal/runtime.js:15-20`, `:81-109`, `:123-176`, `:242-275`, `:318-389`).
- Graceful server shutdown stops watcher/session/goal/scheduler runtimes, terminal and message-stream runtimes, then the managed OpenCode process and HTTP server under bounded waits (`packages/web/server/lib/opencode/shutdown-runtime.js:35-75`, `:77-121`).

These are reusable precedents, but no generic subprocess/JSON-RPC lifecycle component exists today.

#### 8. Minimum verified surfaces for plan Milestone 1

Strict TDD is active (`openspec/config.yaml:15`, `:126-135`). The minimum evidence surface is broader than a happy-path prompt:

1. Composer and draft creation: engine selection must not break current required provider/model behavior (`ChatInput.tsx`, `session-ui-store.ts`).
2. OpenCode regression path: session create, slash command, shell, normal `promptAsync`, optimistic confirmation/rollback, queue, abort, and runtime-switch guards must remain unchanged.
3. Server route ownership: any OpenChamber-owned execution endpoint must be authenticated, relay-compatible, and registered before the generic OpenCode proxy; VS Code behavior must be explicit.
4. Durable identity: create/reload/restart/resume must prove an OpenChamber-visible session can recover its foreign thread without credentials or cross-runtime/session collisions.
5. Process protocol: fragmented/multiple/malformed JSONL, request correlation, server-initiated requests, init/request/shutdown timeout, stderr bounds, exit rejection, and process cleanup need deterministic tests.
6. Event projection: text, reasoning, tool start/output/completion, file change, turn completion/error, and part ordering must pass through the existing batch/reducer/materialization contracts without broad streaming-store churn.
7. Browser disconnect/reconnect: execution must continue without a live browser, then recover transcript and authoritative status through snapshot + live-event reconciliation.
8. Abort and process exit: every terminal path must settle status, reject pending requests, clear active turn state, and prevent running tool cards from remaining active.
9. Existing render surfaces: text, reasoning, expandable tools, command output, and diff/file visibility must be exercised (`packages/ui/src/components/chat/message/parts/DOCUMENTATION.md:7-50`, `:84-90`).
10. Runtime coverage: web server, Electron in-process server, hosted/mobile/relay clients, and explicit VS Code support or unsupported behavior.

Existing focused tests cover the nearest current contracts: `packages/ui/src/lib/opencode/client.test.ts`, `packages/ui/src/sync/event-pipeline.test.ts`, `packages/ui/src/sync/__tests__/event-reducer.test.ts`, `packages/ui/src/sync/session-message-loader.test.ts`, `packages/ui/src/components/chat/PermissionCard.test.ts`, `packages/web/server/lib/openchamber-sessions/routes.test.js`, `packages/web/server/lib/event-stream/*.test.js`, `packages/web/server/lib/opencode/lifecycle.test.js`, and `packages/web/server/lib/permission-auto-accept/runtime.test.js`. The repository has no general E2E harness, so the plan's process-backed conversation/reconnect/restart acceptance needs an explicit new integration fixture in downstream phases.

#### 9. Missing assumptions and invariants

Missing decisions or evidence:

- The installed Codex CLI version, generated app-server schema, auth state, exact notification/request names, and protocol compatibility have not been verified. The plan's compatibility spike remains a hard pre-implementation gate.
- Current UI session identity equals OpenCode session identity. The intended ownership and durable storage of a separate OpenChamber session ID ↔ Codex thread ID binding are undefined on current `main`.
- Runtime support is unresolved for VS Code, which has no OpenChamber server process, and for remote/mobile clients that depend on a separately running server.
- Browser-close continuation is covered by server-owned terminal/permission patterns, but OpenChamber restart behavior for an in-flight Codex turn versus a resumable completed thread is not specified.
- Milestone scope conflicts internally: Milestone 1 omits approvals (`PLAN_OPENCHAMBER_CODEX_CLI.md:1703-1727`), Milestone 2 includes them (`:1731-1743`), but MVP Definition of Done requires approvals (`:1761-1781`).
- Model/effort catalog authority, attachment support, `always` approval semantics, question recovery after reload, and process cardinality/idle policy require protocol evidence rather than assumptions.

Invariants to preserve:

- Codex inference must not enter OpenCode's provider/model or SDK prompt path.
- Existing OpenCode session behavior and provider/model selection must remain intact.
- Official OpenCode APIs stay on `opencodeClient`; OpenChamber-owned capabilities stay on authenticated runtime transport.
- Runtime identity + authoritative directory + session identity must remain the routing key; guessed or stale directories cannot dispatch, abort, or reply.
- Fetch/process/translation failure must never masquerade as authoritative empty success or idle success.
- Message chronology, authoritative part order, per-directory event order, optimistic confirmation, and no-op/reference stability must be preserved.
- Streaming must not trigger global scans or unrelated subscriber updates.
- Ambiguous prompt transport failure must not cause duplicate execution.
- Browser connection lifetime must not own server execution lifetime.
- Process exit, interrupt, timeout, and shutdown must settle all pending state and leave no orphan process or permanently busy session.
- Credentials, complete prompts, reasoning, source payloads, and command output must not be logged or persisted in bindings.

#### 10. PR #884 path check against current checkout

None of the plan's PR #884 paths exists on the supplied checkout:

- `packages/web/server/lib/harness/codex-appserver.js` — absent; lifecycle precedents are `lib/opencode/lifecycle.js` and `lib/dictation/local/worker-client.js`.
- `packages/web/server/lib/harness/codex-backend.js` — absent; no backend/harness interface exists.
- `packages/web/server/lib/harness/jsonrpc-subprocess.js` — absent; no JSON-RPC subprocess client exists.
- `packages/web/server/lib/harness/session-bindings.js` — absent; no foreign-session binding mechanism exists.
- `packages/web/server/lib/harness/backends.js` — absent; no backend registry exists.

The paths do not map one-to-one to current files. Process lifecycle, event fan-out, session facade, and sync reducer precedents map by responsibility only; Codex protocol, binding, and harness responsibilities remain missing. No unrelated historical PR content was inspected.

### Affected Areas

- `packages/ui/src/components/chat/ChatInput.tsx` — current submission entrypoint and required provider/model coupling.
- `packages/ui/src/sync/session-ui-store.ts` — current send routing, session creation, and draft lifecycle.
- `packages/ui/src/sync/session-actions.ts` — optimistic send, abort, permission/question replies, and failure reconciliation.
- `packages/ui/src/sync/selection-store.ts` — persisted provider/model/agent selections with no execution-engine identity.
- `packages/ui/src/sync/event-pipeline.ts` — runtime-aware WS/SSE ingestion, reconnect, coalescing, and synthetic status normalization.
- `packages/ui/src/sync/event-reducer.ts` — authoritative session/message/part/status/permission/question mutation shapes.
- `packages/ui/src/sync/session-message-loader.ts` — authoritative transcript loading and optimistic reconciliation.
- `packages/ui/src/lib/opencode/client.ts` — official SDK boundary and current `promptAsync` execution endpoint.
- `packages/ui/src/lib/api/types.ts`, `packages/ui/src/lib/runtime-fetch.ts` — shared runtime capability and transport boundaries.
- `packages/web/server/lib/openchamber-sessions/routes.js` — existing OpenChamber-owned but OpenCode-coupled session control facade.
- `packages/web/server/lib/event-stream/` — upstream OpenCode SSE ownership, browser WS fan-out, replay, and rebind behavior.
- `packages/web/server/lib/opencode/lifecycle.js`, `managed-process-registry.js`, `shutdown-runtime.js` — managed process lifecycle and cleanup precedents.
- `packages/web/server/lib/dictation/local/worker-client.js` — correlated subprocess request/exit/idle precedent.
- `packages/web/server/lib/permission-auto-accept/` — server-owned persistent approval policy precedent.
- `packages/web/src/api/`, `packages/vscode/webview/api/`, `packages/electron/README.md`, `packages/mobile/README.md` — runtime parity boundaries.

### Approaches

Architecture approaches were intentionally not evaluated in this phase. The requested work was a current-state evidence map; architecture selection belongs to `sdd-propose` and later `sdd-design` after the Codex compatibility spike evidence is available.

### Recommendation

Proceed to `sdd-propose`. The proposal should use this map to define intent, scope, non-goals, runtime coverage, and acceptance gates, while explicitly resolving session identity/binding ownership and the Milestone 1 approvals conflict. It must keep the compatibility spike as the gate before source changes and must not treat the responsibility-level current-file analogues as an already existing harness.

### Risks

- Treating `routeMessage` as a harness abstraction would hide its required provider/model and OpenCode SDK coupling.
- Reusing OpenCode session IDs or foreign thread IDs without a durable identity contract can collide with runtime/directory-scoped state and persisted selection keys.
- Injecting translated events without authoritative snapshot/reconnect behavior can leave stale busy status, missing parts, or permanently running tools.
- A new HTTP/WS path can work locally while failing in relay, Electron, mobile, or VS Code due to auth/transport boundary differences.
- Reusing process snippets without full exit, orphan, timeout, and shutdown semantics can strand requests or subprocesses.
- The current plan's approvals milestone contradiction can create false MVP completion unless resolved before specifications.
- No general E2E harness currently proves browser close, server restart, native process execution, or real Codex protocol behavior.

### Ready for Proposal

Yes. Current architecture, missing abstractions, reusable precedents, minimum Milestone 1 evidence surfaces, and unresolved assumptions are mapped with source evidence. The next phase should be `sdd-propose`; implementation remains blocked on the Codex app-server compatibility spike gate.
