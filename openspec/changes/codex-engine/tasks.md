# Tasks: Codex Engine MVP

Strict TDD applies to every work unit: RED test first, GREEN implementation, REFACTOR, then focused verification. Each row names goal/refs, ownership/files, evidence, lines, dependencies, rollback, commit, and untouched scope. `A/G` = authored/generated lines.

Scope lock: MVP only; no questions, queue, titles, model/effort UX, attachments, Goal, MultiRun, MCP, subagents, native import, quota, or Codex capability in Electron, mobile, hosted-mobile, or VS Code.

## Phase 0: Compatibility Gate

- [x] **0.1 WU0 — Hard gate** — Refs: proposal/spec/design gate; files: `scripts/codex-app-server-spike.mjs`, `docs/codex-app-server-spike.md`, isolated `docs/.codex-app-server-spike/`; RED expected `initialize → thread/start → turn/start → streaming completion → thread/resume → second turn`, approval, interrupt; GREEN process client; verify checkout identity, Codex/Node/Bun versions, TS/JSON schemas, hashes, incompatibilities, and PR #884 assumptions (`lib/harness/{codex-appserver,codex-backend,jsonrpc-subprocess,session-bindings,backends}.js`), with explicit pass/fail and hard stop. ~300/0 A/G; deps none; rollback spike files; commit `test(codex): establish app-server compatibility gate`; untouched `packages/**` until pass.

## Phase 1: Protocol, Identity, Lifecycle

- [x] **1.1 WU1** — Refs spec JSON-RPC; files `packages/web/server/lib/codex/generated/{protocol-descriptor.js,protocol.schema.json,manifest.json}`, `jsonrpc-client.js`, tests; RED fragmented/multiple/malformed JSONL/correlation, GREEN parser/client, verify bounds/unknown IDs; ~450/700–1,200 A/G; dep WU0; rollback protocol files; commit `feat(codex): add protocol client`; untouched OpenCode.
- [x] **1.2 WU2** — Refs durable binding/threat matrix; files `binding-store.js` + tests; RED relative/mismatch/symlink escape, corruption/quarantine/conflict; GREEN atomic `0600` store and `ses_codex_<uuid>` identity; verify round-trip/missing-vs-empty; ~280/0; dep WU1; rollback binding files; commit `feat(codex): add atomic session bindings`; untouched prompts/secrets.
- [x] **1.3 WU3** — Refs process/lifecycle; files `app-server-session.js`, `runtime.js` + tests; RED init/control/shutdown timeout, exit, idle, browser close; GREEN spawn/handshake/escalation; verify no ordinary-turn timeout kill; ~500/0; dep WU1; rollback lifecycle files; commit `feat(codex): own app-server session lifecycle`; untouched OpenCode lifecycle.

## Phase 2: Server Authority and Projection

- [x] **2.1 WU4** — Refs design state authority/restart; `runtime.js` tests; RED stale snapshot/event, restart completed resume/read limitation; GREEN canonical transcript/status/approval/turn/revision/replay store; verify failure ≠ idle/empty; ~420/0; dep WU3; rollback runtime store; commit `feat(codex): add authoritative session memory`; untouched browser storage.
- [ ] **2.2 WU5** — Refs routing/runtime parity; `routes.js`, `index.js`, `feature-routes-runtime.js`, `shutdown-runtime.js` + tests; RED surface spoof, auth/order/OpenCode proxy leakage; GREEN Web-only capability/routes, eligibility freeze, shutdown; verify explicit unsupported runtimes; ~420/0; dep WU4; rollback route wiring; commit `feat(codex): expose authenticated web routes`; untouched Electron/mobile/VS Code capability.
- [ ] **2.3 WU6** — Refs projection/performance; `event-translator.js`, existing `event-pipeline.ts`, `event-reducer.ts` + tests; RED out-of-order/unknown/malformed events; GREEN ordered text/reasoning/tool/command/file/status/error shapes; verify batched O(affected) updates/reference stability; ~480/0; dep WU4; rollback translator/reducer cases; commit `feat(codex): translate app-server events`; untouched OpenCode event semantics.

## Phase 3: Turns, Approvals, Cleanup

- [ ] **3.1 WU7** — Refs prompt/dedupe/single-active-turn; `routes.js`, `runtime.js`, `codex/client.ts` tests; RED duplicate/ambiguous start/concurrent turn; GREEN dedupe ID and `turn/start` ownership; verify returns after start and no duplicate inference; ~360/0; dep WU4–WU6; rollback turn endpoints; commit `feat(codex): enforce turn ownership`; untouched OpenCode prompt path.
- [ ] **3.2 WU8** — Refs approval lifecycle; `runtime.js`, `routes.js`, `PermissionCard.tsx`, permission action tests; RED double reply/reload/auto-accept leakage; GREEN once/reject atomic response and re-projection; verify actionable exactly-once and no `always`; ~380/0; dep WU5, WU6; rollback approval paths; commit `feat(codex): add once-only approvals`; untouched OpenCode auto-accept responder.
- [ ] **3.3 WU9** — Refs abort/cleanup; `runtime.js`, `app-server-session.js`, session action tests; RED repeated abort/exit/running tool; GREEN interrupt, reject, terminalize, clear, dispose; verify one outcome/no busy-pending-dead process; ~330/0; dep WU7, WU8; rollback cleanup paths; commit `feat(codex): make abort cleanup idempotent`; untouched unrelated sessions.

## Phase 4: Web UI Reconciliation and Integration

- [ ] **4.1 WU10** — Refs selection/routing; `execution-target.ts`, `lib/codex/client.ts`, `ChatInput.tsx`, `session-ui-store.ts`, `session-actions.ts`, `selection-store.ts` tests; RED Codex through provider/model/OpenCode; GREEN Web target branch; verify OpenCode fields/path unchanged; ~520/0; dep WU5, WU7; rollback UI target files; commit `feat(ui): route Codex by execution target`; untouched non-Web Codex.
- [ ] **4.2 WU11** — Refs sync authority/reconnect; `bootstrap.ts`, `session-message-loader.ts`, `event-pipeline.ts`, `event-reducer.ts` tests; RED browser close/reopen, stale snapshot, WS/SSE live race; GREEN revisioned snapshot-before-events loaders; verify authoritative status/messages/approvals and reopen convergence; ~520/0; dep WU6, WU9; rollback sync branches; commit `feat(ui): reconcile Codex snapshots and events`; untouched existing OpenCode sync.
- [ ] **4.3 WU12** — Refs verification evidence; process-backed `packages/web/server/lib/codex/codex-engine.integration.test.js` and Git fixture; RED conversation/command/tool/edit/diff/approval/abort/reconnect/restart/read-limit/isolation; GREEN fixture; verify authenticated server behavior; ~650/0; dep WU0–WU11; rollback fixture only; commit `test(codex): prove process-backed web scenarios`; untouched production contracts until proven.

## Phase 5: Regression and Release Checks

- [ ] **5.1 WU13** — Refs runtime boundaries/regression; focused OpenCode tests, web JS `node --check`, UI tests/type/lint, generated/export checks; RED guard failures; GREEN fixes only in owned files; verify `bun run dead-code`, package checks, OpenCode prompt/permission/abort/shell/optimistic paths; ~300/0; dep WU12; rollback regression-only edits; commit `test(codex): close boundary and static regressions`; untouched all unsupported/native Codex surfaces.

## Review Workload Forecast
Estimated changed lines: ~7,800–8,800 total (5,910 authored; 1,900–2,900 generated/schema/spike evidence); generated work remains separately reported.
400-line budget risk: High
800-line session budget risk: High overall; 12 autonomous slices, maximum 780 authored lines.
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain — a tracker/feature branch accumulates final integration; Slice 1 establishes its boundary, each later child targets the immediate previous slice branch, and only the tracker/final integration PR merges to main. No branches or PRs are created here.
Recommended autonomous slices:

| Slice | Work units | Authored / generated | Target relationship | Acceptance boundary | Rollback boundary |
|---|---|---:|---|---|---|
| 1 | WU0 | 300 / 0 | Tracker boundary | Gate passes; otherwise hard stop | Spike files |
| 2 | WU1 | 450 / 700–1,200 | Child → Slice 1 | JSON-RPC tests pass | Protocol files |
| 3 | WU2–WU3 | 780 / 0 | Child → Slice 2 | Binding and lifecycle tests pass | Binding/lifecycle files |
| 4 | WU4 | 420 / 0 | Child → Slice 3 | Authority/restart tests pass | Runtime store |
| 5 | WU5 | 420 / 0 | Child → Slice 4 | Web route/security tests pass | Route wiring |
| 6 | WU6 | 480 / 0 | Child → Slice 5 | Projection/performance tests pass | Translator/reducer cases |
| 7 | WU7–WU8 | 740 / 0 | Child → Slice 6 | Turn/approval tests pass | Turn/approval paths |
| 8 | WU9 | 330 / 0 | Child → Slice 7 | Abort cleanup is idempotent | Cleanup paths |
| 9 | WU10 | 520 / 0 | Child → Slice 8 | Web target routing passes | UI target files |
| 10 | WU11 | 520 / 0 | Child → Slice 9 | Reconnect convergence passes | Sync branches |
| 11 | WU12 | 650 / 0 | Child → Slice 10 | Process-backed evidence passes | Fixture only |
| 12 | WU13 | 300 / 0 | Child → Slice 11; final tracker integration → main | Regression/static checks pass | Regression-only edits |

Decision needed before apply: No — `auto-chain` and `feature-branch-chain` are resolved; WU0 remains a hard technical gate, not a delivery-strategy decision.
