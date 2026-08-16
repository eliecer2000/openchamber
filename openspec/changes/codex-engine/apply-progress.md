# Apply Progress: Codex Engine MVP

## Phase Result Contract

```yaml
status: success
executive_summary: >-
  Preserved WU0-WU9 and completed Slice 9 / WU10 with a Web-only execution
  target discriminant, authoritative capability gating, isolated Codex session
  creation and prompt routing, and unchanged OpenCode provider/model/SDK
  behavior. Focused execution-target, selection, Codex client, routing,
  session-store, and session-action tests passed with UI/Web static checks,
  baseline dead-code results, an authenticated loopback runtime harness, and
  zero residual Codex processes. Implementation acceptance and authoritative
  native settlement completed and passed at evidence revision SHA-256
  7f3f8ec157c48f79630431f7ad31e5043140c1f11b73ee31ac481de0c4793860;
  the accepted harness was reused.
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
  - packages/ui/src/sync/event-pipeline.ts
  - packages/ui/src/sync/event-pipeline.test.ts
  - packages/ui/src/sync/event-reducer.ts
  - packages/ui/src/sync/__tests__/event-reducer.test.ts
  - packages/ui/src/sync/DOCUMENTATION.md
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
next_recommended: sdd-apply Slice 10/WU11
risks: >-
  WU11 reconnect/reconciliation remains intentionally excluded, so browser
  reload convergence is not claimed by this slice. Broader package suites were
  not rerun.
skill_resolution: paths-injected
```

## Status

- Change: `codex-engine`
- Mode: Strict TDD
- Delivery: `auto-chain`, `feature-branch-chain`
- Current slice: Slice 9 / WU10
- Compatibility gate: **PASS**
- Completed: 11 of 14 work units
- Native settlement: **COMPLETE / PASSED** — Slice 9 / WU10 implementation acceptance and authoritative native settlement passed at evidence revision SHA-256 `7f3f8ec157c48f79630431f7ad31e5043140c1f11b73ee31ac481de0c4793860`; the accepted harness was reused.
- Remaining: WU11 reconnect/reconciliation, WU12 process-backed integration, and WU13 final regression/release checks are pending.
- Next permitted work: `sdd-apply Slice 10/WU11`.

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

## Deviations and Issues

- Deviations from design: None. WU10 keeps capability authority on the Web server, routes by explicit execution target, and preserves the OpenCode provider/model/SDK path.
- Issues found: none for WU10 settlement. Browser reload/reconnect convergence and post-reload retry authority remain WU11 by design; broader package suites were not rerun.

## Workload / PR Boundary

- Mode: chained PR slice.
- Chain strategy: feature-branch-chain.
- Current boundary: Slice 9 starts from WU7 server-owned turn dedupe plus WU9 cleanup authority and ends with Web-only execution-target selection, Codex draft/session creation, and isolated prompt routing.
- Chain relationship: feature-branch child Slice 9 targets the immediate Slice 8 branch; no branch or PR was created here.
- Excluded: WU11 reconnect/bootstrap/snapshot reconciliation, WU12 integration fixture, WU13 release checks, all unsupported/native Codex surfaces, and changes to existing OpenCode inference behavior.
- Review budget: approximately 520 authored lines and 0 generated lines, matching the planned autonomous Slice 9 budget and remaining below the hard 800-line limit. WU0-WU9, `bun.lock`, generated protocol files, and unrelated bytes were preserved; `.codegraph/` was not manually edited.
