# Apply Progress: Codex Engine MVP

## Phase Result Contract

```yaml
status: success
executive_summary: >-
  Preserved WU0-WU3 and completed Slice 4 / WU4 with authoritative in-memory
  Codex transcript, status, approval, turn, revision, bounded replay, and
  completed-thread recovery state. Nine WU4 tests, 38 cumulative Codex tests,
  static checks, and a real two-process recovery harness passed; authoritative
  settlement completed for the exact Slice 4 evidence revision with the harness
  disposition invalidated.
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
next_recommended: sdd-apply Slice 5/WU5
risks: >-
  Completed-history reconstruction requires full authoritative turns. Unsupported
  thread/read is represented as a limitation, while incomplete or failed reads
  remain explicit recovery failures. The broader web suite was not rerun.
skill_resolution: paths-injected
```

## Status

- Change: `codex-engine`
- Mode: Strict TDD
- Delivery: `auto-chain`, `feature-branch-chain`
- Current slice: Slice 4 / WU4
- Compatibility gate: **PASS**
- Completed: 5 of 14 work units
- Native settlement: **COMPLETE** — outcome `passed` for evidence revision SHA-256 `97a52340efe65f44b5e17b7e4a966c0f8144490ee23c82cd81effbd616d8e9b2`; authoritative settlement returned `{ "state": "complete" }` with harness disposition `invalidated`.
- Next permitted work: WU5 in Slice 5; WU5 and later work were not implemented here.

## Completed Tasks

- [x] **0.1 WU0 — Hard gate** — Added the process-backed compatibility spike, redacted evidence, and review-facing findings. No `packages/**` file changed.
- [x] **1.1 WU1 — Protocol client** — Added bounded JSONL framing, request correlation, protocol failure handling, authoritative generated method descriptors, deterministic manifests, and focused tests.
- [x] **1.2 WU2 — Durable binding store** — Added canonical scope validation, isolated identities, atomic mode-`0600` persistence, locking, quarantine, conflict handling, and round-trip tests.
- [x] **1.3 WU3 — App-server lifecycle** — Added direct spawn/initialize/control, truthful process failure, bounded shutdown escalation, no-timeout ordinary turns, idle disposal, and idempotent cleanup.
- [x] **2.1 WU4 — Authoritative session memory** — Added canonical server-owned state, monotonic revision, bounded O(1)-write replay, stale-snapshot rejection, explicit failure/limitation states, and authoritative completed-thread recovery.

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

## TDD Cycle Evidence

| Task | Test / check | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 0.1 WU0 | `scripts/codex-app-server-spike.mjs` | Process integration | N/A — new files | `node scripts/codex-app-server-spike.mjs --help` exited 1 with `MODULE_NOT_FOUND` before creation | Help check exited 0 after minimum script creation | Full authenticated spike exited 0 and proved both completed turns, streaming, resume, approval, and interrupt | Extracted repeated completed-streaming-turn flow; `node --check` and the full spike rerun both exited 0 |
| 1.1 WU1 | `packages/web/server/lib/codex/jsonrpc-client.test.js` | Unit + process integration | N/A — all owned implementation files were new | `bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js` exited 1: missing `jsonrpc-client.js`, 0 tests collected | Final GREEN command exited 0 with 12/12 tests after correcting the test harness's late rejection handler | Added complete-frame bound coverage; command exited 0 with 13/13 tests | Simplified generated formatting and removed an unused timeout-error export; regeneration plus 13/13 tests exited 0 |
| 1.2 WU2 | `packages/web/server/lib/codex/binding-store.test.js` | Unit + filesystem integration | N/A — new files | Focused command exited 1: missing `binding-store.js`, 0 tests collected | Minimum store passed 5/5 tests | Added server-isolation and per-record quarantine RED cases; each failed before correction, then final suite passed 7/7 | Tightened record validation; combined refactor command passed 16/16 |
| 1.3 WU3 | `packages/web/server/lib/codex/app-server-session.test.js` | Unit + process integration | N/A — new files | Focused command exited 1: missing `app-server-session.js`, 0 tests collected | Minimum lifecycle passed 7/7 tests | Added spawn-error and connected-idle cases; spawn RED failed 1/9 before correction, then suite passed 9/9 | Removed unused exports/state; combined refactor command passed 16/16 |
| 2.1 WU4 | `packages/web/server/lib/codex/runtime.test.js` | Unit + process integration | `app-server-session.test.js` passed 9/9 before modifying `runtime.js` | Focused command exited 1 with 8/8 tests failing because authority/recovery APIs did not exist | Minimum implementation passed 8/8 tests | Added process-revision and authoritative-empty-read cases; command failed 2/9 before correction, then passed 9/9 | Simplified recovery scope and strengthened malformed-event preservation; combined WU3-WU4 command passed 18/18 |

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

## Deviations and Issues

- Deviations from design: None. Slice 4 implements only server authority/restart memory; routes, event translation, turns, approvals actions, and UI projection remain deferred.
- Issues found: Completed-history recovery must reject empty, partial, or malformed turn history even after a successful resume. Unsupported `thread/read` is represented as a limitation so no missing history is fabricated. The broader web suite was not rerun.

## Workload / PR Boundary

- Mode: chained PR slice.
- Chain strategy: feature-branch-chain.
- Current boundary: Slice 4 starts from WU3 lifecycle ownership and ends with authoritative in-memory state plus completed-thread recovery evidence.
- Chain relationship: feature-branch child Slice 4 targets the immediate Slice 3 branch; no branch or PR was created here.
- Excluded: WU5 routes, WU6 translation, turn endpoints, approval actions, UI projection, OpenCode changes, and all later slices.
- Review budget: 486 authored implementation/test changed lines and 0 generated lines. The autonomous WU4 slice remains below the hard 800-line limit.
