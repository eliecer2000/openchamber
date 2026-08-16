# Apply Progress: Codex Engine MVP

## Phase Result Contract

```yaml
status: success
executive_summary: >-
  WU13 worker checks passed after adding the real `emitSyncConfigChanged`
  contract as a faithful no-op in the stale `session-actions.test.ts` mock.
  Preserved Web OpenCode 105/105 and Codex 79/79 evidence remained unchanged;
  all 15 isolated UI files passed 207/207, followed by syntax, UI/Web static,
  protocol generation/export/manifest, and dead-code checks. Final acceptance
  remains conditional on parent POST-CLEANUP/native settlement.
artifacts:
  - openspec/changes/codex-engine/apply-progress.md
  - openspec/changes/codex-engine/tasks.md
  - engram:sdd/codex-engine/apply-progress
  - engram:sdd/codex-engine/tasks
  - scripts/generate-codex-protocol.mjs
  - packages/web/server/lib/codex/jsonrpc-client.js
  - packages/web/server/lib/codex/jsonrpc-client.test.js
  - packages/web/server/lib/codex/generated/protocol-descriptor.js
  - packages/web/server/lib/codex/generated/protocol.schema.json
  - packages/web/server/lib/codex/generated/manifest.json
  - packages/web/server/lib/codex/binding-store.js
  - packages/web/server/lib/codex/binding-store.test.js
  - packages/web/server/lib/codex/app-server-session.js
  - packages/web/server/lib/codex/app-server-session.test.js
  - packages/web/server/lib/codex/runtime.js
  - packages/web/server/lib/codex/runtime.test.js
  - packages/web/server/lib/codex/routes.js
  - packages/web/server/lib/codex/routes.test.js
  - packages/web/server/index.js
  - packages/web/server/lib/opencode/feature-routes-runtime.js
  - packages/web/server/lib/opencode/shutdown-runtime.js
  - packages/web/server/lib/opencode/shutdown-runtime.test.js
  - packages/web/server/lib/opencode/DOCUMENTATION.md
  - packages/web/server/lib/codex/event-translator.js
  - packages/web/server/lib/codex/event-translator.test.js
  - packages/web/server/lib/event-stream/runtime.js
  - packages/web/server/lib/event-stream/runtime.test.js
  - packages/ui/src/sync/event-pipeline.ts
  - packages/ui/src/sync/event-pipeline.test.ts
  - packages/ui/src/sync/event-reducer.ts
  - packages/ui/src/sync/__tests__/event-reducer.test.ts
  - packages/ui/src/sync/DOCUMENTATION.md
  - packages/ui/src/sync/bootstrap.ts
  - packages/ui/src/sync/bootstrap.test.ts
  - packages/ui/src/sync/session-message-loader.ts
  - packages/ui/src/sync/session-message-loader.test.ts
  - packages/ui/src/lib/codex/client.ts
  - packages/ui/src/lib/codex/client.test.ts
  - packages/ui/src/types/permission.ts
  - packages/ui/src/components/chat/PermissionCard.tsx
  - packages/ui/src/components/chat/PermissionCard.test.ts
  - packages/ui/src/components/chat/permissionCardPatterns.ts
  - packages/ui/src/sync/session-actions.ts
  - packages/ui/src/sync/session-actions.test.ts
  - packages/ui/src/types/execution-target.ts
  - packages/ui/src/types/execution-target.test.ts
  - packages/ui/src/components/chat/ChatInput.tsx
  - packages/ui/src/components/chat/composer/ui/ComposerFooter.tsx
  - packages/ui/src/components/chat/composer/DOCUMENTATION.md
  - packages/ui/src/sync/session-ui-store.ts
  - packages/ui/src/sync/codex-execution-routing.test.ts
  - packages/ui/src/sync/selection-store.ts
  - packages/ui/src/sync/selection-store.test.ts
  - packages/ui/src/lib/i18n/messages/en.ts
  - packages/ui/src/lib/i18n/messages/es.ts
  - packages/ui/src/lib/i18n/messages/fr.ts
  - packages/ui/src/lib/i18n/messages/de.ts
  - packages/ui/src/lib/i18n/messages/pl.ts
  - packages/ui/src/lib/i18n/messages/pt-BR.ts
  - packages/ui/src/lib/i18n/messages/uk.ts
  - packages/ui/src/lib/i18n/messages/ko.ts
  - packages/ui/src/lib/i18n/messages/ja.ts
  - packages/ui/src/lib/i18n/messages/zh-CN.ts
  - packages/ui/src/lib/i18n/messages/zh-TW.ts
  - packages/web/server/lib/codex/codex-engine.integration.test.js
  - packages/web/server/lib/codex/codex-engine.integration-fixture.js
next_recommended: sdd-verify
risks: >-
  Parent POST-CLEANUP and native settlement remain pending outside this worker.
skill_resolution: paths-injected
```

## Status

- Change: `codex-engine`
- Mode: Strict TDD
- Delivery: `auto-chain`, `feature-branch-chain` by default; WU11 only is maintainer-approved `size:exception` with effective delivery strategy `exception-ok`
- Current slice: WU13 final regression/release checks — **COMPLETE / WORKER CHECKS PASSED** at test-only candidate `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`; parent POST-CLEANUP/native settlement remain pending.
- Compatibility gate: **PASS**
- Completed: 18 of 18 task checkboxes; WU13 worker checks are complete, conditional on parent POST-CLEANUP/native settlement.
- WU12 native settlement: **COMPLETE / PASSED** — parent-confirmed at evidence `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`.
- Native settlement: **COMPLETE / PASSED** — WU11 implementation acceptance and authoritative native settlement passed at evidence revision `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; the accepted harness was reused.
- WU6R native settlement: **COMPLETE / PASSED** — authoritative settlement completed at evidence revision `sha256:8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854`, explicitly remediating `sha256:425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`; the accepted harness was reused.
- WU6R evidence revision: `sha256:8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854`, distinct from failed evidence `sha256:425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`.
- WU11 evidence revision: `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; authoritative native count 866 changed lines versus the original 800-line budget; maintainer-approved `size:exception`; effective WU11-only strategy `exception-ok`; native settlement complete/passed and harness reused.
- WU12 process acceptance: **COMPLETE / PASSED** — this independent acceptance did not acquire, settle, reset, or mutate any native attempt token.
- Remaining: parent POST-CLEANUP and native settlement outside this worker.
- Next recommended work: `sdd-verify` after parent acceptance completes.

## Completed Tasks

- [x] **0.1 WU0 — Hard gate** — Added the process-backed compatibility spike, redacted evidence, and review-facing findings. No `packages/**` file changed.
- [x] **1.1 WU1 — Protocol client** — Added bounded JSONL framing, request correlation, protocol failure handling, authoritative generated method descriptors, deterministic manifests, and focused tests.
- [x] **1.2 WU2 — Durable binding store** — Added canonical scope validation, isolated identities, atomic mode-`0600` persistence, locking, quarantine, conflict handling, and round-trip tests.
- [x] **1.3 WU3 — App-server lifecycle** — Added direct spawn/initialize/control, truthful process failure, bounded shutdown escalation, no-timeout ordinary turns, idle disposal, and idempotent cleanup.
- [x] **2.1 WU4 — Authoritative session memory** — Added canonical server-owned state, monotonic revision, bounded O(1)-write replay, stale-snapshot rejection, explicit failure/limitation states, and authoritative completed-thread recovery.
- [x] **2.2 WU5 — Authenticated Web routes** — Added frozen server eligibility, authenticated pre-proxy capability/session read routes, explicit unsupported runtime responses, OpenCode proxy isolation, and graceful Codex cleanup.

- [x] **2.3 WU6 — Ordered event translation/projection** — Added explicit Codex event translation, revision ordering/deduplication, malformed/unknown isolation, stale-revision rejection, and batched reference-stable UI projection for text, reasoning, tool, command, file, approval, status, and error shapes.
- [x] **3.1 WU7 — Turn ownership and deduplication** — Added authoritative thread binding/resume, single-active-turn ownership, bounded explicit request deduplication, ambiguous-start retention, authenticated prompt routing, and a trusted shared UI adapter without OpenCode provider/model fields.
- [x] **3.2 WU8 — Exactly-once approvals** — Added server-request capture, atomic once/reject claims, scoped stale/mismatch rejection, authoritative pending-approval snapshots, Codex-only permission actions, and no `always`/auto-accept leakage.
- [x] **3.3 WU9 — Idempotent abort and cleanup** — Added scoped concurrent abort convergence, authoritative interrupt/terminalization, pending-approval rejection, late-activity suppression, explicit process/interrupt failure, retryable cleanup, and isolated UI routing that preserves OpenCode abort.
- [x] **4.1 WU10 — Web execution-target routing** — Added explicit OpenCode/Codex target identity, authoritative Web capability gating, isolated Codex draft/session/prompt routing, unsupported-surface rejection, and preserved OpenCode provider/model/SDK behavior.
- [x] **WU6R RED — Production projection contract** — Added failing notification-caller, revision/replay, malformed input, broadcaster failure/backpressure, projected route, cwd, runtime, auth/origin, relay, and OpenCode-isolation coverage before production edits.
- [x] **WU6R GREEN/REFACTOR — Production projection publication** — Wired validated notifications through revisionless translation and sole runtime publication, bounded replay 256, parsed snapshot/replay routes, lazy first-turn process opening, and existing authenticated direct/relay WS+SSE fan-out.
- [x] **WU11 — UI reconnect/reconciliation** — Added strict projected-snapshot parsing, subscribe/buffer-before-fetch reconciliation, atomic authoritative replacement, contiguous revision application, bounded gap/overflow/malformed/backpressure repair, explicit failure preservation, approval replacement/removal, and runtime-generation rejection. Complete/passed at `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; harness reused.
- [x] **WU12 — Independent process acceptance** — Ran the unchanged full real Codex fixture exactly once after WU12R; all five scenarios and every per-scenario/final cleanup assertion passed, and parent-confirmed native settlement is complete/passed at evidence `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`.

## Files Changed

| File | Action | Result |
|---|---|---|
| `scripts/codex-app-server-spike.mjs` | Created | Generates and hashes schemas, runs the authenticated JSON-RPC lifecycle, and records redacted pass/fail evidence. |
| `docs/codex-app-server-spike.md` | Created | Records the gate decision, environment identity, schema hashes, protocol proof, and PR #884 findings. |
| `docs/.codex-app-server-spike/report.json` | Generated | Contains mode-`0600`, non-sensitive machine-readable evidence. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU0 only. |
| `openspec/changes/codex-engine/apply-progress.md` | Created | Persists cumulative apply evidence for this first slice. |
| `scripts/generate-codex-protocol.mjs` | Created | Regenerates and checks the pinned protocol contract against Codex 0.147.0 and WU0's aggregate schema hash. |
| `packages/web/server/lib/codex/jsonrpc-client.js` | Created | Implements bounded `StringDecoder` JSONL framing, monotonic requests, response correlation, request-only timeouts, and fatal protocol cleanup without payload logging. |
| `packages/web/server/lib/codex/jsonrpc-client.test.js` | Created | Covers fragmented and multiple frames, malformed/schema-invalid input, correlation, errors, bounds, unknown IDs, and generated contract identity. |
| `packages/web/server/lib/codex/generated/protocol-descriptor.js` | Generated | Exposes 133 client methods, 11 server requests, 70 notifications, and unknown-input envelope parsing. |
| `packages/web/server/lib/codex/generated/protocol.schema.json` | Generated | Pins the authoritative Codex 0.147.0 `JSONRPCMessage` Draft-07 schema. |
| `packages/web/server/lib/codex/generated/manifest.json` | Generated | Binds Codex version, WU0 aggregate, selected source hashes, method counts, and output hashes. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU1 while preserving WU0 and all later checkbox states. |
| `openspec/changes/codex-engine/apply-progress.md` | Updated | Merged WU1 evidence into the cumulative WU0 apply record. |
| `packages/web/server/lib/codex/binding-store.js` | Created | Owns scoped metadata-only Codex bindings with atomic mode-`0600` writes and explicit corruption/conflict failures. |
| `packages/web/server/lib/codex/binding-store.test.js` | Created | Covers path threats, identity isolation, corruption, write conflicts, missing state, permissions, and round trips. |
| `packages/web/server/lib/codex/app-server-session.js` | Created | Owns direct Codex spawn, WU1 JSON-RPC handshake/control, failure, stderr bounds, and shutdown escalation. |
| `packages/web/server/lib/codex/app-server-session.test.js` | Created | Covers startup/control, timeouts, exits, ordinary turns, idle/browser lifecycle, and cleanup idempotency. |
| `packages/web/server/lib/codex/runtime.js` | Created | Owns per-session process entries, active-turn protection, failure retention, idle disposal, and deduplicated cleanup. |
| `packages/web/server/lib/codex/runtime.js` | Modified | Adds authoritative transcript/status/approval/turn memory, revisioned bounded replay, stale-snapshot protection, and completed-thread recovery. |
| `packages/web/server/lib/codex/runtime.test.js` | Created | Covers authority, stale snapshots, replay bounds, malformed/unknown events, process failure, restart recovery, limitations, and explicit read failures. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU2 and WU3 only while preserving every other checkbox. |
| `openspec/changes/codex-engine/apply-progress.md` | Updated | Merged Slice 3 evidence into the cumulative WU0-WU3 record. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU4 only while preserving WU0-WU3 and WU5+ states. |
| `openspec/changes/codex-engine/apply-progress.md` | Updated | Merged Slice 4 evidence into the cumulative WU0-WU4 record. |
| `packages/web/server/lib/codex/routes.js` | Created | Owns frozen Web Server eligibility, capability/session route behavior, binding scope, authoritative reads, and runtime cleanup. |
| `packages/web/server/lib/codex/routes.test.js` | Created | Covers surface spoofing, auth, unsupported runtimes, route ordering, proxy isolation, frozen scope, and authoritative session reads. |
| `packages/web/server/index.js` | Updated | Composes the Codex route runtime from authoritative launch state and server identity. |
| `packages/web/server/lib/opencode/feature-routes-runtime.js` | Updated | Registers Codex routes after the API auth gate and before generic OpenCode proxy setup. |
| `packages/web/server/lib/opencode/shutdown-runtime.js` | Updated | Awaits best-effort Codex runtime shutdown during graceful server cleanup. |
| `packages/web/server/lib/opencode/shutdown-runtime.test.js` | Updated | Proves graceful shutdown invokes Codex cleanup. |
| `packages/web/server/lib/opencode/DOCUMENTATION.md` | Updated | Documents Codex route ordering and shutdown ownership. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU5 only while preserving WU0-WU4 and WU6+ states. |
| `openspec/changes/codex-engine/apply-progress.md` | Updated | Merged Slice 5 evidence into the cumulative WU0-WU5 record. |

| `packages/web/server/lib/codex/event-translator.js` | Created | Translates validated Codex 0.147.0 frames into explicit revisioned projection envelopes without retaining or logging raw payloads. |
| `packages/web/server/lib/codex/event-translator.test.js` | Created | Covers projection shapes, partial deltas, and isolated malformed/unknown input. |
| `packages/ui/src/sync/event-pipeline.ts` | Updated | Adds explicit Codex envelope validation, bounded-batch revision ordering, stale filtering, and duplicate rejection outside OpenCode normalization. |
| `packages/ui/src/sync/event-pipeline.test.ts` | Updated | Covers out-of-order, duplicate, stale, unknown, and partially malformed Codex envelopes. |
| `packages/ui/src/sync/event-reducer.ts` | Updated | Adds batched Codex projection application with one lazy index/clone per affected bucket and stale-revision guards. |
| `packages/ui/src/sync/__tests__/event-reducer.test.ts` | Updated | Covers ordered projection, tool output, file diff, stale authority, and reference stability. |
| `packages/ui/src/sync/DOCUMENTATION.md` | Updated | Documents explicit Codex projection isolation and batching invariants. |
| `packages/web/server/lib/opencode/DOCUMENTATION.md` | Updated | Documents Codex event translator ownership. |
| `openspec/changes/codex-engine/tasks.md` | Updated | Checked off WU6 only while preserving WU0-WU5 and WU7+ states. |
| `openspec/changes/codex-engine/apply-progress.md` | Updated | Merged Slice 6 evidence into the cumulative WU0-WU6 record. |
| `packages/web/server/lib/codex/runtime.js` | Updated | Owns thread binding, single active turns, bounded dedupe records, approval projection, atomic reply claims, and authoritative results. |
| `packages/web/server/lib/codex/runtime.test.js` | Updated | Covers duplicate/concurrent/ambiguous starts, binding mismatch, double/concurrent/stale/scoped approvals, and re-projection. |
| `packages/web/server/lib/codex/routes.js` | Updated | Adds authenticated prompt and approval reply endpoints with strict Codex-only payloads and authoritative binding lookup. |
| `packages/web/server/lib/codex/routes.test.js` | Updated | Covers provider/model leakage, prompt acceptance, no proxy fallback, and once/reject-only approval routing. |
| `packages/web/server/lib/codex/app-server-session.js` | Updated | Forwards validated server requests and exposes explicit JSON-RPC response methods. |
| `packages/web/server/lib/codex/app-server-session.test.js` | Updated | Proves approval request forwarding and explicit decline response framing. |
| `packages/web/server/lib/codex/event-translator.js` | Updated | Tags approval projections with Codex engine, thread, and turn authority. |
| `packages/web/server/lib/codex/event-translator.test.js` | Updated | Proves Codex approval projection scope and lack of `always` semantics. |
| `packages/ui/src/lib/codex/client.ts` | Created | Adds parsed authenticated prompt and approval adapters without OpenCode SDK/provider/model routing. |
| `packages/ui/src/lib/codex/client.test.ts` | Created | Covers exact request bodies and malformed authoritative response rejection. |
| `packages/ui/src/types/permission.ts` | Updated | Adds optional Codex engine/thread/turn discriminators while preserving OpenCode shape. |
| `packages/ui/src/components/chat/PermissionCard.tsx` | Updated | Routes Codex decisions separately and hides `always` only for Codex approvals. |
| `packages/ui/src/components/chat/PermissionCard.test.ts` | Updated | Proves Codex hides `always` while OpenCode retains it. |
| `packages/ui/src/components/chat/permissionCardPatterns.ts` | Updated | Adds the pure engine-specific `always` capability decision. |
| `packages/ui/src/sync/session-actions.ts` | Updated | Adds scoped Codex approval action and rejects Codex IDs from OpenCode permission reply paths. |
| `packages/ui/src/sync/session-actions.test.ts` | Updated | Proves Codex once routing, unsupported `always`, and zero OpenCode permission calls. |
| `packages/web/server/lib/opencode/DOCUMENTATION.md` | Updated | Documents Codex turn and approval route ownership. |
| `packages/ui/src/sync/DOCUMENTATION.md` | Updated | Documents Codex approval isolation and server correctness ownership. |
| `packages/web/server/lib/codex/runtime.js` | Updated | Owns one concurrent-safe abort claim, atomic terminalization, late-event rejection, explicit failures, and retryable failed-process cleanup. |
| `packages/web/server/lib/codex/runtime.test.js` | Updated | Covers repeated/concurrent/no-active abort, running tool/command/edit terminalization, approvals, exit races, late activity, interrupt failure, and cleanup retry. |
| `packages/web/server/lib/codex/app-server-session.js` | Updated | Adds authoritative `turn/interrupt` control and retryable shutdown after partial failure. |
| `packages/web/server/lib/codex/app-server-session.test.js` | Updated | Proves interrupt framing and cleanup retry. |
| `packages/web/server/lib/codex/routes.js` | Updated | Adds the authenticated binding-scoped Codex abort endpoint. |
| `packages/web/server/lib/codex/routes.test.js` | Updated | Proves abort route isolation from OpenCode proxy fallback. |
| `packages/ui/src/lib/codex/client.ts` | Updated | Adds parsed authenticated Codex abort transport. |
| `packages/ui/src/lib/codex/client.test.ts` | Updated | Proves isolated abort path, body, and authoritative result parsing. |
| `packages/ui/src/sync/session-actions.ts` | Updated | Routes Codex IDs explicitly while preserving the existing OpenCode SDK abort path. |
| `packages/ui/src/sync/session-actions.test.ts` | Updated | Proves engine isolation and truthful Codex failure propagation. |
| `packages/web/server/lib/opencode/DOCUMENTATION.md` | Updated | Documents Codex abort and failed-process cleanup ownership. |
| `packages/ui/src/sync/DOCUMENTATION.md` | Updated | Documents engine-specific abort routing and failure authority. |
| `packages/ui/src/types/execution-target.ts` | Created | Defines explicit OpenCode/Codex routing identities and supported-surface resolution. |
| `packages/ui/src/types/execution-target.test.ts` | Created | Proves OpenCode selection preservation, Codex identity routing, and non-Web rejection. |
| `packages/ui/src/lib/codex/client.ts` | Updated | Adds authoritative capability discovery and Codex session creation without OpenCode fields. |
| `packages/ui/src/lib/codex/client.test.ts` | Updated | Proves exact authenticated capability/session/prompt contracts and strict response parsing. |
| `packages/ui/src/sync/selection-store.ts` | Updated | Adds bounded in-memory draft/session execution-target selection isolated from model persistence. |
| `packages/ui/src/sync/selection-store.test.ts` | Updated | Proves session target retention and target-only runtime reset. |
| `packages/ui/src/sync/session-actions.ts` | Updated | Adds stale-runtime rejection and concurrent identical Codex prompt deduplication. |
| `packages/ui/src/sync/session-actions.test.ts` | Updated | Proves one Codex request for concurrent duplicate submit and no request after runtime change. |
| `packages/ui/src/sync/session-ui-store.ts` | Updated | Materializes Codex drafts and routes Codex prompts without entering OpenCode optimistic/SDK paths. |
| `packages/ui/src/sync/codex-execution-routing.test.ts` | Created | Proves Codex draft creation, prompt isolation, unsupported payload rejection, and OpenCode preservation. |
| `packages/ui/src/components/chat/ChatInput.tsx` | Updated | Adds Web-only authoritative target selection and captures the chosen target at submit time. |
| `packages/ui/src/components/chat/composer/ui/ComposerFooter.tsx` | Updated | Hides OpenCode-only model controls while Codex is selected. |
| `packages/ui/src/components/chat/composer/DOCUMENTATION.md` | Updated | Documents target capture and engine-specific composer capability boundaries. |
| `packages/ui/src/sync/DOCUMENTATION.md` | Updated | Documents execution-target routing authority and runtime-reset invariants. |
| `packages/ui/src/lib/i18n/messages/{en,es,fr,de,pl,pt-BR,uk,ko,ja,zh-CN,zh-TW}.ts` | Updated | Adds localized execution-target labels, descriptions, and unavailable-state copy. |
| `packages/ui/src/sync/bootstrap.ts` | Updated | Parses and fetches the authoritative projected WU6R snapshot through runtime-aware HTTP without converting failure into empty success. |
| `packages/ui/src/sync/bootstrap.test.ts` | Updated | Covers valid and malformed projected snapshot boundaries. |
| `packages/ui/src/sync/session-message-loader.ts` | Updated | Owns per-runtime Codex snapshot/event reconciliation, bounded buffering, explicit errors, bounded repair, reconnect, and stale-completion rejection. |
| `packages/ui/src/sync/session-message-loader.test.ts` | Updated | Covers subscribe-before-fetch, close/reopen, stale cache, buffered races, gaps, overflow, failure preservation, atomicity, approvals, and runtime switching. |
| `packages/ui/src/sync/event-pipeline.ts` | Updated | Routes raw Codex envelopes outside OpenCode normalization and triggers repair for malformed input, backpressure, and direct/relay reconnects. |
| `packages/ui/src/sync/event-pipeline.test.ts` | Updated | Covers strict raw-envelope routing, malformed fail-closed behavior, and reconnect reconciliation. |
| `packages/ui/src/sync/event-reducer.ts` | Updated | Atomically replaces projected snapshots and applies approval resolution while preserving unrelated references. |
| `packages/ui/src/sync/__tests__/event-reducer.test.ts` | Updated | Covers authoritative snapshot replacement, approval replacement/removal, and unaffected reference stability. |
| `packages/ui/src/sync/DOCUMENTATION.md` | Updated | Documents Codex snapshot authority, contiguous buffering, bounded repair, explicit failure, and runtime invalidation. |

## TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 0.1 WU0 | `scripts/codex-app-server-spike.mjs` | Process integration | N/A — new files | `node scripts/codex-app-server-spike.mjs --help` exited 1 with `MODULE_NOT_FOUND` before creation | Help check exited 0 after minimum script creation | Full authenticated spike exited 0 and proved both completed turns, streaming, resume, approval, and interrupt | Extracted repeated completed-streaming-turn flow; `node --check` and the full spike rerun both exited 0 |
| 1.1 WU1 | `packages/web/server/lib/codex/jsonrpc-client.test.js` | Unit + process integration | N/A — all owned implementation files were new | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js` exited 1: missing `jsonrpc-client.js`, 0 tests collected | Final GREEN command exited 0 with 12/12 tests after correcting the test harness's late rejection handler | Added complete-frame bound coverage; command exited 0 with 13/13 tests | Simplified generated formatting and removed an unused timeout-error export; regeneration plus 13/13 tests exited 0 |
| 1.2 WU2 | `packages/web/server/lib/codex/binding-store.test.js` | Unit + filesystem integration | N/A — new files | Focused command exited 1: missing `binding-store.js`, 0 tests collected | Minimum store passed 5/5 tests | Added server-isolation and per-record quarantine RED cases; each failed before correction, then final suite passed 7/7 | Tightened record validation; combined refactor command passed 16/16 |
| 1.3 WU3 | `packages/web/server/lib/codex/app-server-session.test.js` | Unit + process integration | N/A — new files | Focused command exited 1: missing `app-server-session.js`, 0 tests collected | Minimum lifecycle passed 7/7 tests | Added spawn-error and connected-idle cases; spawn RED failed 1/9 before correction, then suite passed 9/9 | Removed unused exports/state; combined refactor command passed 16/16 |
| 2.1 WU4 | `packages/web/server/lib/codex/runtime.test.js` | Unit + process integration | `app-server-session.test.js` passed 9/9 before modifying `runtime.js` | Focused command exited 1 with 8/8 tests failing because authority/recovery APIs did not exist | Minimum implementation passed 8/8 tests | Added process-revision and authoritative-empty-read cases; command failed 2/9 before correction, then passed 9/9 | Simplified recovery scope and strengthened malformed-event preservation; combined WU3-WU4 command passed 18/18 |
| 2.2 WU5 | `packages/web/server/lib/codex/routes.test.js`, `lib/opencode/shutdown-runtime.test.js` | HTTP integration + unit | Existing core/startup/shutdown/runtime safety net passed 4 files and 40/40 tests | Focused command exited 1: `routes.js` was missing with 0 route tests collected, and Codex shutdown was called 0 times | Minimum route/wiring implementation passed 2 files and 12/12 tests | Four excluded runtimes, missing/invalid auth, proxy collision, fixed session authority, authoritative reads, and missing-memory failure all passed | Added best-effort shutdown isolation; 5-file refactor command passed 51/51 tests |

| 2.3 WU6 | `event-translator.test.js`, `event-pipeline.test.ts`, `event-reducer.test.ts` | Unit + module runtime integration | UI pipeline/reducer passed 20/20; server authority passed 9/9 | Server command exited 1 with missing translator and 0 tests; UI command exited with 2 missing-export errors and 0 tests | Translator passed 3/3 and UI projection passed 23/23 | Required shape cases passed; added semantic no-op reference test failed 1/18 before lazy-clone correction, then passed 18/18 | Final cumulative commands passed server 25/25 and UI 51/51; repeated runtime harness returned revision 5 and idle status twice |
| 3.1 WU7 | `runtime.test.js`, `routes.test.js`, `client.test.ts` | Unit + HTTP integration | Server 31/31; UI 58/58 | Server exited 1 with 4 failed/19 passed; client exited 1 with missing module, 0 tests | Server 23/23; client 1/1 | Duplicate concurrent/accepted retries, distinct concurrent turn, ambiguous start, binding mismatch, and OpenCode field leakage all covered | Final Codex server 61/61; client 3/3; loopback harness dispatched one turn for two accepted prompt requests |
| 3.2 WU8 | `runtime.test.js`, `routes.test.js`, `app-server-session.test.js`, `event-translator.test.js`, `client.test.ts`, `PermissionCard.test.ts`, `session-actions.test.ts` | Unit + HTTP/module integration | WU7 server 23/23 and client 1/1 | Server exited 1 with 5 failed/34 passed; combined UI RED exited with 4 failures, 56 passes, and one missing-export error | Server 39/39; client 2/2; PermissionCard 4/4; session actions 57/57 | Double/concurrent replies, repeated projection, stale/wrong scope, `always`, malformed response, and OpenCode leakage covered | Final server 61/61; focused UI 92/92; static checks and loopback harness passed with one approval response for two HTTP replies |
| 3.3 WU9 | `runtime.test.js`, `app-server-session.test.js`, `routes.test.js`, `client.test.ts`, `session-actions.test.ts` | Unit + HTTP/module/runtime integration | Server 36/36; session actions 57/57 | Server exited 1 with 5 failed/36 passed; session actions exited 1 with 2 failed/57 passed | Server 41/41; session actions 59/59; client 3/3 | Interrupt rejection, approval-response partial failure, client transport, late events/replies, and cleanup retry covered | Final server 68/68; UI 63/63; static and harness checks passed |
| 4.1 WU10 | `execution-target.test.ts`, `selection-store.test.ts`, `client.test.ts`, `codex-execution-routing.test.ts`, `session-ui-store.test.js`, `session-actions.test.ts` | Unit + UI module + authenticated HTTP runtime integration | Existing Codex client, session UI store, and session action tests passed before production edits | Focused tests failed because the execution-target module, selection actions, capability/session client methods, and Codex UI route were absent | Target 3/3; selection 2/2; client 6/6; routing 4/4 | Proved unsupported runtime rejection, Codex payload restrictions, stale-runtime rejection, concurrent double-submit convergence, and unchanged OpenCode routing | Final focused suites passed 3/3, 2/2, 6/6, 4/4, 29/29, and 61/61; UI/Web type-check/lint, dead-code baseline, authenticated harness, and cleanup passed |
| WU6R RED + GREEN/REFACTOR | `app-server-session.test.js`, `event-translator.test.js`, `runtime.test.js`, `routes.test.js`, `event-stream/runtime.test.js` | Unit + HTTP + authenticated direct/relay runtime integration | 8 focused Codex/event-stream/auth files passed 78/78 before production edits | Combined RED exited 1 with 11 failed and 51 passed; lazy open failed 1/24; repeated-delta RED failed 1/25 because the second starter replaced `hello` with ` world` | Focused GREEN passed 5 files and 62/62; lazy open passed 24/24; repeated-delta GREEN passed 25/25 with `hello world` | Added malformed/rejected notifications, contiguous replay, overflow, completion, broadcaster failure, concurrent lazy-open, repeated text accumulation, unsupported runtime, cwd, backpressure, and OpenCode isolation | Final 13-file suite passed 116/116; accepted direct+relay WS/SSE harness plus current repeated-delta runtime scenario, Web type-check/lint, JS syntax, and dead-code passed |
| WU11 | `bootstrap.test.ts`, `session-message-loader.test.ts`, `event-pipeline.test.ts`, `event-reducer.test.ts` | Unit + module/runtime integration | Four focused files passed 49/49 before WU11 edits | Four-file RED exited 1 with 9 failures and 2 missing-export errors: snapshot parser/reducer/reconciler APIs and raw Codex routing were absent | Minimum implementation passed 60/60 | Added wrong-session malformed input, duplicate/stale order, gap, 257-event overflow, bounded non-convergence, fetch failure/retry, approval replacement/removal, atomic publication, close/reopen, runtime switch, and reconnect cases; 61/61 passed | Final focused UI/sync/relay command passed 104/104; UI type-check/lint, dead-code baseline, and deterministic direct/relay reconnect harness passed |
| WU12 | `codex-engine.integration.test.js`, `codex-engine.integration-fixture.js` | Process-backed HTTP/relay/filesystem/Git integration | N/A — both files are new | Focused command exited 1 before fixture implementation: missing `codex-engine.integration-fixture.js`, 0 tests collected | Fixture implementation reached real Codex execution; 3/5 tests passed | Direct/relay reads, streaming completion, reconnect, completed restart/read, actual edit/Git diff, approvals, reject, abort, isolation setup, and cleanup were exercised; projected diff and abort tool settlement remained RED | Blocked before REFACTOR: production changes are required outside WU12 fixture-only scope |
| WU12 retry acceptance | `codex-engine.integration.test.js`, `codex-engine.integration-fixture.js` | Process-backed HTTP/relay/filesystem/Git integration | WU12R complete/passed at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`; fixture unchanged for this acceptance | Preserved prior WU12/WU12R RED evidence; no new tests or production changes were authorized | Exact full process command ran once and passed 5/5 | All five grouped acceptance scenarios passed, including direct/relay, projected diff/approval, reject/abort, restart/read, and isolation | N/A — independent process acceptance only; no source/test refactor |

## Test Summary

- Tests written: one executable WU0 gate, 13 WU1 tests, 7 WU2 tests, 9 WU3 tests, and 9 WU4 tests.
- Focused repository-script suite: 1 of 1 test files passed.
- Focused WU1 suite: 1 of 1 file and 13 of 13 tests passed.
- Runtime scenarios passing: first turn, resumed second turn, approval, and interrupt.
- WU1 runtime scenario passing: real Codex 0.147.0 initialize, initialized notification, correlated thread/list request, clean process exit.
- Slice 3 focused suite: 2 files and 16 tests passed.
- WU2 runtime scenario passing: real temporary-filesystem round trip, `0600` mode, isolated identity, and cleanup.
- WU3 runtime scenario passing: real Codex 0.147.0 initialize, initialized notification, bounded `thread/list`, and clean shutdown.
- Pure functions/helpers created: schema hashing, checkout identity, executable resolution, completed streaming turn, schema method extraction, protocol parsing, and deterministic rendering.
- Approval tests: none; WU0 creates new files rather than refactoring existing behavior.
- WU4 focused suite: 1 file and 9 tests passed; cumulative Codex suite: 4 files and 38 tests passed.
- WU4 runtime scenario: two real Codex 0.147.0 processes created/completed, resumed/read, archived, and shut down an isolated completed thread; authoritative transcript state was `complete` with two items at revision 1.
- WU4 pure helpers: bounded replay ring, snapshot validation/cloning, completed-read validation, and canonical state projection.
- WU5 tests written: 10 route/security scenarios and 1 shutdown cleanup scenario; the final focused Codex/shutdown suite passed 6 files and 50/50 tests.
- WU5 runtime scenario: a real loopback HTTP listener returned 401 without auth, 200 with Web Codex capability, preserved generic OpenCode fallback at 599, closed cleanly, and invoked Codex shutdown once.
- WU5 pure helpers: frozen eligibility resolution, scoped binding inputs, sanitized route error mapping, and authoritative-state response projection.

- WU6 tests written: 3 server translator cases and 4 UI projection cases covering the six required RED classes plus all required projection shapes.
- WU6 focused regression: 3 server files and 25/25 tests passed; 4 UI files and 51/51 tests passed.
- WU6 runtime scenario: schema-shaped Codex events were supplied out of order, translated, ordered to revisions 1–5, reduced to 3 parts and 1 real file diff, and settled idle; the same harness passed twice.
- WU6 pure helpers: explicit frame translator, projection boundary parser/orderer, and batched affected-bucket reducer.
- WU7-WU8 tests written: 3 turn ownership cases, 2 approval ownership cases, 2 route cases, 1 app-server request/response case, 1 approval projection assertion, 3 Codex client cases, 2 PermissionCard capability cases, and 1 Codex session-action case.
- Slice 7 focused regression: 7 server files and 61/61 tests; Codex client 3/3; PermissionCard/projection 28/28; session actions 57/57; OpenCode permission client 4/4.
- Slice 7 runtime scenario: real loopback Express/auth/routes plus `CodexRuntime` accepted duplicate prompt and approval HTTP requests while dispatching one `turn/start` and one JSON-RPC approval response.
- WU9 tests written: 5 runtime abort scenarios, 1 app-server interrupt/retry scenario, 1 HTTP route scenario, 2 session-action routing scenarios, and 1 client transport scenario.
- WU9 focused regression: 7 server files and 68/68 tests; session actions 59/59; Codex client 4/4.
- WU9 runtime scenario: an inline fake app-server boundary converged two aborts to one interrupt and one approval rejection, terminalized three running item classes, reached idle with zero pending/active work, and shut down once.
- WU10 tests written: 3 execution-target cases, 2 selection-store cases, 2 additional Codex client cases, 4 route/materialization cases, and 2 session-action concurrency/runtime cases.
- WU10 focused regression: execution target 3/3; selection store 2/2; Codex client 6/6; Codex routing 4/4; session UI store 29/29; session actions 61/61.
- WU10 runtime scenario: an authenticated Bun loopback server accepted authoritative capability, Codex session creation, and prompt submission across three authenticated requests; the prompt body contained exactly `directory`, `requestId`, and `text`.
- WU6R tests written/changed: 9 new server test cases plus revisionless translator contract updates across five focused files; final Codex/event-stream/relay/auth regression passed 116/116.
- WU6R runtime scenario: one loopback server delivered `openchamber:codex-projection` through authenticated direct WS/SSE and E2EE-tunnel host WS/SSE paths, retained one shared OpenCode upstream reader/event, and closed every listener/stream.
- WU11 tests written: 12 focused scenarios across snapshot parsing, reducer authority, loader reconciliation, and raw transport routing; final focused regression passed 10 files and 104/104 tests.
- WU11 deterministic reconnect scenario: both `direct` and `relay` modes performed two authoritative reads, converged to revision 4, retained mode-specific projected text, and reported busy after reconnect; WU12 remains the separate real process-backed fixture.
- WU12 retry: the unchanged real process fixture passed 1 file and 5/5 tests in 52.30 seconds; no production or test file changed.

## Work Unit Evidence

### WU0

| Evidence | Exact result |
|---|---|
| Focused test command | `node scripts/run-isolated-tests.mjs scripts` → exit 0, `1/1 test files passed`. |
| Executable syntax check | `node --check scripts/codex-app-server-spike.mjs` → exit 0, no diagnostics. |
| Runtime harness | `node scripts/codex-app-server-spike.mjs` → exit 0, `Codex app-server compatibility gate: PASS`; rerun after refactor also passed. |
| Added-source check | `bun run dead-code` → exit 0 (non-blocking report: 206 unused exports, 156 unused exported types, 1 duplicate export; no WU0 file reported). |
| Rollback boundary | Remove `scripts/codex-app-server-spike.mjs`, `docs/codex-app-server-spike.md`, and `docs/.codex-app-server-spike/report.json`; revert only the WU0 checkbox and this progress artifact. No package behavior is coupled to the slice. |

### WU1

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js` → exit 0, 1 file and 13 tests passed. |
| Deterministic generation | `node scripts/generate-codex-protocol.mjs --check` → exit 0, `Codex protocol generation check: PASS`; schema aggregate matched WU0 SHA-256 `e0e83a5379d87b58746426d7d7f53dafc151ec40910a1f3e7c9f2b838b663e2a`. |
| Runtime harness | `node /tmp/opencode/codex-jsonrpc-wu1-runtime.mjs` → exit 0, real Codex initialize + initialized + correlated `thread/list`; app-server exit 0, no signal, 332 stderr bytes counted and not printed. The temporary harness was removed. |
| Syntax/static checks | `node --check` on the generator, client, and descriptor → exit 0; `bun run --cwd packages/web type-check` → exit 0; `bun run --cwd packages/web lint` → exit 0. |
| Added-source check | `bun run dead-code` → exit 0 (non-blocking baseline: 206 unused exports, 156 unused exported types, 1 duplicate export; no WU1 file reported after refactor). |
| Broader package test | `bun run --cwd packages/web test` → exit 1: 145 files passed, 2 failed; 1,307 tests passed, 5 failed, 2 skipped, plus 1 walkthrough unhandled error. Targeted rerun left four unrelated `session-goal/runtime.test.js` failures; no Codex test failed. |
| Rollback boundary | Remove `scripts/generate-codex-protocol.mjs` and `packages/web/server/lib/codex/`; revert only the WU1 checkbox and WU1 sections in this progress artifact. WU0 and OpenCode behavior remain intact. |

### WU2

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/binding-store.test.js` → exit 0, 1 file and 7 tests passed. |
| Runtime harness | `node --input-type=module -e "<CodexBindingStore temp-filesystem round trip>"` → exit 0, `{ "roundTrip":true,"mode":"600","identityPrefix":true }`; temporary root removed. |
| Rollback boundary | Remove `binding-store.js` and `binding-store.test.js`; revert only WU2 checkbox/evidence. WU0-WU1 and lifecycle work remain. |

### WU3

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/app-server-session.test.js` → exit 0, 1 file and 9 tests passed. |
| Focused integration | `bun run --cwd packages/web test -- server/lib/codex/binding-store.test.js server/lib/codex/app-server-session.test.js` → exit 0, 2 files and 16 tests passed. |
| Runtime harness | `node --input-type=module -e "<CodexAppServerSession initialize + thread/list + shutdown>"` → exit 0, `{ "initialize":true,"control":true,"state":"closed","stderrBytes":332,"stderrTruncated":false }`. |
| Static checks | `node --check` on three production files, `bun run --cwd packages/web type-check`, and `bun run --cwd packages/web lint` → all exit 0. |
| Added-source check | `bun run dead-code` → exit 0, non-blocking baseline 206 unused exports, 156 unused exported types, 1 duplicate export; no Slice 3 file reported. |
| Rollback boundary | Remove `app-server-session.js`, `app-server-session.test.js`, and `runtime.js`; revert only WU3 checkbox/evidence. WU0-WU2 remain. |

### WU4

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/runtime.test.js` → exit 0, 1 file and 9 tests passed. |
| Focused integration | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js server/lib/codex/binding-store.test.js server/lib/codex/app-server-session.test.js server/lib/codex/runtime.test.js` → exit 0, 4 files and 38 tests passed. |
| Runtime harness | `node /tmp/opencode/codex-runtime-wu4-harness.mjs` → exit 0, `{ "recovered":true,"transcriptState":"complete","transcriptItems":2,"revision":1,"archived":true }`; temporary harness and workspace were removed. |
| Static checks | `node --check` on WU4 production/test files, `bun run --cwd packages/web type-check`, and `bun run --cwd packages/web lint` → all exit 0. |
| Added-source check | `bun run dead-code` → exit 0; unchanged non-blocking baseline reported 206 unused exports, 156 unused exported types, and 1 duplicate export, with no WU4 file reported. |
| Performance contract | Server event ingestion at unbounded transcript scale must avoid prior-history scans. Transcript append, approval map mutation, revision increment, and replay-ring write are O(1); replay storage defaults to 256 events; snapshot/recovery reads are intentionally O(transcript + approvals). The bounded-replay test retained exactly 3 of 5 events and required a snapshot outside the retained window. Browser profiling was N/A because WU4 adds no browser/UI path. |
| Rollback boundary | Revert WU4 changes in `runtime.js`, remove `runtime.test.js`, and revert only the WU4 checkbox/evidence. WU0-WU3 lifecycle, bindings, and protocol files remain. |

### WU5

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js server/lib/codex/binding-store.test.js server/lib/codex/app-server-session.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/opencode/shutdown-runtime.test.js` → exit 0, 6 files and 50/50 tests passed. |
| RED | `bun run --cwd packages/web test -- server/lib/codex/routes.test.js server/lib/opencode/shutdown-runtime.test.js` → exit 1: missing `routes.js` prevented route collection and the shutdown cleanup assertion observed 0 calls. |
| GREEN | The same two-file command → exit 0, 2 files and 12/12 tests passed after minimum route and shutdown wiring. |
| REFACTOR | `bun run --cwd packages/web test -- server/lib/codex/routes.test.js server/lib/codex/runtime.test.js server/lib/opencode/core-routes.test.js server/lib/opencode/startup-pipeline-runtime.test.js server/lib/opencode/shutdown-runtime.test.js` → exit 0, 5 files and 51/51 tests passed. |
| Runtime harness | `node --input-type=module -e "<real loopback Express/HTTP Codex route scenario>"` → exit 0, `{ "denied":401,"capability":200,"available":true,"openCode":599,"shutdowns":1 }`; listener closed and no temporary harness file was created. |
| Static checks | `node --check` on six changed server/test JS files, `bun run --cwd packages/web type-check`, and `bun run --cwd packages/web lint` → all exit 0 with no diagnostics. |
| Added-source check | `bun run dead-code` → exit 0; unchanged non-blocking baseline reported 206 unused exports, 156 unused exported types, and 1 duplicate export, with no WU5 file reported. |
| Security/order contract | API auth precedes Codex registration; Codex capability/session routes precede generic `/api/*` OpenCode proxy setup; client surface/query/header hints never grant or override frozen server eligibility. |
| Rollback boundary | Remove `routes.js` and `routes.test.js`; revert only Codex wiring in `index.js`, `feature-routes-runtime.js`, `shutdown-runtime.js`, `shutdown-runtime.test.js`, and `DOCUMENTATION.md`; revert the WU5 checkbox/evidence. WU0-WU4 remain intact. |

### WU6

| Evidence | Exact result |
|---|---|
| Safety net | `bun test packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-reducer.test.ts` → exit 0, 20/20 tests; `bun run --cwd packages/web test -- server/lib/codex/runtime.test.js` → exit 0, 9/9 tests. |
| RED | `bun run --cwd packages/web test -- server/lib/codex/event-translator.test.js` → exit 1, missing `event-translator.js`, 0 tests; `bun test packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-reducer.test.ts` → exit 1, 2 missing-export errors, 0 tests. |
| GREEN | The server translator command → exit 0, 3/3 tests; the UI command → exit 0, 23/23 tests. |
| TRIANGULATE | Added affected-bucket no-op reference coverage; `bun test packages/ui/src/sync/__tests__/event-reducer.test.ts` first exited 1 with 17 pass/1 fail, then exited 0 with 18/18 after lazy cloning. |
| REFACTOR / focused test | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js server/lib/codex/runtime.test.js server/lib/codex/event-translator.test.js` → exit 0, 3 files and 25/25 tests; `bun test packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-pipeline.test.js packages/ui/src/sync/__tests__/event-reducer.test.ts packages/ui/src/sync/__tests__/event-reducer.test.js` → exit 0, 4 files and 51/51 tests. |
| Runtime harness | Repeated `bun --eval '<schema-shaped Codex translator → orderer → reducer scenario>'` → exit 0 twice with `{ "ordered":5,"parts":3,"diffs":1,"revision":5,"status":"idle" }`. The first pre-evidence draft command exited 1 on invalid dot access to a hyphenated key and was corrected before either accepted run. |
| Schema/runtime identity | `codex app-server generate-ts --experimental --out /tmp/opencode/codex-wu6-schema` → exit 0; translator shapes were checked against Codex 0.147.0 generated `v2` notification/item types; the temporary schema directory was removed. |
| Syntax/static checks | `node --check` on translator and test, UI and Web package `type-check`, and UI and Web package `lint` → all exit 0 with no diagnostics. |
| Added-source check | `bun run dead-code` → exit 0; unchanged non-blocking baseline reported 206 unused exports, 156 unused exported types, and 1 duplicate export, with no WU6 file reported. |
| Performance/reference contract | Projection application is O(changes + affected message/part/permission entities): each affected message or part bucket is indexed and cloned at most once across the accepted batch; unrelated buckets remain referentially stable and semantic no-ops retain affected references. Incoming out-of-order normalization sorts only the bounded flush batch and never scans/copies transcript history. |
| Rollback boundary | Remove `event-translator.js` and its test; revert only WU6 additions in `event-pipeline.ts`, `event-pipeline.test.ts`, `event-reducer.ts`, `event-reducer.test.ts`, and the two owning documentation lines; revert the WU6 checkbox/evidence. WU0-WU5 remain intact. |

### WU7

| Evidence | Exact result |
|---|---|
| Safety net | Server Codex route/runtime/app-server/translator command → exit 0, 4 files and 31/31 tests; UI PermissionCard/session-actions command → exit 0, 58/58 tests. |
| RED | `bun run --cwd packages/web test -- server/lib/codex/runtime.test.js server/lib/codex/routes.test.js` → exit 1, 4 failed and 19 passed; `bun test packages/ui/src/lib/codex/client.test.ts` → exit 1, missing `client.ts`, 0 passed. |
| GREEN | Same server command → exit 0, 23/23; client command → exit 0, 1/1. |
| TRIANGULATE | Covered same-ID concurrent and accepted retries, different-ID concurrent active turn, ambiguous dispatch retry, session/thread mismatch, strict route body, and provider/model rejection; all passed before refactor. |
| Focused regression | Cumulative Codex/shutdown server command → exit 0, 7 files and 61/61 tests; final client command → exit 0, 3/3. |
| Runtime harness | Inline Node loopback Express/auth/routes/runtime scenario → exit 0 with `promptStatuses:[202,202]`, `turnDispatches:1`, and status remaining `running` before explicit harness shutdown. |
| Static checks | `node --check` on changed server JS, UI/Web type-check, and UI/Web lint → all exit 0. |
| Added-source check | Final `bun run dead-code` → exit 0; baseline 206 unused exports, 156 unused exported types, 1 duplicate export; no Slice 7 file reported. |
| Rollback boundary | Revert WU7 turn/dedupe additions in `runtime.js`, `routes.js`, their tests, and route documentation; remove `packages/ui/src/lib/codex/client.ts` plus its test only after also reverting WU8 imports. WU0-WU6 remain intact. |

### WU8

| Evidence | Exact result |
|---|---|
| Safety net | WU7 server route/runtime passed 23/23 and client passed 1/1 before WU8 production edits. |
| RED | Four-file server command → exit 1, 5 failed and 34 passed. Combined UI command → exit 1 with 4 failed, 56 passed, and one missing-export error. Malformed-client triangulation separately exited 1 with 2 passed/1 failed before boundary parsing. |
| GREEN | Four-file server command → exit 0, 39/39; client 3/3; PermissionCard 4/4; session actions 57/57. |
| TRIANGULATE | Proved one server response across double/concurrent/retry calls, duplicate snapshot projection, stale approval, wrong session/thread/turn, unsupported `always`, malformed success rejection, and zero OpenCode permission calls. |
| Focused regression | PermissionCard plus Codex pipeline/reducer → exit 0, 28/28; session actions → 57/57; OpenCode permission client → 4/4; cumulative server → 61/61. |
| Runtime harness | Same loopback scenario → exit 0 with `approvalStatuses:[200,200]`, `alwaysStatus:400`, `approvalResponses:1`, and `pendingApprovals:0`. |
| Cleanup/process | Harness listener closed and runtime shutdown ran in `finally`; no temporary file was created; `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0. No Codex app-server was spawned by Slice 7 validation. |
| Rollback boundary | Revert WU8 approval/request additions in server runtime/routes/app-server/translator and tests; revert Codex permission fields/actions/card/helper/tests and two documentation updates. WU0-WU7 remain intact. |

### WU9

| Evidence | Exact result |
|---|---|
| Safety net | Focused Codex runtime/app-server/routes command exited 0 with 36/36 tests; session actions exited 0 with 57/57 tests. |
| RED | The same server command exited 1 with 5 failed and 36 passed (`abort`, `interrupt`, and route absent); session actions exited 1 with 2 failed and 57 passed (Codex abort still used OpenCode and swallowed failure). |
| GREEN | Server command exited 0 with 41/41 tests; session actions exited 0 with 59/59; Codex client exited 0 with 3/3. |
| TRIANGULATE / REFACTOR | Added explicit interrupt failure and approval-response partial-failure cases plus real client transport parsing; final cumulative Codex/shutdown server command exited 0 with 7 files and 68/68 tests, session actions 59/59, and client 4/4. |
| Runtime harness | Inline Node `CodexRuntime` fake app-server scenario exited 0 with `{outcomesEqual:true,interrupts:1,approvalRejects:1,status:"idle",pending:0,active:false,terminalItems:3,shutdowns:1}`; the zero-Codex-process check passed. |
| Static checks | `node --check` on six changed server JS files; UI/Web type-check and lint; all exited 0. |
| Added/export check | `bun run dead-code` exited 0 with the unchanged non-blocking baseline: 206 unused exports, 156 unused exported types, and 1 duplicate export; no WU9 addition was reported. |
| Rollback boundary | Revert only WU9 abort/cleanup additions in the 12 WU9 implementation, test, and documentation paths listed in the Slice 8 evidence; WU0-WU8 remain intact. |

### WU10

| Evidence | Exact result |
|---|---|
| Safety net | Existing Codex client, session UI store, and session-action regressions passed before production edits; OpenCode routing remained the baseline contract. |
| RED | Tests were written first and failed because `execution-target.ts`, execution-target selection actions, `getCodexCapability`, `createCodexSession`, and the Codex UI route did not exist. Unsupported Electron, VS Code, hosted-mobile, and Capacitor cases were part of RED before production changes. |
| GREEN | `bun test packages/ui/src/types/execution-target.test.ts` → exit 0, 3/3; `bun test packages/ui/src/sync/selection-store.test.ts` → exit 0, 2/2; `bun test packages/ui/src/lib/codex/client.test.ts` → exit 0, 6/6; `bun test packages/ui/src/sync/codex-execution-routing.test.ts` → exit 0, 4/4. |
| Focused regression | `bun test packages/ui/src/sync/session-ui-store.test.js` → exit 0, 29/29; expected invalid-URL/startup and intentional failure-path logs only. `bun test packages/ui/src/sync/session-actions.test.ts` → exit 0, 61/61; intentional failure-path logs only. |
| Runtime harness | Authenticated Bun loopback capability → session creation → prompt scenario exited 0 with `{"capability":true,"created":true,"accepted":true,"requests":3,"allAuthenticated":true,"promptKeys":["directory","requestId","text"]}`. The harness created no file and printed no token, prompt, reasoning, command output, or raw protocol payload. |
| Cleanup/process | The loopback server closed in `finally`; `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0. WU10 spawned no Codex app-server process. |
| Static checks | UI and Web `type-check` and `lint` all exited 0 with no diagnostics. |
| Added/export check | Final `bun run dead-code` exited 0 with the unchanged non-blocking baseline: 206 unused exports, 156 unused exported types, and 1 duplicate export; the temporary WU10 exported-type warning was removed before acceptance. |
| Retry/double-submit boundary | Concurrent identical UI submissions share one request promise and request ID; conflicting concurrent text rejects. Server WU7 remains authoritative for accepted/ambiguous request-ID dedupe. Post-reload authoritative retry/reconciliation remains WU11 and is not claimed here. |
| Rollback boundary | Revert WU10-only additions in the 25 execution-target, Codex client, selection, session routing/action, composer, locale, test, and documentation paths hashed by evidence revision `7f3f8ec157c48f79630431f7ad31e5043140c1f11b73ee31ac481de0c4793860`. WU0-WU9 server authority and all existing OpenCode behavior remain intact. |

### WU6R

| Evidence | Exact result |
|---|---|
| Safety net | Focused Codex/event-stream/auth command exited 0 with 8 files and 78/78 tests before production edits; zero Codex processes were present. |
| RED | Five-file command exited 1 with 11 failed and 51 passed. Failures proved absent notification forwarding, revisionless translator output, sole projection publisher/snapshot/replay, broadcaster delivery truth, projected route/replay parsing, and absolute authoritative cwd rejection. A strict follow-up repeated-delta RED exited 1 with 1 failed/24 passed because the second starter replaced accumulated `hello` with ` world`. |
| GREEN | The same five-file command exited 0 with 62/62 tests after minimum production publication. A separate first-turn production caller RED failed 1/24 with `Codex session is not ready`, then passed 24/24 after lazy runtime opening; concurrent first-turn triangulation passed 25/25. The repeated-delta correction passed 25/25 and retained `hello world`. |
| Focused regression | `bun run --cwd packages/web test --` the six Codex, five event-stream, relay tunnel-host, and UI-auth files exited 0: 13 files and 116/116 tests passed. |
| Runtime harness | Authenticated direct and relay loopback harness exited 0 with all four WS/SSE projection paths true, scoped URL/bearer auth, origin gate, preserved OpenCode upstream event, revision 1/running, and replay `events`. Two preliminary invocations were invalidated before acceptance. The current-candidate supplemental runtime scenario exited 0 with `text: hello world`, revision 3, 3 replay events, 3 broadcaster deliveries, and `/workspace` directory scope. |
| Static checks | Web `type-check`, Web `lint`, and `node --check` on six changed JS production files all exited 0 with no diagnostics. |
| Added/export check | `bun run dead-code` exited 0; unchanged non-blocking baseline: 206 unused exports, 156 unused exported types, and 1 duplicate export. No WU6R file was newly reported. |
| Performance/backpressure | Projection writes are O(changes × affected projected bucket), replay is a fixed 256-entry ring, malformed/rejected notifications allocate no replay revision, and existing 16 MiB WS buffered-byte eviction remains authoritative. Broadcaster failures/dropped clients are counted without payload logging and never roll back snapshot/replay. |
| Cleanup/process | Final harness closed relay streams, direct WS/SSE, Codex runtime, message-stream runtime, auth controller, and loopback server. Port `42579` rejected a follow-up connection; `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0. No harness file remains. |
| Authored lines | 12 evidence-bound implementation/test/documentation paths changed by `+476/-36 = 512` authored lines. The two SDD artifact merges add `+70/-38 = 108`, for an all-touched-file total of `+546/-74 = 620`. This is an accepted under-run below the hard 800-line limit; the prior 650–750 figure was a planning forecast, not a required minimum. No generated lines. |
| Evidence revision | SHA-256 `8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854`, computed over the 12 sorted WU6R candidate paths with `path + NUL + bytes + NUL` framing; distinct from failed evidence `425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`. |
| Rollback boundary | Revert only WU6R changes in the 12 hashed paths: notification callback, revisionless translator contract, projection publisher/snapshot/replay/lazy-open runtime changes, projected route contract, broadcaster result accounting, index injection, focused tests, and Codex transport documentation. WU0-WU10 behavior, WU11+, `bun.lock`, generated protocol files, and `.codegraph/` remain outside rollback. |

### WU11

| Evidence | Exact result |
|---|---|
| Safety net | `bun test packages/ui/src/sync/{bootstrap.test.ts,session-message-loader.test.ts,event-pipeline.test.ts,__tests__/event-reducer.test.ts}` → exit 0, 49/49 tests passed; expected bootstrap failure-path diagnostic only. |
| RED | The same four-file command → exit 1 with 28 pass, 9 fail, and 2 missing-export errors. Failures proved missing projected snapshot parsing/replacement, subscribe-before-fetch buffering, raw Codex routing, reconnect reconciliation, gap/overflow repair, failure preservation, approval replacement, runtime rejection, and close/reopen behavior. |
| GREEN / TRIANGULATE / REFACTOR | Minimum GREEN passed 60/60; bounded non-convergence and wrong-session malformed triangulation passed 61/61; final 10-file UI/sync/relay command passed 104/104 with 298 assertions. Expected reconnect failure-path logs only. |
| Runtime harness | Inline deterministic production-module harness → exit 0: direct and relay modes each performed 2 authoritative reads, converged to revision 4, retained `direct-4`/`relay-4`, and reported `busy`. This validates transport-independent UI reconnect logic; real process/network conversation remains WU12 and was not fabricated here. |
| Static checks | `bun run --cwd packages/ui type-check` and `bun run --cwd packages/ui lint` → exit 0, no diagnostics. |
| Dead code | `bun run dead-code` → exit 0; unchanged non-blocking baseline 206 unused exports, 156 unused exported types, 1 duplicate export; no new WU11 report. |
| Performance/bounds | Live buffer is fixed at 256 events per session; repairs are capped at 2 consecutive authoritative reads per trigger; snapshot replacement scans only the affected session snapshot/old buckets, and live application handles only contiguous affected events without transcript-history rescans. Unrelated session references remain stable. |
| Cleanup/process | Inline harness created no file/listener/child process; both loaders/stores disposed; zero Codex processes remained. No Git/GitHub, dependency, generated-file, `bun.lock`, or `.codegraph/` command/edit occurred. |
| Changed lines / budget | Authoritative native accounting measured 866 changed lines against the original 800-line budget. Maintainer Eliezer Rangel approved WU11-only `size:exception`, making the effective delivery strategy `exception-ok` for this work unit only. The earlier evidence-bound implementation-path estimate was `+751/-16 = 767`; native accounting is authoritative. |
| Evidence revision | SHA-256 `0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`, computed over the 9 sorted WU11 candidate paths with `path + NUL + bytes + NUL` framing. |
| Rollback boundary | Revert only the 9 WU11 implementation/test/documentation paths listed above. Preserve WU0-WU10, WU6R, WU12+, OpenCode behavior, `bun.lock`, generated protocol, `.codegraph/`, and unrelated bytes. |

## Compatibility Evidence

| Area | Result |
|---|---|
| Checkout | `refs/heads/personal` at `75bd5ac6ab7ef3b99932a5e910410cf9b958f8a9`, resolved without invoking Git. |
| Runtime versions | Codex `0.147.0`; Node.js `v26.7.0`; Bun `1.3.14`. |
| TypeScript schema | 723 files; aggregate SHA-256 `81515e7bbee62a6eea19a5a686a1a2d9c310ea0c5124e6b7eba4fc46c71d83a1`. |
| JSON Schema | 361 files; aggregate SHA-256 `e0e83a5379d87b58746426d7d7f53dafc151ec40910a1f3e7c9f2b838b663e2a`. |
| Process conversation | Two direct stdio app-server instances initialized; new thread streamed/completed; replacement process resumed the same thread and streamed/completed a second turn. |
| Approval | `item/commandExecution/requestApproval` observed; one-time `accept` response executed the isolated probe; probe removed. |
| Interrupt | `turn/interrupt` settled through `turn/completed` with terminal status `interrupted`. |
| Privacy | No credentials, raw payloads, prompts, reasoning, command output, environment values, or raw thread identifiers were persisted. |

## Native Attempt Settlement Evidence

- Attempt token: `sha256:25fe5b70deb5962850813883483e66121bc1ebd65aa3717f9c5062c9c9a4297e` (recorded only for orchestrator correlation; this apply did not acquire or settle an attempt).
- Outcome: `passed`.
- Settlement state: `complete` (the exact observed native settlement state for the initial WU0 run).
- Evidence revision: SHA-256 `6451bea24b41226b9d531f1a78b8268d45da04852fb1c076ef52a291c8cc44bf` for `docs/.codex-app-server-spike/report.json`.
- Proven diagnosis: Codex CLI `0.147.0` is compatible with the required MVP lifecycle; PR #884's `turn/aborted`, raw logging, permissive malformed-JSONL handling, non-atomic bindings, hard-coded availability, and exit-to-idle assumptions are incompatible with current requirements.
- Harness disposition: `reused` — the same harness passed before and after refactoring.
- Cleanup evidence: only `report.json` remains in the isolated evidence directory; the schema working directories and approval probe were removed; `ps -C codex -o pid=,stat=,args=` returned no process.
- Process evidence: two app-server instances exited with code 0 and no signal; they emitted 332 and 582 stderr bytes respectively, counted but neither stored nor printed; the report records `liveAfterCleanup: false`.

### Metadata-only correction evidence

- Correction attempt token: `sha256:be85a5451d1b4d7be20fb8c87506237e819837f7153af186fd3c265bfb225250` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — the persistence-contract defect was corrected without new verification.
- Settlement state: `complete` — reused from the exact observed native settlement of the initial WU0 run; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `6451bea24b41226b9d531f1a78b8268d45da04852fb1c076ef52a291c8cc44bf` for the unchanged `docs/.codex-app-server-spike/report.json`.
- Proven diagnosis: the implementation and hard gate had already passed; only persisted apply-progress metadata omitted explicit Result Contract fields and native settlement state `complete`.
- Harness disposition: `reused` — existing WU0 runtime evidence was retained; the runtime spike and tests were not rerun.
- Cleanup evidence: no temporary correction artifacts were created, no implementation bytes changed, and existing WU0 cleanup evidence remains unchanged.
- Process evidence: no process was launched for this metadata-only correction; existing initial-run process evidence remains unchanged.

### Slice 2 / WU1 settlement evidence

- Attempt token: `sha256:7e84423bc362c5ae737b0740de65b6c2cd1da4978f6ceb5517dbceb629822cfe` (supplied by the orchestrator; this apply did not acquire or settle another attempt).
- Outcome: `passed` for the WU1 acceptance boundary.
- Settlement state: `complete` — the exact authoritative native settlement state returned for this WU1 evidence revision.
- Evidence revision: SHA-256 `b1b1e58a39f66927a0da06042a4f8cb9ac1799d950dd15626e26aeff1f29b59c`, computed over sorted WU1 authored and generated implementation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: Codex 0.147.0 emits a stable newline-delimited generic JSON-RPC envelope with 133 client requests, 11 server requests, and 70 server notifications; malformed/schema-invalid or oversized frames must fail all affected pending work, while an unknown valid response ID is safely warn-only and does not corrupt trustworthy correlation.
- Harness disposition: `reused` — the same client contract passed GREEN, triangulation, refactor, deterministic generation, and the real app-server process scenario.
- Cleanup evidence: generator temporary schema directories and `/tmp/opencode/codex-jsonrpc-wu1-runtime.mjs` were removed; a cleanup check found no remaining Codex process.
- Process evidence: one directly spawned `codex app-server --listen stdio://` initialized, accepted `initialized`, correlated `thread/list`, and exited code 0 with no signal; 332 stderr bytes were counted but neither stored nor printed.

#### Slice 2 / WU1 metadata-only correction evidence

- Correction attempt token: `sha256:d9b35b7c00cb7b03025d029614efdb305397b62ee4e396a8db6ac37d14bc937d` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative WU1 settlement.
- Settlement state: `complete` — reused from the exact authoritative native settlement result; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `b1b1e58a39f66927a0da06042a4f8cb9ac1799d950dd15626e26aeff1f29b59c` for the unchanged WU1 authored and generated implementation bytes.
- Proven diagnosis: both cumulative apply-progress records were coherently stale at `partial` with obsolete pending-settlement wording even though authoritative native settlement had returned exactly `{ "state": "complete" }` for the passing WU1 evidence revision.
- Harness disposition: `reused` — existing passing WU1 focused and runtime evidence was retained; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created, no implementation or generated bytes changed, and the existing WU1 cleanup evidence remains unchanged.
- Process evidence: no process was launched for this metadata-only correction; existing WU1 process evidence remains unchanged.

### Slice 3 / WU2-WU3 settlement evidence

- Attempt token: `sha256:795b228a921da6ec2befc35e7fe895e97b6088b714ca0a677c42bc4052cd4438` (supplied by the orchestrator; this apply did not acquire or settle another attempt).
- Outcome: `passed` for the WU2-WU3 acceptance boundary.
- Settlement state: `complete` — the exact authoritative native settlement state returned for this Slice 3 evidence revision.
- Evidence revision: SHA-256 `1d5183ab40aa5407df2734282b00c8edd1a341d722b2a5db413313d1ca046ffd`, computed over the five sorted Slice 3 implementation/test paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: canonical binding scope, atomic metadata-only persistence, explicit corruption/conflict failure, direct Codex 0.147.0 initialization/control, bounded shutdown, and server-owned idle cleanup work without imposing a turn timeout or translating failure into idle success.
- Harness disposition: `reused` — WU3 directly reuses the WU1 JSON-RPC client and WU0-verified Codex 0.147.0 initialize/initialized/thread-list process behavior.
- Cleanup evidence: both temporary binding roots were removed; `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0 after the real process harness.
- Process evidence: one direct app-server process initialized, accepted `initialized`, correlated `thread/list`, and closed with final state `closed`; 332 stderr bytes were counted, not retained or printed.

#### Slice 3 / WU2-WU3 metadata-only correction evidence

- Correction attempt token: `sha256:083c6416e0d137f48dc352a402520f2381bbbd2a7260d1cc8235e9374f7c7dbe` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative WU2-WU3 settlement.
- Settlement state: `complete` — reused from the exact authoritative native settlement result; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `1d5183ab40aa5407df2734282b00c8edd1a341d722b2a5db413313d1ca046ffd` for the unchanged Slice 3 implementation and test bytes.
- Proven diagnosis: both cumulative apply-progress records were coherently stale at `partial` with obsolete pending-settlement wording even though authoritative native settlement had returned exactly `{ "state": "complete" }` for the passing WU2-WU3 evidence revision.
- Harness disposition: `reused` — existing passing WU2-WU3 focused, filesystem, and real-process evidence was retained; tests and runtime harnesses were not rerun.
- Cleanup evidence: no temporary correction artifacts were created, no implementation bytes changed, and every task checkbox remains unchanged.
- Process evidence: no process was launched for this metadata-only correction; existing WU2-WU3 process evidence remains unchanged.

### Slice 4 / WU4 settlement evidence

- Attempt token: `sha256:4b9f9fcbd67a3d9fde4426027e0131fc4aa80c7e668222246d8a34e7a8e5a244` (supplied by the orchestrator; this apply did not acquire or settle an attempt).
- Outcome: `passed` for the WU4 acceptance boundary.
- Settlement state: `complete` — the exact authoritative settlement returned `{ "state": "complete" }` for this evidence revision.
- Evidence revision: SHA-256 `97a52340efe65f44b5e17b7e4a966c0f8144490ee23c82cd81effbd616d8e9b2`, computed over the two sorted WU4 implementation/test paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: authoritative Codex memory can reject stale snapshots, preserve unrelated complete state across malformed/unknown input, advance monotonic revisions, bound replay writes, and reconstruct completed history only from a matching binding plus full terminal `thread/read` evidence. Unsupported reads remain a distinct limitation; incomplete, malformed, or failed reads are explicit failures.
- Harness disposition: `invalidated` — the authoritative settlement invalidated the WU4 harness disposition for this evidence revision.
- Cleanup evidence: the temporary harness and workspace were removed, the probe thread was archived through Codex, and `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0. No credentials, prompts, reasoning, command output, raw JSON-RPC payloads, or environment values were printed or retained by the harness.
- Process evidence: two direct Codex 0.147.0 app-server instances initialized; the first completed the isolated turn, and the second resumed/read the same completed thread, returned two authoritative transcript items, archived it, and completed bounded shutdown. No Codex process remained.

#### Slice 4 / WU4 metadata-only correction evidence

- Correction token: `sha256:23c5326025ef5a10a8c6ac569b49f616563fbf05ab0b632efb8ed68b2630ce82` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative WU4 settlement.
- Settlement state: `complete` — reused from the exact authoritative result `{ "state": "complete" }`; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `97a52340efe65f44b5e17b7e4a966c0f8144490ee23c82cd81effbd616d8e9b2` for the unchanged WU4 implementation and test bytes.
- Proven diagnosis: both cumulative apply-progress records were stale because they retained obsolete settlement and harness-disposition metadata after WU4 implementation and evidence had passed.
- Harness disposition: `invalidated` — the authoritative settlement invalidated the WU4 harness disposition; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created, no implementation bytes changed, and every task checkbox remains unchanged; the existing WU4 cleanup evidence remains preserved above.
- Process evidence: no process was launched for this metadata-only correction; the existing WU4 process evidence remains preserved above.

### Slice 5 / WU5 settlement evidence

- Attempt token: `sha256:865dfdcb880de7ac58130e5e13919aa10df3aeed046f6c813a8950eac93424bf` (supplied by the orchestrator; this apply did not acquire or settle an attempt).
- Outcome: `passed` for the WU5 acceptance boundary.
- Settlement state: `complete` — the exact authoritative settlement returned `{ "state": "complete" }` for this evidence revision.
- Evidence revision: SHA-256 `c95706a8a36265b0c39e96da496752fea451337856e2826eebd1e5b730a42022`, computed over the seven sorted WU5 implementation/test/documentation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: Codex exposure remains a separately owned Web Server route family whose eligibility is frozen from authoritative launch state, whose requests pass the existing API auth gate, whose routes win before generic OpenCode proxy fallback, and whose runtime is drained during graceful shutdown. Electron, VS Code, hosted-mobile, and Capacitor runtime descriptors remain unavailable; request surface spoofing cannot grant access.
- Harness disposition: `reused` — the same route runtime passed GREEN, triangulation, refactor, cumulative focused tests, and the real loopback HTTP scenario.
- Cleanup evidence: the inline harness created no temporary file, closed its loopback HTTP listener, invoked Codex shutdown exactly once, and `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0.
- Process evidence: one Node.js harness process exercised real HTTP routing and exited 0; WU5 did not spawn a Codex app-server process, and no Codex process remained after validation.

#### Slice 5 / WU5 metadata-only correction evidence

- Correction token: `sha256:6cfaa30e0d389bcfe577cb691e09ae16714f428082a78357a15835ca2208fc3e` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative WU5 settlement.
- Settlement state: `complete` — reused from the exact authoritative result `{ "state": "complete" }`; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `c95706a8a36265b0c39e96da496752fea451337856e2826eebd1e5b730a42022` for the unchanged seven WU5 implementation, test, and documentation paths.
- Proven diagnosis: both cumulative apply-progress records were stale at `partial` with obsolete pending-settlement routing even though WU5 passed and authoritative native settlement was complete for the exact evidence revision.
- Harness disposition: `reused` — existing passing WU5 focused and runtime evidence was retained; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created, no implementation bytes changed, and every task checkbox remains unchanged; `bun.lock` and `.codegraph/` were untouched.
- Process evidence: no process was launched for this metadata-only correction; existing WU5 process evidence remains preserved above.

### Slice 6 / WU6 settlement evidence

- Attempt token: `sha256:8e53442526c7cb20b37352bf26abc670ad6097b8d4517aa8b81a9b577039ed58` (supplied by the orchestrator; this apply did not acquire or settle another attempt).
- Outcome: `passed` for the WU6 implementation and acceptance boundary.
- Settlement state: `complete` — the exact authoritative settlement returned `{ "state": "complete" }` for this evidence revision.
- Evidence revision: SHA-256 `4d7836efd8e7fa8e65bd89568b0a4d31263ad332586e3452758a7134094d086f`, computed over the eight sorted WU6 implementation/test/documentation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: Codex 0.147.0 notifications and approval requests can be translated explicitly into engine-tagged message/part/diff/permission/status/error projections, ordered and deduplicated by per-session revision, and applied without OpenCode event coercion, full-history scans, stale authority overwrite, or unrelated reference churn.
- Harness disposition: `reused` — the authoritative settlement retained the corrected schema-shaped translator/orderer/reducer harness that passed twice against the same evidence bytes.
- Cleanup evidence: `/tmp/opencode/codex-wu6-schema` was removed; the inline harness created no file; the initial invalid harness draft produced no state or artifact; `test -z "$(ps -C codex -o pid=,stat=,args=)"` exited 0.
- Process evidence: two accepted Bun harness processes exited 0 with the same aggregate result; the discarded pre-evidence Bun invocation exited 1 on syntax before module execution; WU6 spawned no Codex app-server process and no Codex process remained.

#### Slice 6 / WU6 metadata-only correction evidence

- Correction attempt token: `sha256:ab2c34ed6421c931532b327c582c4c1aa4dfee05ad22f629eceb6f8b07a9523b` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Native reset revision: SHA-256 `00dea1d54e071ed3d1c84a647cb891989a17d522024697521f2a16dcabf2e716` — maintainer-authorized reset completed successfully after the previous correction actor was cancelled, establishing this distinct correction generation.
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata reflects the authoritative WU6 settlement.
- Settlement state: `complete` — reused from the exact authoritative result `{ "state": "complete" }`; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `4d7836efd8e7fa8e65bd89568b0a4d31263ad332586e3452758a7134094d086f` for the unchanged eight WU6 implementation, test, and documentation paths.
- Proven diagnosis: the WU6 implementation and evidence had passed and native settlement was complete; only the cumulative OpenSpec and Engram metadata required correction after the cancelled actor and successful maintainer-authorized native reset.
- Harness disposition: `reused` — existing passing WU6 focused and runtime evidence was retained; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created; no implementation, test, task, WU7, generated, lockfile, CodeGraph, or unrelated bytes changed. WU5, `bun.lock`, and `.codegraph/` remain untouched.
- Process evidence: no test, runtime harness, application process, Git command, or GitHub command was launched for this metadata-only correction; existing WU6 process evidence remains preserved above.

### Slice 7 / WU7-WU8 settlement evidence

- Attempt token: `sha256:29c210cd4583e195f753bd0002a54a919b857654f13e936f053993a4d82d7d92` (supplied by the parent; this apply did not acquire or settle it).
- Outcome: `passed` for WU7-WU8 implementation, focused acceptance, and native settlement.
- Settlement state: `complete` — the authoritative native settlement completed for this exact evidence revision; this correction did not acquire or settle an attempt.
- Evidence revision: SHA-256 `99700d12f2a92c94e296eaf122140bd06f1fc73d2830eb44ad8da5659b169b1e`, computed over 18 sorted Slice 7 implementation, test, and documentation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: explicit request IDs plus runtime-owned active-turn claims prevent duplicate Codex inference across concurrent, accepted, and ambiguous retries; approval server requests retain authoritative session/thread/turn scope, and atomic once/reject claims emit one JSON-RPC response while stale, mismatched, `always`, auto-accept, and OpenCode paths fail closed.
- Harness disposition: `reused` — one inline loopback HTTP/runtime scenario covered both WU7 and WU8 and remains the settlement evidence harness.
- Cleanup evidence: the inline harness created no file, closed its listener, and shut down its runtime in `finally`; the failed Python hash attempt created nothing; `bun.lock` retained its pre-session mtime and no lockfile edit was made. No manual `.codegraph/` edit occurred.
- Process evidence: the accepted Node harness exited 0; it used a fake app-server boundary and spawned no Codex process; the final zero-process check exited 0. Focused test/static/dead-code processes all exited 0 after refactor.

#### Slice 7 / WU7-WU8 metadata-only correction evidence

- Correction token: `sha256:314c5eec076e25a24ba2a907f8b4cb490320ce2ca5228521ce9c3c7e41460534` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative Slice 7 / WU7-WU8 settlement.
- Settlement state: `complete` — reused from the exact authoritative native settlement result; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `99700d12f2a92c94e296eaf122140bd06f1fc73d2830eb44ad8da5659b169b1e` for the unchanged 18 sorted Slice 7 implementation, test, and documentation paths.
- Proven diagnosis: WU7-WU8 implementation, focused acceptance, and native settlement had passed; only cumulative OpenSpec and Engram apply-progress retained obsolete `partial`, pending-settlement, blocker, and routing metadata.
- Harness disposition: `reused` — existing passing Slice 7 focused and runtime evidence was retained; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created; no source, test, task, WU9, generated, lockfile, CodeGraph, or unrelated bytes changed. WU5, WU6, `bun.lock`, and `.codegraph/` remain preserved.
- Process evidence: no test, runtime harness, application process, Git command, or GitHub command was launched for this metadata-only correction; existing Slice 7 process evidence remains preserved above.

### Slice 8 / WU9 native attempt settlement evidence

- Attempt token: `sha256:7627db422575604bcdbdf3585e7774287c9f15fdefa6ca2e1da3a192b95b1632` (supplied; this apply did not acquire or settle it).
- Outcome: `passed` for WU9 implementation, local acceptance, and authoritative native settlement.
- Settlement state: `complete` — the authoritative native settlement completed for this exact evidence revision; this correction did not acquire or settle an attempt.
- Evidence revision: SHA-256 `b5f7d70e2ba3896868aa44f23f371efcb808dcb072c7abeda84a16c54d7f2fd9`, computed over 12 sorted WU9 implementation, test, and documentation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: abort previously had no Codex route or runtime owner, so active turns, pending approvals, running items, late events, and process/cleanup races could not converge. WU9 now atomically clears ownership, emits at most one interrupt, rejects pending approvals, terminalizes active item states, rejects late activity, preserves explicit interrupt/process failure, and retries partial cleanup.
- Harness disposition: `reused` — the authoritative settlement reused the passing inline runtime harness; it created no file or process and exercised the production runtime with a fake app-server process boundary.
- Cleanup evidence: the inline harness created no temporary file, runtime shutdown ran exactly once, and the zero-Codex-process check exited 0; `bun.lock`, `.codegraph/`, and unrelated bytes were not edited.
- Process evidence: the inline Node harness exited 0; it spawned no Codex process. Focused tests, syntax/type/lint, and dead-code checks exited 0.

#### Slice 8 / WU9 metadata-only correction evidence

- Correction token: `sha256:da9978bb3cd44ed7b8e48ed09257c7bc4615c743a410a457943a94b37bb3f9dd` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative Slice 8 / WU9 settlement.
- Settlement state: `complete` — reused from the exact authoritative native settlement result; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `b5f7d70e2ba3896868aa44f23f371efcb808dcb072c7abeda84a16c54d7f2fd9` for the unchanged 12 sorted WU9 implementation, test, and documentation paths.
- Proven diagnosis: WU9 implementation, focused acceptance, and native settlement had passed; only cumulative OpenSpec and Engram apply-progress retained obsolete `partial`, pending-settlement, harness-disposition, blocker, and routing metadata.
- Harness disposition: `reused` — existing passing WU9 focused and inline runtime evidence was retained; tests and the runtime harness were not rerun. The inline harness created no files or processes.
- Cleanup evidence: no temporary correction artifacts were created; no source, test, task, WU10, generated, lockfile, CodeGraph, or unrelated bytes changed. Only the two cumulative apply-progress records were corrected.
- Process evidence: no test, runtime harness, application process, Git command, or GitHub command was launched for this metadata-only correction; existing WU9 process evidence remains preserved above.

### Slice 9 / WU10 native attempt settlement evidence

- Attempt token: `sha256:726b535b34092286bdd413df177287825aaf6d6dafef0448b1daba62bca511c2` (supplied for orchestrator correlation only; this apply did not acquire or settle it).
- Outcome: `passed` for WU10 implementation, local acceptance, and authoritative native settlement.
- Settlement state: `complete` — authoritative native settlement completed for this exact evidence revision; this correction did not acquire or settle an attempt.
- Evidence revision: SHA-256 `7f3f8ec157c48f79630431f7ad31e5043140c1f11b73ee31ac481de0c4793860`, computed over 25 sorted WU10 implementation, test, locale, and documentation paths with `path + NUL + bytes + NUL` framing.
- Proven diagnosis: chat submission previously encoded OpenCode provider/model as the routing identity, so Codex could not be selected without entering OpenCode session creation and SDK prompt paths. WU10 adds an explicit execution-target discriminant, trusts server capability only on Web, isolates Codex session/prompt transport, rejects unsupported surfaces and payloads, and leaves OpenCode routing unchanged.
- Harness disposition: `reused` — authoritative settlement reused the accepted inline authenticated HTTP harness, which created no file or child process.
- Cleanup evidence: the loopback listener closed in `finally`; no temporary artifact was created; the zero-Codex-process check exited 0. `bun.lock`, generated protocol files, and unrelated bytes were not edited; `.codegraph/` received no manual edit.
- Process evidence: one Bun harness process exercised authenticated capability, session creation, and prompt transport and exited 0. It spawned no Codex app-server process. Focused test, UI/Web static, and dead-code processes exited 0.

#### Slice 9 / WU10 metadata-only correction evidence

- Correction token: `sha256:115d76311169334ab4d11b4112e1c89030e2a5343873f74ab307e9c7db9fd40c` (recorded only for orchestrator correlation; this correction did not acquire or settle an attempt).
- Outcome: `passed` — cumulative OpenSpec and Engram apply-progress metadata now reflects the authoritative Slice 9 / WU10 settlement.
- Settlement state: `complete` — reused from the exact authoritative native settlement result; this metadata-only correction did not perform settlement.
- Evidence revision: SHA-256 `7f3f8ec157c48f79630431f7ad31e5043140c1f11b73ee31ac481de0c4793860` for the unchanged 25 sorted WU10 implementation, test, locale, and documentation paths.
- Proven diagnosis: WU10 implementation, focused acceptance, and native settlement had passed; only cumulative OpenSpec and Engram apply-progress retained obsolete `partial`, pending-settlement, harness-disposition, blocker, and routing metadata.
- Harness disposition: `reused` — existing passing WU10 focused and authenticated runtime evidence was retained; tests and the runtime harness were not rerun.
- Cleanup evidence: no temporary correction artifacts were created; no source, test, task, WU11, generated, lockfile, CodeGraph, or unrelated bytes changed. Only the two cumulative apply-progress stores were corrected.
- Process evidence: no test, runtime harness, application process, Git command, or GitHub command was launched for this metadata-only correction; existing WU10 process evidence remains preserved above.

### WU6R remediation-bound settlement evidence

- Native token: `sha256:9f4676ac36736e084714d0761539827bc096ee27e103e1f078f6ccddd43880e9` (supplied for correlation; this metadata-only correction did not acquire or settle it).
- Outcome: `passed`; native settlement state: `complete` for the exact evidence revision below.
- Evidence revision: SHA-256 `8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854` over the 12 sorted WU6R candidate paths; it is distinct from and explicitly remediates failed evidence revision `sha256:425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`.
- Proven diagnosis: WU6 had isolated translator/reducer tests but production omitted the JSON-RPC notification callback, runtime translator caller, projected snapshot/replay authority, broadcaster injection, and lazy first-turn app-server opening. WU6R adds those missing production edges without creating a Codex transport or changing OpenCode stream semantics.
- Harness disposition: `reused` for the accepted direct+relay WS/SSE scenario, supplemented on the current candidate by the passing repeated-delta runtime scenario. The first two preliminary direct/relay invocations were invalidated before acceptance and are not settlement evidence.
- Cleanup evidence: no temporary harness file exists; all direct and relayed streams, sockets, runtimes, auth state, and loopback listener closed; port `42579` rejected reconnection; no Codex process remained.
- Process evidence: the accepted direct/relay Node harness and current repeated-delta runtime scenario exited 0 and used a fake Codex process boundary; focused test, type-check, lint, syntax, and dead-code processes exited 0. No Codex app-server, Git, GitHub, commit, branch, PR, dependency-install, or generated-file command ran.
- Remediation binding: authoritative settlement for the distinct passing evidence revision explicitly remediated `sha256:425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`.

#### WU6R automatic gatekeeper correction evidence

- Correction token: `sha256:e8b7474c03f94a50eeaa9e4e313aa36f5b2785f48c5e3fe65a0573aa4c1f78a0` (recorded only for orchestrator correlation; this correction did not acquire or settle it).
- Outcome: `passed` — cumulative OpenSpec and Engram tasks/apply-progress now reflect the authoritative WU6R settlement.
- Settlement state: `complete` — reused from the authoritative native result for evidence revision `sha256:8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854`; this metadata-only correction did not perform settlement.
- Remediation binding: the passing revision explicitly remediates failed evidence revision `sha256:425804b8d68073238629463904430bccf47e27f28f7adb756e5d348cabe66125`.
- Harness disposition: `reused` — existing passing focused, direct/relay WS+SSE, and repeated-delta runtime evidence was retained; tests and harnesses were not rerun.
- Budget reconciliation: actual authored changes are 512 evidence-bound / 620 all-touched lines, an accepted under-run below hard 800; the prior 650–750 figure was a forecast, not a required minimum.
- Cleanup evidence: no temporary correction artifacts were created; no code, design, spec, proposal, `bun.lock`, `.codegraph/`, generated, or unrelated bytes changed. Only the OpenSpec and Engram tasks/apply-progress records were corrected.
- Process evidence: no test, runtime harness, application process, Git command, or GitHub command was launched for this metadata-only correction; all prior acceptance, cleanup, process, harness, and rollback evidence remains preserved.

### WU11 native attempt settlement evidence

- Native reset revision: `sha256:8aa2a2de2ac805efcd47d39705149aacbcecf3bd22068db352891f71e8de1c29`; reset succeeded and established the new native attempt generation.
- Native token: `sha256:a528ae6ca1103a20cca67fb6c41906f2d2c3d63cea5b4845f83876a7be1f6c9c` (the authoritative attempt settled externally; this metadata correction did not acquire or settle it).
- Outcome: `passed`; native settlement state: `complete` for the exact evidence revision below.
- Delivery/budget: authoritative native count 866 changed lines versus the original 800-line budget. Maintainer Eliezer Rangel explicitly approved WU11-only `size:exception`; effective delivery strategy is `exception-ok` for WU11 only.
- Evidence revision: SHA-256 `0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef` over the 9 sorted WU11 implementation/test/documentation paths.
- Proven diagnosis: pre-WU11 UI transport discarded raw Codex envelopes because they lacked an OpenCode `type`, ordinary message loading called the OpenCode SDK, and no owner combined subscribe-before-fetch buffering with authoritative projected snapshot replacement. WU11 routes Codex separately, makes the message loader the reconciliation owner, rejects stale runtime completions, and bounds fail-closed repair without altering OpenCode event semantics. The subsequent native rejection was solely a review-budget metadata mismatch: authoritative native accounting measured 866 rather than the original 800-line budget, and the maintainer accepted the exception without changing implementation evidence.
- Harness disposition: `reused` — one deterministic production-module harness exercised the same reconnect authority path for direct and relay labels; WU6R's already accepted authenticated direct/relay WS+SSE transport harness remains valid prerequisite evidence, while WU12's real process fixture remains intentionally pending.
- Cleanup evidence: the inline harness created no temporary file, listener, socket, or child process; all loaders/stores disposed; zero Codex processes remained; `bun.lock`, generated protocol files, `.codegraph/`, and unrelated bytes were preserved. This metadata correction created no temporary artifact and changed no implementation bytes.
- Process evidence: RED, GREEN, triangulation/refactor, 104-test focused regression, UI type-check/lint, dead-code, evidence hashing, deterministic reconnect harness, and zero-process check completed as recorded. This metadata correction launched no test, harness, application, Git, GitHub, acquire, or settle process.

#### WU11 automatic gatekeeper metadata correction evidence

- Correction token: `sha256:a703b21ccb0bcd0cca37c50d071e052a7756ce894f87be9373d32d6249bfed26` (recorded only for correlation; this correction did not acquire or settle it).
- Outcome: `passed` — OpenSpec and Engram tasks/apply-progress metadata records authoritative WU11 settlement completion and the maintainer-approved WU11 exception.
- Settlement state: `complete` — reused from the authoritative native result for the exact evidence revision; this metadata-only correction did not perform settlement.
- Evidence revision: `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; focused passing evidence is unchanged.
- Diagnosis: WU11 implementation, evidence, and native settlement had passed; only cumulative OpenSpec and Engram metadata retained obsolete pending-settlement routing. Authoritative native accounting remains 866 changed lines against the original 800-line budget, with the mismatch resolved through maintainer-approved WU11-only `size:exception` / `exception-ok` without changing candidate bytes.
- Harness disposition: `reused` — all previously accepted focused, static, deterministic reconnect, authenticated transport, cleanup, and process evidence remains unchanged.
- Scope: no implementation, design, spec, proposal, dependency, generated protocol, `bun.lock`, `.codegraph/`, test, harness, cleanup, WU6R remediation/settlement, WU12, WU13, or unrelated bytes changed.
- Process evidence: no test, runtime harness, application process, Git command, GitHub command, acquire, or settle process was launched for this automatic metadata correction.

## Deviations and Issues

- Deviations from design: none. WU11 consumes WU6R's projected authority, keeps direct/relay transport transparent, and preserves OpenCode bootstrap/reconnect behavior.
- Issues found and resolved: raw Codex envelopes were not OpenCode events and therefore required an isolated pipeline branch; authoritative repair also needed a cap to prevent a malicious or permanently non-converging gap from causing an immediate refetch loop. WU11 now fails closed after two repair reads and exposes a retryable error while preserving valid state.

## Workload / PR Boundary

- Mode: WU11-only `size:exception`; effective delivery strategy `exception-ok`. The broader change remains an `auto-chain` feature-branch-chain.
- Chain strategy: feature-branch-chain remains unchanged outside the WU11 exception.
- Current boundary: WU11 starts from accepted/settled WU6R production projection publication and ends with complete/passed UI reconnect/reconciliation and native settlement at `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; harness reused. It stops before WU12.
- Chain relationship: feature-branch-chain child WU11 follows WU6R and precedes WU12; no branch, commit, push, or PR command ran.
- Excluded: WU12 process-backed integration, WU13 release checks, unsupported/native Codex enablement, and changes to server publication, OpenCode inference, or upstream stream semantics.
- Review budget: authoritative native accounting measured 866 changed lines against the original 800-line budget. Maintainer Eliezer Rangel approved WU11-only `size:exception`; the effective delivery strategy is `exception-ok` for WU11 only. The earlier 767-line implementation-path estimate is non-authoritative. SDD metadata merges are audit artifacts; `bun.lock`, generated protocol files, `.codegraph/`, and unrelated bytes were preserved.

## Historical Slice 10 / WU11 Pre-WU6R TDD Evidence (resolved by WU6R)

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.2 WU11 | Bootstrap, message-loader, event-pipeline, reducer, Codex runtime/translator/routes | Unit + module integration | UI command passed 49/49; Web command passed 46/46 | Not started — the pre-WU6R production notification-to-WS/SSE prerequisite was absent; WU6R resolved it | Not started | Not started | Not started |

## Historical Slice 10 / WU11 Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused safety net | `bun test packages/ui/src/sync/bootstrap.test.ts packages/ui/src/sync/session-message-loader.test.ts packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-reducer.test.ts` -> exit 0, 49/49 tests passed. The expected bootstrap failure-path diagnostic was printed. |
| Server prerequisite safety net | `bun run --cwd packages/web test -- server/lib/codex/app-server-session.test.js server/lib/codex/runtime.test.js server/lib/codex/event-translator.test.js server/lib/codex/routes.test.js` -> exit 0, 4 files and 46/46 tests passed. These tests cover isolated components but no production translator-to-stream call path. |
| Runtime harness | Not run. Before WU6R, a WU11 reconnect harness could not exercise the absent Codex notification-to-WS/SSE production path without implementing out-of-scope server behavior or fabricating the boundary. WU6R resolved that prerequisite. |
| Rollback boundary | Revert only this historical pre-WU6R prerequisite record in `openspec/changes/codex-engine/apply-progress.md` and its Engram counterpart. No source/test behavior changed. |

## Historical Slice 10 / WU11 Native Attempt State

- Attempt token: `sha256:4d4b2465c0dbe8a6df83be9298fa0d204c19c3382ffc1efcd6816213e907d5ad` (supplied for correlation only; this apply did not acquire or settle it).
- Outcome/state: implementation did not start before RED because the pre-WU6R prerequisite was absent; WU6R resolved that prerequisite, and this historical attempt has no WU11 evidence revision to settle.
- Evidence revision: none — no WU11 source, test, generated, or harness evidence bytes were accepted.
- Historical diagnosis: WU11 required an authoritative snapshot followed by strictly newer buffered/live Codex events, but the pre-WU6R server neither captured app-server notifications nor published translated Codex projection envelopes to the shared event stream. Its messages response also exposed raw runtime transcript data rather than a UI projection snapshot. WU6R resolved this prerequisite; WU11 subsequently completed and passed.
- Harness disposition: not created; neither `reused` nor `invalidated` applies before a harness exists.
- Cleanup/process evidence: no runtime harness, OpenChamber application process, Codex app-server process, Git command, GitHub command, dependency install, or generated-file command ran. The two focused test processes exited 0; no source, test, lockfile, generated protocol, CodeGraph, or unrelated bytes changed.

## WU12 Process-Backed Integration Attempt

### Scenario Matrix

| Scenario | Outcome | Evidence |
|---|---|---|
| Authenticated real Codex conversation text streaming/completion | PASS | Direct prompt completed; relayed authoritative read returned idle, null active turn, and the expected streamed text. |
| Browser disconnect/reconnect | PASS | Broadcast subscriber detached without cancelling the turn; relayed snapshot and direct replay restored authoritative state. |
| Direct and relayed HTTP transport | PASS | Both authenticated direct loopback requests and real `createTunnelHost` HTTP forwarding exercised Codex routes; OpenCode fallback hits remained zero in the passing restart scenario. |
| Command/tool activity and approve-once | PASS before blocker | A real command approval was projected; direct once plus duplicate relayed once converged to one result; command/tool projection was present. |
| Isolated file edit and Git diff | FAIL | The temporary Git fixture changed `fixture.txt`, and fixture-local `git diff` contained the edit, but the authoritative Codex snapshot kept `diff: []`. |
| Reject | NOT ACCEPTED | The deterministic reject branch is authored, but the enclosing test stops at the earlier projected-diff failure before this branch executes. |
| Abort | FAIL | Concurrent direct/relay abort converged status to idle with null active turn and no approvals, but the projected command tool remained `running`. |
| Session/thread/workspace isolation | NOT ACCEPTED | The isolation branch is authored but follows the abort terminal-projection assertion, so no passing evidence is claimed. |
| Server/runtime restart and completed-thread resume | PASS | Listener/runtime restart reused the persisted binding and the next relayed turn retained the original thread ID. |
| Completed-thread read | PASS on this runtime | `recoverCompleted` returned `kind: recovered` with complete transcript state; the test explicitly classifies `completed-thread-history-unavailable` as the only accepted protocol limitation. |
| No OpenCode route leakage/privacy persistence | PASS in completed restart scenario | Codex requests never hit generic `/api` fallback; binding persistence contained no bearer token, auth header, prompt marker, or expected response marker. |
| Cleanup/process ownership | PASS | Final cleanup test passed: zero subscribers, closed listener, zero relay streams, zero tracked live Codex processes, and removed temporary root. Fixture threads were archived where supported. |

### WU12 Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused RED | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 1; missing fixture module, 0 tests collected. |
| Focused real-process run | Same command -> exit 1 after 57.77s; 3/5 tests passed and 2/5 failed on projected diff and abort terminal tool state. No infrastructure timeout or network dependency caused either failure. |
| Relevant Codex/server safety net | Nine Codex/event-stream/relay/auth files -> exit 0, 9/9 files and 96/96 tests passed before WU12 edits. |
| Syntax/static checks | `node --check` on both WU12 files, Web type-check, and Web lint -> exit 0 with no diagnostics. |
| Dead code | `bun run dead-code` -> exit 0; unchanged non-blocking baseline: 206 unused exports, 156 unused exported types, 1 duplicate export; no WU12 file reported. |
| Authored/generated lines | 548 authored additions: 195-line integration test plus 353-line fixture; 0 generated lines; below the hard 800-line work-unit budget. |
| Candidate revision | `sha256:6e1cf4258748691d5162eba6829503b2140a0e92abf997683d4ff6caf21d5bfa`, sorted path + NUL + bytes + NUL framing over the two WU12 fixture paths. This is distinct from the supplied native token. |
| Runtime harness | Real Codex 0.147.0 app-server processes, authenticated Express routes, direct HTTP, relay-host HTTP, temporary Git repositories, listener restart, completed-thread recovery, approval and abort controls. Outcome: invalidated by two production contract failures. |
| Cleanup/process | The passing final cleanup scenario reported `{browserSubscribers:0,listenerOpen:false,relayStreams:0,residualProcesses:0,temporaryRootExists:false}`. Prompts, credentials, auth headers, raw reasoning, environment values, and sensitive payloads were not printed or added to evidence. |
| Rollback boundary | Remove only `codex-engine.integration.test.js` and `codex-engine.integration-fixture.js`, plus this WU12 attempt metadata. Preserve WU0-WU11, WU6R, production contracts, `bun.lock`, `.codegraph/`, and unrelated bytes. |

### WU12 Native Attempt / Settlement Evidence

- Native token: `sha256:b82e51db5fc28ca7c91657aa09ebcab38a150e76b992c44bbf195aee71516b01` (supplied for correlation only; this apply did not acquire or settle it).
- Outcome: `blocked`; native settlement state: `pending`; WU12 remains unchecked.
- Candidate evidence revision: `sha256:6e1cf4258748691d5162eba6829503b2140a0e92abf997683d4ff6caf21d5bfa`, distinct from the native token.
- Diagnosis: the real process fixture proves that the workspace file and fixture-local Git diff change while `projectionSnapshot(...).diff` stays empty, and that abort clears active-turn/approval ownership and publishes idle while leaving the projected command part in `running`. Fixing either requires production changes outside WU12's fixture-only contract, so apply stopped before WU13.
- Harness disposition: `invalidated` — supported scenarios cannot be accepted as a complete WU12 harness while required projected diff and abort cleanup fail.
- Cleanup/process evidence: every fixture listener, relay stream, browser subscriber, temporary root, and tracked app-server process was removed; no real-repository Git state was read or mutated, and no Git/GitHub management, acquire, settle, dependency, generated-file, `bun.lock`, or `.codegraph/` command/edit occurred.

## WU12 Workload / PR Boundary

- Mode: `auto-chain`, `feature-branch-chain`; current autonomous slice is WU12 only.
- Boundary: starts from complete WU11 and ends at a blocked fixture-only candidate; WU13 is untouched.
- Review budget: 548 authored / 800 allowed; 0 generated lines; no size exception required.
- Production scope guard: no production contract was changed after the fixture exposed candidate-causal failures.

## WU12R Production Remediation Attempt

### WU12R TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12R RED/GREEN | `event-translator.test.js`, `runtime.test.js`, `codex-engine.integration.test.js` | Unit + process-backed integration | Translator/runtime baseline passed 2 files and 28/28 tests before edits | Focused RED exited 1 with 3 failed and 27 passed: named turn diff lacked `file`, abort left three projected tools active, and process exit left one projected command active. Pre-production process RED exited 1 with 2 failed and 3 passed: the model did not perform the requested edit and abort left a command projection running. Prior accepted WU12 diagnosis remains the real-edit/empty-projection evidence at `sha256:6e1cf4258748691d5162eba6829503b2140a0e92abf997683d4ff6caf21d5bfa`. | Minimum production changes passed 2 files and 30/30 tests. | File-status/multi-file triangulation first exited 1 with 1 failed and 4 passed, then the combined focused command passed 2 files and 31/31 tests. | Final five-file Codex/event-stream safety command passed 5 files and 67/67 tests; no further refactor was retained. |

### WU12R Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test | `bun run --cwd packages/web test -- server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js` -> exit 0, 2 files and 31/31 tests passed. |
| Focused safety | `bun run --cwd packages/web test -- server/lib/codex/app-server-session.test.js server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/event-stream/runtime.test.js` -> exit 0, 5 files and 67/67 tests passed. |
| Runtime harness | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 1 after 43.56s; 1/5 passed and 4/5 failed. The first failure observed `fixture.txt` still at `BASELINE`; later scenarios encountered HTTP 409 / active-writer conflicts, so no complete WU12R runtime acceptance exists. |
| Cleanup/process | Vitest `afterAll` invoked fixture cleanup. A post-run check for `[c]odex app-server`, `/tmp/openchamber-codex-wu12-*`, and `/tmp/opencode/codex-wu12r-schema` exited 0 with no output; the exited test process cannot retain listeners, relay streams, or subscribers. The generated schema inspection root was removed. |
| Authored/generated | 157 authored changed lines: 151 additions and 6 deletions across five candidate paths; 0 generated lines; within 800. |
| Candidate revision | `sha256:5aba889c2a9203dbc73554c714b056a6414f9c12926d103953078c288ad3cc5a`, sorted candidate path + NUL + bytes + NUL. |
| Rollback boundary | Revert only WU12R deltas in `event-translator.js`, `event-translator.test.js`, `runtime.js`, `runtime.test.js`, and `codex-engine.integration.test.js`; preserve the WU12 fixture, WU0-WU11/WU6R, UI, OpenCode, other runtimes, `bun.lock`, `.codegraph/`, and unrelated bytes. |

### WU12R Diagnosis and Scope

- The focused defects are corrected: translated Git diffs retain file identity and are not erased by a later empty file item; abort/process failure terminalize active projected command/tool/file parts through `CodexRuntime.publishEntry` without adding revision authority.
- The required process-backed evidence is not accepted. Its first real turn did not edit the isolated fixture on either pre-production or post-production runs; the post-production run then left an active writer that caused cascading 409 failures in later sequential scenarios.
- This evidence **does not remediate** failed WU12 evidence revision `sha256:6e1cf4258748691d5162eba6829503b2140a0e92abf997683d4ff6caf21d5bfa` because all five process-backed scenarios did not pass.
- Parent-owned token `sha256:1dadaca18eea82954f6edb059c55ead48d802e65475438a5d2b26680109cf6ba` was not acquired, settled, reset, or otherwise mutated.
- WU12R, WU12, and WU13 remain unchecked. No commit, repository Git/GitHub command, dependency change, generated output, UI, OpenCode, or other-runtime edit occurred.

### WU12R Workload / PR Boundary

- Mode: `auto-chain`, `feature-branch-chain`; current autonomous slice is WU12R only.
- Boundary: starts from the failed WU12 projection evidence and stops at non-accepted WU12R process verification before WU12 retry or WU13.
- Review budget: 157/800 authored changed lines; 0 generated; no exception.

## WU12R Maintainer-Authorized Corrective Retry

### Corrective TDD Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12R fixture determinism/isolation | `codex-engine.integration.test.js`, `codex-engine.integration-fixture.js` | Process integration | Prior failed candidate `sha256:5aba889c2a9203dbc73554c714b056a6414f9c12926d103953078c288ad3cc5a`: 1/5 passed; natural-language patch selection did not edit the file and shared lifecycle caused cascading 409 conflicts | Test-first changes required an exact fixture-owned command and per-test lifecycle/zero-resource assertions before the command fixture existed | Focused production command passed 31/31; safety command passed 67/67; real edit and fixture Git diff passed in the one process run | Independent fixtures allowed reconnect/restart/read and final cleanup scenarios to pass after the edit scenario failed, proving cross-test contamination was removed | FAILED acceptance: process fixture passed 3/5, so no accepted REFACTOR/closure evidence exists |

### Corrective Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused production | `bun run --cwd packages/web test -- server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js` -> exit 0, 2 files and 31/31 tests passed. |
| Focused safety | `bun run --cwd packages/web test -- server/lib/codex/app-server-session.test.js server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/event-stream/runtime.test.js` -> exit 0, 5 files and 67/67 tests passed. |
| Process fixture | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 1 after 36.58s; 3/5 passed and 2/5 failed. The deterministic Codex-executed command changed `fixture.txt` and fixture-local Git diff, but `completed.diff` was `[]`. The independently isolated abort/concurrency scenario returned HTTP 409. No retry was run. |
| Static checks | Not run. The process fixture failed, and the corrective instructions required an immediate stop before type-check/lint/checks. |
| Cleanup/process | Every `afterEach` called fixture cleanup and asserted `{browserSubscribers:0,listenerOpen:false,relayStreams:0,residualProcesses:0,temporaryRootExists:false}`. A post-run `[c]odex app-server` and `/tmp/openchamber-codex-wu12-*` check exited 0 with no output. |
| Corrective authored/generated | 26 authored changed lines: 20 additions and 6 deletions across the integration test and fixture; 0 generated lines. |
| Cumulative WU12R authored/generated | 183 authored changed lines: 171 additions and 12 deletions across six candidate paths; 0 generated lines; within 800. |
| Candidate revision | `sha256:9fcf4779aa09ed53c00de447d0e14ffb0b3f0b676a2bce6e65767419f3119626`, sorted candidate path + NUL + bytes + NUL. |
| Rollback boundary | Corrective-only rollback reverts per-test lifecycle/prompt changes in `codex-engine.integration.test.js` and the isolated helper-command setup in `codex-engine.integration-fixture.js`. Full WU12R rollback additionally reverts prior focused deltas in translator/runtime production and tests. |

### Corrective Diagnosis and Scope

- The edit was nondeterministic because the fixture depended on natural-language tool selection and model-authored patch generation. The corrected fixture commits an executable helper in each isolated repository and requires Codex to execute that exact command; the fixture never invokes it or mutates `fixture.txt` after baseline setup.
- Scenario isolation is effective: each test receives a fresh server, runtime, binding store, two temporary Git roots, relay, and subscriber set; `afterEach` proves deterministic zero-resource cleanup even after assertion failure. Later restart/read and cleanup tests passed instead of inheriting the first failure.
- The deterministic edit exposed that command-driven filesystem/Git changes still do not populate production `session.diff`; no qualifying diff notification reached the existing translator path. The abort/isolation scenario also has a remaining scenario-local HTTP 409 whose public body was not emitted by the test output.
- This evidence **does not remediate** failed evidence `sha256:5aba889c2a9203dbc73554c714b056a6414f9c12926d103953078c288ad3cc5a` because the required 5/5 process acceptance was not achieved.
- Parent-owned token `sha256:a5593f1864144777b6ab8b7169c9b02dba724ca9211bc86db0902685146181fe` was not acquired, settled, reset, or mutated.
- WU12R, WU12, and WU13 remain unchecked. No repository Git/GitHub command, commit, dependency, generated output, UI, OpenCode, other-runtime, `bun.lock`, or `.codegraph/` edit occurred.

### Corrective Workload / PR Boundary

- Mode: one maintainer-authorized corrective retry inside the WU12R `auto-chain`, `feature-branch-chain` slice.
- Boundary: starts from failed candidate `sha256:5aba889c2a9203dbc73554c714b056a6414f9c12926d103953078c288ad3cc5a` and stops at the single failed corrective process run before static checks, WU12 retry, or WU13.
- Review budget: cumulative 183/800 authored changed lines; 0 generated; no exception.

## WU12R Authorized Bounded Diagnostic / Correction Unit

### Diagnostic Evidence

- The isolated edit RED ran a real Codex process after test-first bounded instrumentation. Its safe trace recorded `thread/start`, `turn/start`, `turn/started`, two completed `commandExecution` items, approval requests/resolutions, agent text, and `turn/completed`. It recorded no `fileChange` item and no `turn/diff/updated` notification. The real file and fixture-local Git diff changed while projected diff remained empty.
- The isolated abort RED recorded `turn/interrupt` and terminal completion. The HTTP 409 occurred later on relayed `POST /api/codex/sessions`, with public code `write-conflict`; it was not produced by `POST /api/codex/sessions/:id/abort`.
- The fixture now retains only bounded method/type/status/count diagnostics (maximum 256 records), never raw stderr, prompts, command output, credentials, payloads, thread/session IDs, or absolute paths.

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12R bounded diagnostic/correction | Runtime unit + isolated/full real-process fixture | Unit + process integration | Existing translator/runtime passed 31/31 | Terminal snapshot tests failed 2/2; isolated edit failed with real edit and empty projection; isolated abort failed with safe `session.create`/`write-conflict` 409 evidence | Runtime terminal success/failure tests passed 2/2; focused suite passed 33/33; safety passed 69/69 | Success and explicit diff-read failure paths; native-diff absence and binding-create conflict were independently reproduced | Final full process acceptance FAILED at 4/5, so WU12R remains incomplete |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Safety net | `bun run --cwd packages/web test -- server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js` -> exit 0, 2 files and 31/31 tests passed before edits. |
| Edit diagnostic RED | `CODEX_WU12_DIAGNOSTICS=1 bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js -t "projects command, tool, file edit, diff, approve-once, and reject outcomes"` -> exit 1, 1 failed/4 skipped after 17.96s; real file/Git edit succeeded, projection diff remained empty, and the safe trace contained no file/diff event. |
| Abort diagnostic RED | `CODEX_WU12_DIAGNOSTICS=1 bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js -t "aborts truthfully and isolates concurrent sessions, threads, and workspaces"` -> exit 1, 1 failed/4 skipped after 10.45s; safe cause was `session.create`, relay, HTTP 409, code `write-conflict`. |
| Focused RED | `bun run --cwd packages/web test -- server/lib/codex/runtime.test.js -t "terminal working-tree snapshot"` -> exit 1, 2 failed/26 skipped: reader called zero times and read failure incorrectly published idle success. |
| Focused GREEN | Same focused command -> exit 0, 2 passed/26 skipped. Final translator/runtime command -> exit 0, 2 files and 33/33 tests passed. |
| Safety suite | Five Codex/event-stream files -> exit 0, 5 files and 69/69 tests passed. |
| Final full process | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 1 after 51.74s; 4/5 passed. File/diff and abort behavior passed. The sole failure expected cross-workspace read status 409 but received authoritative binding-not-found status 404. No retry ran. |
| Static checks | Not run because final process acceptance failed and the scope required an immediate stop. |
| Cleanup | Every process test `afterEach` asserted zero subscribers, closed listener, zero relay streams/processes, and removed roots. Post-run bounded process/root check exited 0 with no output. |
| Candidate paths | `codex-engine.integration-fixture.js`, `codex-engine.integration.test.js`, `event-translator.js`, `event-translator.test.js`, `runtime.js`, `runtime.test.js`. |
| Candidate lines | Current candidate files: 421, 216, 173, 121, 976, and 690 lines respectively (2,597 total). This unit authored `+224/-28 = 252` changed lines; cumulative WU12R is 435/800 authored, 0 generated. |
| Candidate revision | `sha256:78b1af73841993498d35d14a730c5963519e723da403d55b88f217d5639faab3`, sorted candidate path + NUL + bytes + NUL. |
| Rollback boundary | Revert this unit's bounded diagnostics and sequential fixture session creation, terminal working-tree snapshot/failure lifecycle, parser export, and new runtime tests in the six candidate paths. Preserve prior WU12R bytes, UI, OpenCode, other runtimes, tasks, `bun.lock`, `.codegraph/`, and unrelated changes. |

### Correction Semantics and Result

- `CodexRuntime.publishEntry` remains the sole revision authority. When a native diff event exists, it stays authoritative. When none exists at `turn/completed`, runtime performs exactly one terminal working-tree snapshot, combines any resulting diff with terminal changes in one revision, and never polls.
- The fallback includes unstaged, staged, and bounded untracked changes; it caps untracked files at 512 and projected patch bytes at 8 MiB. Read/limit failure publishes explicit `failed` status plus sanitized `diff-read-failed` snapshot failure instead of idle/empty success.
- Terminal publication checks current entry, ready state, abort ownership, and active turn identity after the asynchronous read. Stale/disposed/aborted completions do not publish. Active ownership remains until terminal publication, preserving ordering and preventing a new turn from overtaking the snapshot.
- Fixture session creation is sequential only at binding creation; the required independent turns still start concurrently. This removes the evidence-proven store lock conflict without weakening concurrent turn/session isolation.
- The candidate does **not** remediate failed evidence `sha256:9fcf4779aa09ed53c00de447d0e14ffb0b3f0b676a2bce6e65767419f3119626` because final process acceptance was 4/5 rather than 5/5.
- Parent-owned native token `sha256:64b7b1a61e925bc2a1d6a23e05e3e55025462a766c6d13fd39a9fbcc16face3f` was not acquired, settled, reset, or mutated. No native attempt, repository Git/GitHub, commit, dependency, generated-output, `bun.lock`, or `.codegraph/` command/edit occurred.

### Workload / PR Boundary

- Mode: `auto-chain`, `feature-branch-chain`; current autonomous slice remains WU12R only.
- Boundary: starts from failed evidence `sha256:9fcf4779aa09ed53c00de447d0e14ffb0b3f0b676a2bce6e65767419f3119626` and stops at the failed single final full process run before static checks, WU12, or WU13.
- Review budget: cumulative 435/800 authored changed lines, 0 generated; no exception.

## WU12R Maintainer-Authorized Final Closure

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12R final isolation expectation | `codex-engine.integration.test.js` plus cumulative focused/safety suites | Process integration + regression | Previous focused 33/33 and safety 69/69 passed; final full process RED was 4/5 | Existing exact RED: cross-workspace lookup returned authoritative 404 while the fixture expected obsolete 409 | One-line expectation correction; focused 33/33, safety 69/69, and full process 5/5 passed | No-leak assertions remained: primary/secondary text stayed isolated and a primary session read through the secondary workspace rejected | No production refactor; only the evidence-backed status expectation changed |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused regression | `bun run --cwd packages/web test -- server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js` -> exit 0, 2 files and 33/33 tests passed. |
| Safety suite | `bun run --cwd packages/web test -- server/lib/codex/app-server-session.test.js server/lib/codex/event-translator.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/event-stream/runtime.test.js` -> exit 0, 5 files and 69/69 tests passed. |
| Full process fixture | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 0 after 48.81s, 1 file and 5/5 tests passed. |
| Syntax | `node --check` on all six WU12R candidate JS files -> exit 0, no output. |
| Type check | `bun run --cwd packages/web type-check` -> exit 0, `tsc --noEmit`. |
| Lint | `bun run --cwd packages/web lint` -> exit 0, no diagnostics. |
| Dead code | `bun run dead-code` -> exit 0; unchanged non-blocking baseline: 206 unused exports, 156 unused exported types, and 1 duplicate export. No WU12R candidate was newly reported. |
| Cleanup | Every process scenario `afterEach` asserted `{browserSubscribers:0,listenerOpen:false,relayStreams:0,residualProcesses:0,temporaryRootExists:false}`. Post-run bounded process/root check exited 0 with no output. |
| Closure change | Only `codex-engine.integration.test.js`: `+1/-1 = 2` authored changed lines, changing expected cross-workspace status 409 to 404. No production behavior changed. |
| Candidate paths | `codex-engine.integration-fixture.js`, `codex-engine.integration.test.js`, `event-translator.js`, `event-translator.test.js`, `runtime.js`, `runtime.test.js`. |
| Candidate lines | 421, 216, 173, 121, 976, and 690 lines respectively; 2,597 total. Cumulative WU12R is 437/800 authored changed lines, 0 generated. |
| Candidate revision | `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`, sorted candidate path + NUL + bytes + NUL. |
| Rollback boundary | Revert only the one-line 404 expectation to return to failed revision `sha256:78b1af73841993498d35d14a730c5963519e723da403d55b88f217d5639faab3`. Production, prior tests/fixture diagnostics, UI, OpenCode, other runtimes, `bun.lock`, `.codegraph/`, and unrelated work remain unchanged. |

### Closure Result

- The cross-workspace assertion remains semantic, not weaker: both concurrent sessions retain only their own projected text, and looking up the primary session under the secondary workspace remains rejected. HTTP 404 is authoritative because scoped binding lookup finds no record in that workspace; the previous 409 described the eliminated concurrent binding-write conflict.
- New passing evidence `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37` explicitly remediates failed evidence `sha256:78b1af73841993498d35d14a730c5963519e723da403d55b88f217d5639faab3`.
- Parent-owned token `sha256:4955227d200c58933dbf382fdee94a9472ee966fb5fb2f702d5d6ba839018e42` was not acquired, settled, reset, or mutated. No native attempt, repository Git/GitHub, commit, dependency, generated-output, `bun.lock`, or `.codegraph/` command/edit occurred.

### Workload / PR Boundary

- Mode: `auto-chain`, `feature-branch-chain`; WU12R is now an autonomous completed slice.
- Boundary: starts from failed evidence `sha256:78b1af73841993498d35d14a730c5963519e723da403d55b88f217d5639faab3` and ends at passing evidence `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37` before WU12.
- Review budget: cumulative 437/800 authored changed lines, 0 generated; no exception.

## WU12 Independent Post-WU12R Process Acceptance

### Scenario Matrix

| Scenario | Outcome | Evidence |
|---|---|---|
| Conversation and streaming | PASS | A real direct Codex turn streamed `WU12_STREAM_COMPLETE`, settled idle with no active turn, and remained readable through the authoritative projection. |
| Reconnect through direct and relay transport | PASS | Browser subscription detached without cancelling work; relayed snapshot and direct replay returned the same authoritative revision and text. |
| Deterministic real file/Git diff, projected diff, and approvals | PASS | Codex executed the fixture-owned command, changed `fixture.txt`, fixture-local Git reported `WU12_EDIT`, production projected the file patch, duplicate approve-once converged, and pending approvals cleared. |
| Reject and abort | PASS | Reject created no probe and left no active tools; concurrent direct/relay abort converged, cleared active turn and approvals, and terminalized active tools. |
| Restart/read and OpenCode/workspace isolation | PASS | Completed-thread recovery was recovered or explicitly limited, the resumed turn retained thread identity, OpenCode fallback remained zero, sensitive persistence remained absent, concurrent workspaces retained isolated text, and cross-workspace lookup rejected with authoritative 404. |

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12 retry acceptance | `codex-engine.integration.test.js`, `codex-engine.integration-fixture.js` | Process integration | WU12R complete/passed at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`; source/test bytes unchanged | Preserved prior WU12 and WU12R RED history; this unit was acceptance-only and authored no new test | Exact full process command ran once and passed 5/5 | Five independent fixtures covered the complete required matrix and zero-resource cleanup | N/A — no production/test change or refactor was authorized |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test command | `bun run --cwd packages/web test -- server/lib/codex/codex-engine.integration.test.js` -> exit 0; Vitest 4.1.5, 1/1 file and 5/5 tests passed, duration 52.30s with 51.93s test time. The command ran exactly once. |
| Runtime harness | Same exact command exercised real Codex app-server processes, authenticated direct HTTP, relay-host HTTP, browser reconnect, isolated fixture Git repositories, approvals, reject, abort, completed restart/read, concurrent workspace isolation, and archival/cleanup. Outcome: 5/5 passed. |
| Per-scenario cleanup | Every `afterEach` passed the exact resource assertion `{browserSubscribers:0,listenerOpen:false,relayStreams:0,residualProcesses:0,temporaryRootExists:false}`. Because all 5 tests passed, all five cleanup assertions passed. |
| Final process/root cleanup | Post-run bounded check returned `{"codexProcesses":[],"temporaryRoots":[]}`. The final fixture scenario independently performed explicit cleanup and asserted the same five zero-resource fields before `afterEach` repeated the assertion. |
| Scenario count | 5 required scenarios, 5 passed, 0 failed, 0 skipped. |
| WU12R prerequisite | Confirmed complete/passed and unchanged at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`; no WU12R production or test bytes were altered. |
| Fixture candidate paths | `packages/web/server/lib/codex/codex-engine.integration-fixture.js` (421 lines) and `packages/web/server/lib/codex/codex-engine.integration.test.js` (216 lines), 637 total. |
| Fixture candidate revision | `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`, computed over the two sorted fixture paths with `path + NUL + bytes + NUL` framing. |
| Artifact-only changes | OpenSpec `tasks.md` `+4/-5 = 9`, `apply-progress.md` `+59/-16 = 75`, total `+63/-21 = 84` changed lines; 0 production/test/generated lines changed. |
| Native/process authority | Parent-owned token `sha256:1cb7612ca66e865439458918bbf034a4b0ea91310f51962c0a92c357a3da42db` was not acquired, settled, reset, or mutated; no native attempt command ran. |
| Rollback boundary | Revert only the WU12 checkbox/result-contract updates and this appended acceptance evidence in OpenSpec and Engram. Production and tests, WU12R, WU13, fixture-local Git repositories, `bun.lock`, `.codegraph/`, and unrelated work remain unchanged. |

### Acceptance Result

- WU12 is complete for independent post-WU12R process acceptance; this is not another production implementation unit.
- Repository Git/GitHub, commits, dependencies, generated output, native attempt commands, production/test edits, `bun.lock`, and `.codegraph/` were not used or changed. Fixture Git ran only inside the isolated temporary roots created by the accepted harness.
- Delivery remains `auto-chain` with `feature-branch-chain`; this autonomous acceptance boundary starts from accepted WU12R and ends with WU12 5/5 process evidence before WU13.
- WU13 remains unchecked and is the next recommended apply unit.

## WU13 Final Regression / Release Check Attempt

### Result

- Status: **PARTIAL / STOPPED**.
- WU13 remains unchecked in both task stores.
- Parent-owned token `sha256:1b5bb0e9cb47dd28888005e523cc61c980c1918996572baaf13b5e5778ed4d93` was not acquired, settled, reset, or mutated.
- Parent-confirmed WU12 native settlement is recorded as complete/passed at evidence `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`.

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU13 | Final regression/release checks | Verification-only regression gate | WU12 parent settlement complete/passed at `sha256:22e4...`; no source/test bytes changed | N/A — WU13 adds no behavior or tests; it validates preserved RED/GREEN evidence | NOT REACHED — the first cleanup preflight exited 1 | NOT RUN — stop-on-first-failure contract | NOT RUN — check-only scope |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| First cleanup preflight | `if pgrep -af '[c]odex app-server'; then exit 1; fi; shopt -s nullglob; roots=(/tmp/openchamber-codex-wu12-* /tmp/openchamber-codex-schema-* /tmp/opencode/codex-wu12r-schema); if ((${#roots[@]})); then printf '%s\\n' "${roots[@]}"; exit 1; fi; printf '{"codexProcesses":[],"temporaryRoots":[]}\\n'` -> exit 1; output: `/tmp/opencode/codex-wu12r-schema`. |
| Immediate read-back | Read-only inspection of `/tmp/opencode/codex-wu12r-schema` returned `File not found`; no cleanup command was run. The failed preflight was not retried. |
| Focused tests | NOT RUN — required stop immediately after the first failed check. |
| Runtime harness | NOT RUN — WU12 already passed independently and the prompt prohibited rerunning the Codex process fixture unless tasks explicitly required it. |
| Syntax/type/lint/generated/dead-code | NOT RUN — required stop immediately after the first failed check. |
| Rollback boundary | Revert only this WU13 partial-attempt section and the WU13 result-contract/status updates in both stores. Preserve WU0-WU12R/WU12 evidence, production/tests/generated files, `bun.lock`, `.codegraph/`, and unrelated work. |

### Checks Not Run

- Focused Web OpenCode regression suites.
- Focused UI OpenCode and Codex contract regression suites.
- Distinct non-process Codex final regression suites.
- `node --check` for changed server/scripts JavaScript.
- UI and Web type-check and lint.
- Generated protocol `--check` and export validation.
- `bun run dead-code` and baseline attribution.
- Final cleanup recheck.

### Scope and Line Accounting

- Production/test/generated changes: 0 lines.
- OpenSpec artifact delta: `tasks.md` `+5/-5 = 10`, `apply-progress.md` `+69/-17 = 86`, total `+74/-22 = 96` changed lines; final file lengths are 54 and 1,051 lines respectively. Engram task/apply-progress metadata was updated in place; no evidence-backed source correction was attempted.
- No repository Git/GitHub, commit, dependency, formatter, source normalizer, native attempt, or Codex process-fixture command ran.
- No cleanup mutation was performed; the reported root disappeared before immediate read-back.

### Workload / PR Boundary

- Mode: `auto-chain`, `feature-branch-chain`; autonomous WU13 check slice.
- Boundary: starts from parent-confirmed complete/passed WU12 and stops at WU13's first cleanup preflight before any release suite.
- Review budget: artifact-only metadata; 0 production/test/generated changed lines; no size exception.

## WU13 Maintainer-Authorized Cleanup Retry

### Result

- Status: **BLOCKED / STOPPED**.
- The single authorized retry was consumed at the cleanup preflight; WU13 remains unchecked in both task stores.
- Parent-owned token `sha256:68e577c4d138c026a08bfe5a589199cd146c5f979c5bfe3b29f253f2da09ee54` was not acquired, settled, reset, or mutated.
- Failed cleanup evidence `sha256:680246101b8811a69c0f5d48a3553ba5f22f98021e1548984941bdaa1b93589a` is **not remediated** because the authorized retry did not pass its cleanup gate.

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Authorized cleanup retry | `if pgrep -af '[c]odex app-server'; then exit 1; fi; shopt -s nullglob; roots=(/tmp/openchamber-codex-wu12-* /tmp/openchamber-codex-schema-* /tmp/opencode/codex-wu12r-schema); if ((${#roots[@]})); then printf '%s\\n' "${roots[@]}"; exit 1; fi; printf '{"codexProcesses":[],"temporaryRoots":[]}\\n'` -> exit 1; output: `/tmp/opencode/codex-wu12r-schema`. The command ran exactly once for this authorized retry. |
| Focused tests | NOT RUN — required stop immediately after the failed cleanup retry. |
| Runtime harness | NOT RUN — WU12 process evidence remains accepted and rerun was prohibited. |
| Syntax/type/lint/generated/dead-code | NOT RUN — required stop immediately after the failed cleanup retry. |
| Final cleanup | NOT RUN — execution never passed the initial cleanup gate. |
| Cleanup mutation | None — the residual root was not deleted, altered, or retried. |
| Rollback boundary | Revert only this authorized-retry section and its result-contract/status updates in both stores. Preserve all prior WU0-WU12R/WU12 and first-attempt evidence, production/tests/generated files, `bun.lock`, `.codegraph/`, and unrelated work. |

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU13 authorized retry | Cleanup-gated final regression/release checks | Verification-only regression gate | Parent-confirmed WU12 complete/passed at `sha256:22e4...`; no source/test bytes changed | N/A — WU13 adds no behavior/tests | NOT REACHED — authorized cleanup retry exited 1 | NOT RUN — stop-on-first-failure | NOT RUN — check-only scope |

### Scope / Workload Boundary

- Production/test/generated changes: 0 lines. This retry's OpenSpec artifact delta is `tasks.md` `+4/-4 = 8`, `apply-progress.md` `+47/-16 = 63`, total `+51/-20 = 71` changed lines; final file lengths are 54 and 1,082 lines respectively. Engram records were updated in place.
- No source/test/generated modification, cleanup deletion, formatter, dependency, process fixture, repository Git/GitHub, commit, native attempt, or `.codegraph/` command ran.
- Mode remains `auto-chain`, `feature-branch-chain`; this retry stops before WU13 release validation and cannot route to `sdd-verify`.

## WU13 Parent-Cleanup Topology Attempt

### Result

- Status: **PARTIAL / STOPPED**.
- Parent-owned PRE-CLEANUP evidence passed before dispatch; this worker ran no cleanup command and claims no process cleanup.
- Parent-owned token `sha256:4b8df1ee3a647fe9a3211baf542f6cb8a95bba8bd98563d50e66039e5bca6850` was not acquired, settled, reset, or mutated.
- WU13 remains unchecked in both task stores; parent POST-CLEANUP and native settlement remain pending.

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused Web OpenCode regressions | `bun run --cwd packages/web test -- server/lib/opencode/proxy.test.js server/opencode-proxy.test.js server/lib/opencode/core-routes.test.js server/lib/opencode/startup-pipeline-runtime.test.js server/lib/opencode/shutdown-runtime.test.js server/lib/event-stream/upstream-reader.test.js server/lib/event-stream/global-hub.test.js server/lib/event-stream/rebind.test.js server/lib/event-stream/protocol.test.js server/lib/event-stream/runtime.test.js server/lib/realtime-proxy.test.js server/lib/relay/tunnel-host.test.js server/lib/ui-auth/ui-auth.test.js` -> exit 0; Vitest 4.1.5, 13/13 files and 105/105 tests passed in 1.51s. One Node `DEP0205` deprecation warning. |
| Focused Codex regressions | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js server/lib/codex/binding-store.test.js server/lib/codex/app-server-session.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/codex/event-translator.test.js` -> exit 0; Vitest 4.1.5, 6/6 files and 79/79 tests passed in 483ms. One Node `DEP0205` deprecation warning. WU12 process fixture was excluded. |
| Focused UI aggregate | `bun test packages/ui/src/lib/opencode/client.test.ts packages/ui/src/lib/opencode/client.permission.test.ts packages/ui/src/sync/session-actions.test.ts packages/ui/src/sync/session-ui-store.test.js packages/ui/src/components/chat/PermissionCard.test.ts packages/ui/src/types/execution-target.test.ts packages/ui/src/sync/selection-store.test.ts packages/ui/src/lib/codex/client.test.ts packages/ui/src/sync/codex-execution-routing.test.ts packages/ui/src/sync/bootstrap.test.ts packages/ui/src/sync/session-message-loader.test.ts packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-pipeline.test.js packages/ui/src/sync/__tests__/event-reducer.test.ts packages/ui/src/sync/__tests__/event-reducer.test.js` -> exit 1; 176 passed, 31 failed, 2 errors, 575 assertions across 15 files in 34.85s. Full output: `/home/eliezer/.local/share/opencode/tool-output/tool_00c0a2d4a001X2xKXzklJ59eP1`. |
| UI failure signatures | `useSessionUIStore.setState is not a function`; Codex client mocks observed zero calls/stale canned responses; `getRuntimeUrlResolver().websocket is not a function`; event-pipeline timeouts and empty deliveries; unhandled `applyDefaultModelAgentSelection is not a function`. These are cross-file mock/state interference signatures, but no rerun was allowed to establish attribution. |
| Later checks | NOT RUN — stop immediately after the first failed check. This includes `node --check`, UI/Web type-check and lint, generated protocol/export/manifest validation, and `bun run dead-code`. |
| Cleanup | Worker cleanup checks were explicitly prohibited. Parent owns PRE/POST-CLEANUP; POST-CLEANUP had not run when this worker returned. |
| Rollback boundary | Revert only this parent-topology attempt and its result-contract/status updates in both stores. Preserve all prior WU0-WU12R/WU12/WU13 cleanup-attempt evidence, production/tests/generated files, `bun.lock`, `.codegraph/`, and unrelated work. |

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU13 parent-cleanup topology | Final regression/release checks | Verification-only | Parent PRE-CLEANUP passed; Web OpenCode 105/105 and Codex 79/79 passed | N/A — WU13 adds no behavior/tests | FAILED — UI aggregate 176 pass/31 fail/2 errors | NOT RUN — stop-on-first-failure | NOT RUN — check-only scope |

### Scope / Workload Boundary

- Production/test/generated changes: 0 lines. This attempt's OpenSpec artifact delta is `tasks.md` `+4/-4 = 8`, `apply-progress.md` `+48/-14 = 62`, total `+52/-18 = 70` changed lines; final file lengths are 54 and 1,116 lines respectively. Engram records were updated in place.
- Candidate revision: N/A — the WU13 check set did not pass and no source/generated candidate changed.
- Dead-code attribution: unavailable because `bun run dead-code` was not reached; historical `206/156/1` baseline is not claimed as current evidence.
- No cleanup command, source/test/generated modification, formatter, dependency, process fixture, repository Git/GitHub, commit, native attempt, `bun.lock`, or `.codegraph/` command ran.
- Mode remains `auto-chain`, `feature-branch-chain`; WU13 cannot route to `sdd-verify`.

## WU13 Isolated UI Closure Attempt

### Result

- Status: **BLOCKED / STOPPED**.
- Preserved unchanged-candidate evidence: Web OpenCode 13 files / 105/105 tests and Codex 6 files / 79/79 tests passed; neither suite was rerun.
- Parent PRE-CLEANUP passed before dispatch. This worker ran no cleanup command and claims no process cleanup; parent POST-CLEANUP/native settlement remain pending.
- Parent-owned token `sha256:232e1cba62706b367ac109260b24692d030217e22621a6df3456d1b1c317e1b7` was not acquired, settled, reset, or mutated.
- Evidence `sha256:5320534c972f73242c5bf98f335205836ec119e5c35b013ee442c5e40c999533` is **not remediated** because isolated UI file 3/15 failed.

### Isolated UI Commands

| # | Command | Exact result |
|---|---|---|
| 1 | `bun test packages/ui/src/lib/opencode/client.test.ts` | Exit 0; 6 passed, 0 failed, 22 assertions, 1 file, 36ms. |
| 2 | `bun test packages/ui/src/lib/opencode/client.permission.test.ts` | Exit 0; 4 passed, 0 failed, 6 assertions, 1 file, 30ms. |
| 3 | `bun test packages/ui/src/sync/session-actions.test.ts` | Exit 1; 0 passed, 61 failed, 1 file, 68ms. Every test failed during module loading with `SyntaxError: Export named 'emitSyncConfigChanged' not found in module '/home/eliezer/openchamber/packages/ui/src/sync/sync-refs.ts'.` |
| 4 | `bun test packages/ui/src/sync/session-ui-store.test.js` | NOT RUN — stop on isolated failure 3. |
| 5 | `bun test packages/ui/src/components/chat/PermissionCard.test.ts` | NOT RUN — stop on isolated failure 3. |
| 6 | `bun test packages/ui/src/types/execution-target.test.ts` | NOT RUN — stop on isolated failure 3. |
| 7 | `bun test packages/ui/src/sync/selection-store.test.ts` | NOT RUN — stop on isolated failure 3. |
| 8 | `bun test packages/ui/src/lib/codex/client.test.ts` | NOT RUN — stop on isolated failure 3. |
| 9 | `bun test packages/ui/src/sync/codex-execution-routing.test.ts` | NOT RUN — stop on isolated failure 3. |
| 10 | `bun test packages/ui/src/sync/bootstrap.test.ts` | NOT RUN — stop on isolated failure 3. |
| 11 | `bun test packages/ui/src/sync/session-message-loader.test.ts` | NOT RUN — stop on isolated failure 3. |
| 12 | `bun test packages/ui/src/sync/event-pipeline.test.ts` | NOT RUN — stop on isolated failure 3. |
| 13 | `bun test packages/ui/src/sync/__tests__/event-pipeline.test.js` | NOT RUN — stop on isolated failure 3. |
| 14 | `bun test packages/ui/src/sync/__tests__/event-reducer.test.ts` | NOT RUN — stop on isolated failure 3. |
| 15 | `bun test packages/ui/src/sync/__tests__/event-reducer.test.js` | NOT RUN — stop on isolated failure 3. |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Isolated UI total reached | Three separate Bun processes: 10 passed and 61 failed across 3 files; 12 files not run. |
| Remaining checks | NOT RUN — `node --check`, UI/Web type-check and lint, generated protocol/export/manifest validation, and `bun run dead-code` were all after the failed UI gate. |
| Cleanup | Worker cleanup checks were explicitly prohibited. Parent owns PRE/POST-CLEANUP; POST-CLEANUP had not run at return. |
| Rollback boundary | Revert only this isolated-closure attempt and its result-contract/status updates in both stores. Preserve all prior WU0-WU12R/WU12/WU13 evidence, production/tests/generated files, `bun.lock`, `.codegraph/`, and unrelated work. |

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU13 isolated UI closure | Fifteen separate UI regression processes | Verification-only | Preserved Web OpenCode 105/105 and Codex 79/79 | N/A — WU13 adds no behavior/tests | FAILED — file 3/15 failed 61/61 at module load | NOT RUN — stop-on-first-failure | NOT RUN — check-only scope |

### Scope / Workload Boundary

- Production/test/generated changes: 0 lines. This closure attempt's OpenSpec artifact delta is `tasks.md` `+4/-4 = 8`, `apply-progress.md` `+66/-13 = 79`, total `+70/-17 = 87` changed lines; final file lengths are 54 and 1,169 lines respectively. Engram records were updated in place.
- Candidate revision: N/A — the WU13 check set did not pass and no source/generated candidate changed.
- Dead-code attribution: unavailable because `bun run dead-code` was not reached; historical `206/156/1` baseline is not claimed as current evidence.
- No cleanup command, source inspection/edit, formatter, dependency, WU12 fixture, repository Git/GitHub, commit, native attempt, `bun.lock`, or `.codegraph/` command ran.
- This historical isolated attempt left WU13 unchecked; the authorized test-mock correction below resolves this worker boundary.

## WU13 Test-Mock Correction and Worker Closure

### Result

- Status: **SUCCESS / WORKER CHECKS PASSED**.
- Test-only correction: added `emitSyncConfigChanged: () => {}` to the stale `mock.module("./sync-refs", ...)` in `packages/ui/src/sync/session-actions.test.ts`. This mirrors the real named export without changing production behavior or weakening assertions.
- Parent PRE-CLEANUP and prior parent cleanup stability are accepted inputs. This worker ran no cleanup command and claims no process cleanup; final acceptance remains conditional on parent POST-CLEANUP/native settlement.
- Parent-owned token `sha256:409e014772306e31bebd2d0555d2f1fc77a85707c1e226d2e08c26601052f516` was not acquired, settled, reset, or mutated.
- Passing candidate `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d` remediates failed evidence `sha256:67537102bc7841bf5e7d4d37a861414ca77903a9f48b00e818ac53829e0906e4` for the worker check boundary.

### TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU13 stale sync-refs test mock | `session-actions.test.ts` | Test-contract correction | Preserved Web OpenCode 105/105, Codex 79/79, UI files 1–2 10/10 | Existing isolated command failed 0/61 at module load: missing `emitSyncConfigChanged` export | One-line faithful no-op mock; isolated command passed 61/61 with 249 assertions | Remaining isolated UI files passed; all 15 files total 207/207 with 644 assertions | No further refactor; one test-only line retained |

### Isolated UI Commands

| # | Command | Exact result |
|---|---|---|
| 1 | `bun test packages/ui/src/lib/opencode/client.test.ts` | Preserved unchanged evidence: exit 0; 6/6, 22 assertions, 36ms. |
| 2 | `bun test packages/ui/src/lib/opencode/client.permission.test.ts` | Preserved unchanged evidence: exit 0; 4/4, 6 assertions, 30ms. |
| 3 | `bun test packages/ui/src/sync/session-actions.test.ts` | Exit 0; 61/61, 249 assertions, 836ms; expected failure-path logs only. |
| 4 | `bun test packages/ui/src/sync/session-ui-store.test.js` | Exit 0; 29/29, 76 assertions, 136ms; expected invalid-URL and failure-path logs only. |
| 5 | `bun test packages/ui/src/components/chat/PermissionCard.test.ts` | Exit 0; 4/4, 4 assertions, 33ms. |
| 6 | `bun test packages/ui/src/types/execution-target.test.ts` | Exit 0; 3/3, 8 assertions, 30ms. |
| 7 | `bun test packages/ui/src/sync/selection-store.test.ts` | Exit 0; 2/2, 6 assertions, 38ms. |
| 8 | `bun test packages/ui/src/lib/codex/client.test.ts` | Exit 0; 6/6, 16 assertions, 30ms. |
| 9 | `bun test packages/ui/src/sync/codex-execution-routing.test.ts` | Exit 0; 4/4, 9 assertions, 123ms. |
| 10 | `bun test packages/ui/src/sync/bootstrap.test.ts` | Exit 0; 5/5, 14 assertions, 41ms; expected unavailable-path log only. |
| 11 | `bun test packages/ui/src/sync/session-message-loader.test.ts` | Exit 0; 28/28, 89 assertions, 1083ms. |
| 12 | `bun test packages/ui/src/sync/event-pipeline.test.ts` | Exit 0; 8/8, 16 assertions, 73ms. |
| 13 | `bun test packages/ui/src/sync/__tests__/event-pipeline.test.js` | Exit 0; 22/22, 62 assertions, 1250ms. |
| 14 | `bun test packages/ui/src/sync/__tests__/event-reducer.test.ts` | Exit 0; 20/20, 60 assertions, 40ms. |
| 15 | `bun test packages/ui/src/sync/__tests__/event-reducer.test.js` | Exit 0; 5/5, 7 assertions, 33ms. |

### Final Worker Checks

| Check | Exact result |
|---|---|
| Preserved Web OpenCode | Unchanged candidate: 13/13 files, 105/105 tests passed; not rerun. |
| Preserved Codex | Unchanged candidate: 6/6 files, 79/79 tests passed; not rerun; WU12 fixture excluded. |
| Isolated UI total | 15/15 files, 207/207 tests, 644 assertions passed. |
| JavaScript syntax | `node --check` loop over 23 applicable changed JS/MJS files -> exit 0; `node --check: PASS (23 files)`. |
| UI type-check | `bun run --cwd packages/ui type-check` -> exit 0; `tsc --noEmit`. |
| UI lint | `bun run --cwd packages/ui lint` -> exit 0; no diagnostics. |
| Web type-check | `bun run --cwd packages/web type-check` -> exit 0; `tsc --noEmit`. |
| Web lint | `bun run --cwd packages/web lint` -> exit 0; no diagnostics. |
| Protocol generation | `node scripts/generate-codex-protocol.mjs --check` -> exit 0; `Codex protocol generation check: PASS`. |
| Export/manifest validation | Inline Node validation -> exit 0; exports `CODEX_PROTOCOL`, `CodexProtocolError`, `parseCodexProtocolMessage`; counts 133 client requests, 11 server requests, 70 notifications; output hashes and protocol identity matched manifest. |
| Dead code | `bun run dead-code` -> exit 0 (`--no-exit-code`); current baseline 206 unused exports, 156 unused exported types, 1 duplicate export. The WU13 test candidate was not reported; counts match the preserved baseline, so all findings are pre-existing/unrelated to this correction. |
| Cleanup | No worker cleanup checks by instruction. Parent owns POST-CLEANUP/native settlement. |
| Rollback boundary | Remove only the one-line `emitSyncConfigChanged` test mock and revert this closure's task/result metadata in both stores. Preserve production/generated files, all prior WU0-WU12R/WU12/WU13 evidence, `bun.lock`, `.codegraph/`, and unrelated work. |

### Scope / Workload Boundary

- Test-only candidate path: `packages/ui/src/sync/session-actions.test.ts`, 1,984 lines after correction, authored `+1/-0 = 1` changed line.
- Candidate revision: `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`, computed as `path + NUL + bytes + NUL` over the single candidate path.
- Production/generated changes: 0 lines. Closure OpenSpec artifact delta: `tasks.md` `+5/-5 = 10`, `apply-progress.md` `+76/-15 = 91`, total `+81/-20 = 101` changed lines; final file lengths are 54 and 1,230 lines respectively. Engram records were updated in place. No formatter, dependency, WU12 fixture, repository Git/GitHub, commit, native attempt, `bun.lock`, or `.codegraph/` command ran.
- Mode remains `auto-chain`, `feature-branch-chain`; WU13 worker scope is complete and routes to `sdd-verify`, conditional on parent POST-CLEANUP/native settlement.
