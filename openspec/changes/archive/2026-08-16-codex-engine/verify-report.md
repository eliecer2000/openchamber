```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 11/11
scenarios: 14/14
test_command: 'bun run --cwd packages/web test -- server/lib/codex/jsonrpc-client.test.js server/lib/codex/binding-store.test.js server/lib/codex/app-server-session.test.js server/lib/codex/runtime.test.js server/lib/codex/routes.test.js server/lib/codex/event-translator.test.js'
test_exit_code: 0
test_output_hash: sha256:f2df82056b6e00aa1d34cb9d117497ae996b91aba4cd4abb251d7c398b19ce94
build_command: 'bun run --cwd packages/ui type-check && bun run --cwd packages/ui lint && bun run --cwd packages/web type-check && bun run --cwd packages/web lint && node scripts/generate-codex-protocol.mjs --check && bun run dead-code'
build_exit_code: 0
build_output_hash: sha256:95164c1059d4f0c535e48b2c28e41e7de46c4c63f7d0ee8dfc566b1faad161c0
```

## Verification Report

**Change**: `codex-engine`
**Version**: N/A
**Mode**: Strict TDD
**Artifact mode**: Hybrid (`openspec` + Engram)
**Delivery**: `auto-chain` / `feature-branch-chain`

### Completeness

| Metric | Value |
|---|---:|
| Requirements | 11 |
| Scenarios | 14 |
| Task checkboxes | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |

All tasks were complete before full verification. The final-state facts supplied by the parent override stale conditional wording in `tasks.md` and `apply-progress.md`: POST-CLEANUP passed a stable 25-second observation, and WU13 native settlement is complete/passed for the candidate revision above.

### Build & Tests Execution

**Tests**: ✅ 391/391 current release-gate tests passed.

- Web OpenCode preservation: 13 files, 105/105.
- Web Codex: 6 files, 79/79.
- Isolated UI: 15 files, 207/207. Each UI file ran in a separate Bun process to avoid process-global mock interference.
- Expected failure-path diagnostics appeared in `session-actions.test.ts`, `session-ui-store.test.js`, and `bootstrap.test.ts`; all corresponding assertions passed.
- Accepted process evidence was not rerun: WU12 remains 5/5 at `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3` as explicitly required by the verification scope.

**Build/static contract**: ✅ Passed.

- `node --check`: 23 applicable JS/MJS files.
- UI and Web type-check: passed.
- UI and Web lint: passed.
- Protocol generation check: passed.
- Export/manifest identity: `CODEX_PROTOCOL`, `CodexProtocolError`, and `parseCodexProtocolMessage` exported; method counts 133/11/70; Codex version and aggregate identity matched the manifest.
- Dead-code report: command passed with the unchanged non-blocking baseline of 206 unused exports, 156 unused exported types, and 1 duplicate export; no Codex candidate was newly reported.

**Coverage command**:

```text
for file in packages/ui/src/sync/session-actions.test.ts packages/ui/src/components/chat/PermissionCard.test.ts packages/ui/src/types/execution-target.test.ts packages/ui/src/sync/selection-store.test.ts packages/ui/src/lib/codex/client.test.ts packages/ui/src/sync/codex-execution-routing.test.ts packages/ui/src/sync/bootstrap.test.ts packages/ui/src/sync/session-message-loader.test.ts packages/ui/src/sync/event-pipeline.test.ts packages/ui/src/sync/__tests__/event-reducer.test.ts; do bun test --coverage "$file" || exit; done
```

Result: ✅ exit 0; 141/141 focused tests passed. Output hash: `sha256:af9af0f3fbe196c2cefc379762324447ffa01212910809bd7a3b2cc9a3cc0bc0`.

**Command correction**: one preparatory static-command composition reached passing syntax/type/lint/protocol checks but exited 1 at the inline export check because shell backticks were quoted incorrectly (`sha256:79330f8b074302e8b7a85f9492de0e8dc91e68b3936fbde5664ddc4b73b914ec`). It executed no native, source-mutating, or project-failing check. The corrected authoritative build command above passed in full.

### Requirements Coverage Matrix

| Requirement | Scenario | Runtime test evidence | Source evidence | Result |
|---|---|---|---|---|
| Compatibility Gate | Gate | Accepted WU0 authenticated spike; current syntax and generated-protocol checks | `scripts/codex-app-server-spike.mjs`, generated manifest | ✅ COMPLIANT |
| Selection and Routing | Routing | Current `codex-execution-routing`, execution-target, session-actions, client, and 105 OpenCode regression tests | Explicit target discriminant; Codex uses `runtimeFetch`; OpenCode SDK path remains separate | ✅ COMPLIANT |
| Durable Binding | Binding | Current `binding-store.test.js`; accepted WU12 restart/isolation scenario | Canonical absolute scope, atomic 0600 writes, lock/conflict handling, immutable first-turn thread binding | ✅ COMPLIANT |
| Process and JSON-RPC | Timeout | Current JSON-RPC and app-server lifecycle tests | Control requests are bounded; ordinary `turn()` requests have no timeout; timeout removes only the affected request | ✅ COMPLIANT |
| Process and JSON-RPC | Malformed input | Current JSON-RPC malformed/schema/size tests | Fatal protocol error rejects pending work, closes affected process authority, and does not retain payloads | ✅ COMPLIANT |
| Turn Projection | Projection | Current translator/runtime/UI reducer-loader tests plus accepted WU12 real edit/Git diff | Ordered engine-tagged changes, one active turn, terminal diff fallback, explicit diff-read failure | ✅ COMPLIANT |
| Approvals | User decision | Current runtime/routes/client/session-actions/PermissionCard tests plus accepted WU12 approve/reject | Runtime-owned atomic claim; only `once`/`reject`; OpenCode `always` preserved only for OpenCode | ✅ COMPLIANT |
| Approvals | Browser reload | Current loader snapshot/approval replacement tests plus accepted WU12 reconnect | Server-owned pending approvals are in the authoritative snapshot and are replaced atomically | ✅ COMPLIANT |
| Approvals | Process exit | Current runtime/app-server failure tests | Exit terminalizes active parts, clears active turn and pending approvals, and publishes failure | ✅ COMPLIANT |
| Abort and Cleanup | Cleanup | Current runtime/app-server tests plus accepted WU12 concurrent direct/relay abort | Scoped idempotent abort, one interrupt, approval rejection, active-part terminalization, retryable failed cleanup | ✅ COMPLIANT |
| Disconnect and Restart | Reconnect | Current loader/pipeline direct-relay reconciliation tests plus accepted WU12 reconnect/completed restart | Subscribe-before-fetch, 256 buffer, contiguous replay, bounded repair, runtime-generation rejection | ✅ COMPLIANT |
| Security and Privacy | Privacy | Current binding/JSON-RPC/routes tests plus accepted WU12 persistence assertions | Existing `/api` auth gate, canonical directory scope, no secrets/raw transcript in bindings or projected routes, sanitized errors/metrics | ✅ COMPLIANT |
| Runtime and Regression Boundaries | Boundary | Current routes/execution-target tests and 105 OpenCode regression tests | Web capability is frozen server-side; Electron, VS Code, hosted-mobile, and Capacitor are unavailable | ✅ COMPLIANT |
| Verification Evidence | Evidence | Current 391/391 release gate; accepted WU12 5/5; WU13 settlement complete | Deterministic protocol, lifecycle, binding, projection, reconnect, approval, abort, diff, restart, and isolation evidence | ✅ COMPLIANT |

**Compliance summary**: 14/14 scenarios compliant; 11/11 requirements complete.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Compatibility Gate | ✅ Implemented | Redacted schema/version/findings evidence is preserved; generated identity is deterministic. |
| Selection and Routing | ✅ Implemented | Codex never enters provider/model/SDK prompt assembly; OpenCode behavior remains on its existing path. |
| Durable Binding | ✅ Implemented | Binding identity includes server, runtime, canonical directory, target, session, and thread metadata without credentials. |
| Process and JSON-RPC | ✅ Implemented | Direct stdio spawn, initialize gate, bounded JSONL/stderr/control waits, explicit process/protocol failure, and idle disposal are present. |
| Turn Projection | ✅ Implemented | `CodexRuntime.publishEntry` is the internal single revision/publication authority; translator output is revisionless. |
| Approvals | ✅ Implemented | Approval scope includes session/thread/turn; replayed snapshots remain actionable; `always` and auto-accept fail closed. |
| Abort and Cleanup | ✅ Implemented | Abort ownership, active-part terminalization, late-event suppression, process failure, and cleanup retry are explicit. |
| Disconnect and Restart | ✅ Implemented | UI buffering/reconciliation is runtime-scoped; completed-thread recovery is supported while in-flight restart is explicitly rejected. |
| Security and Privacy | ✅ Implemented | Codex routes inherit API auth and canonical project resolution; bindings/logging/projections exclude sensitive protocol content. |
| Runtime and Regression Boundaries | ✅ Implemented | Server and UI enforce Web-only eligibility; direct and relayed Web are supported without a new transport. |
| Verification Evidence | ✅ Implemented | Generated contract identity, focused suites, process fixture, cleanup evidence, and release regressions cover the required matrix. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Explicit OpenCode/Codex target and Web-only eligibility | ✅ Yes | Target routing is discriminated and capability-gated; unsupported surfaces cannot gain capability through UI state. |
| Single runtime projection authority | ✅ Yes | All native/translated transitions funnel through runtime-owned `publishEntry`; `publishProjection` is the external wrapper. |
| Validated capture then pure translation | ✅ Yes | `CodexAppServerSession.onNotification` feeds `translateCodexEvent`; raw frames are not broadcast. |
| Existing authenticated WS/SSE transport | ✅ Yes | Composition injects `broadcastGlobalUiEvent`; direct/relay and slow-client behavior remain transport-owned. |
| Subscribe/buffer/snapshot/contiguous replay | ✅ Yes | Loader buffers 256, rejects gaps/overflow/malformed input, and caps repair at two reads per trigger. |
| Explicit runtime support boundaries | ✅ Yes | Browser Web only; Electron, VS Code, hosted-mobile, and Capacitor remain unavailable. |

No spec-breaking design deviation was found. The internal helper name `publishEntry` refines the design's `publishProjection` wording without creating a second authority.

### TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | Cumulative and corrective RED/GREEN/TRIANGULATE/REFACTOR evidence exists in `apply-progress.md`. |
| All tasks have tests/checks | ✅ | 18/18 task checkboxes have executable evidence; verification-only/acceptance rows are explicitly classified. |
| RED confirmed | ✅ | Test/check files exist; reported REDs identify absent behavior or concrete failing outcomes rather than fabricated failures. |
| GREEN confirmed | ✅ | Current 391/391 passed; accepted WU12 process evidence is 5/5; final WU12R evidence is 33/33, 69/69, and 5/5. |
| Triangulation adequate | ✅ | Alternate paths cover malformed/trustworthy input, duplicate/conflicting IDs, direct/relay, approve/reject, gap/overflow, diff success/failure, and runtime/workspace isolation. |
| Safety net for modified work | ✅ | 13/13 modification rows record passing safety nets; 5 new or acceptance-only rows are explicitly N/A. |

**TDD Compliance**: 6/6 checks passed.

### Test Layer Distribution

| Layer | Tests | Files | Tool/evidence |
|---|---:|---:|---|
| Unit/module | 207 | 15 | Isolated `bun:test` UI/module processes |
| Server unit/integration | 184 | 19 | Vitest route/runtime/transport suites |
| Process-backed integration | 5 | 1 | Accepted real Codex WU12 fixture, intentionally not rerun |
| Browser E2E | 0 | 0 | No general Playwright/Cypress harness is configured |
| **Total** | **396** | **35** | Distinct current plus accepted process scenarios |

### Changed File Coverage

Vitest coverage is not wired, so server JS changed-file coverage is unavailable. Focused Bun coverage is process-local; the table records the best directly targeted result for each measured UI source file and does not pretend to be an aggregate workspace metric.

| File | Function % | Line % | Uncovered lines reported by Bun | Rating |
|---|---:|---:|---|---|
| `permissionCardPatterns.ts` | 100.00 | 100.00 | — | ✅ Excellent |
| `execution-target.ts` | 100.00 | 95.83 | Bun emitted no line number for the residual line | ✅ Excellent |
| `lib/codex/client.ts` | 90.00 | 100.00 | — | ✅ Excellent |
| `session-message-loader.ts` | 85.54 | 91.58 | 195, 233, 359-363, 385-391, 429-459, 463-465, 482-493, 892 | ⚠️ Acceptable |
| `session-actions.ts` | 88.11 | 78.36 | Includes 73, 132-133, 147-161, 208-211, 399-405, 758-788, 2048-2086 | ⚠️ Low |
| `selection-store.ts` | 47.62 | 57.03 | 62-66, 72-77, 83-93, 97, 100-125, 129-130, 177, 179, 190-191 | ⚠️ Low |
| `bootstrap.ts` | 69.81 | 57.41 | 22, 39-54, 68-77, 81-83, 88-101, 116-160, 194-195, 242-324 | ⚠️ Low |
| `event-pipeline.ts` | 62.50 | 49.88 | 54-64, 72-79, 204-226, 313-326, 377-380, 477-564, 732-919, 999-1088 | ⚠️ Low |
| `event-reducer.ts` | 57.50 | 54.80 | 32-95, 116-145, 224-241, 299-301, 325-327, 363-372, 465-561, 597-637, 665-711, 737-853 | ⚠️ Low |
| `session-ui-store.ts` | 29.17 | 30.64 | Broad legacy/module ranges; Codex routing lines 127-160 are exercised by focused tests | ⚠️ Low |

**Average measured line coverage**: 71.55%.
**Branch coverage**: unavailable from Bun's text reporter.
**Unmeasured changed surfaces**: Web/server JS (no Vitest provider), `ChatInput.tsx`, `ComposerFooter.tsx`, and `PermissionCard.tsx` render behavior (no DOM test environment).

Coverage is informational under Strict TDD verification and does not contradict the passing scenario evidence.

### Assertion Quality

The 19 created/modified test files and the process spike were scanned for tautologies, assertions without production calls, orphan empty assertions, type-only-only checks, ghost loops, smoke-only rendering, CSS-class coupling, and mock-heavy files.

- No tautology or assertion-without-production-call pattern was found.
- Empty-result assertions are tied to explicit preconditions and have companion non-empty/alternate-path cases (for example fragmented JSONL, missing vs corrupt binding, approval removal, successful empty snapshot, and terminal active-tool cleanup).
- Type-presence assertions are paired with concrete value/state assertions.
- Loops iterate fixed non-empty case tables or assert non-empty prerequisites; no query-result ghost loop was found.
- No changed UI test asserts CSS classes.
- No changed file has more than twice as many module mocks as assertions.

**Assertion quality**: ✅ All audited assertions verify real behavior.

### Quality Metrics

**Linter**: ✅ UI and Web passed with no diagnostics.
**Type checker**: ✅ UI and Web passed with no diagnostics.
**JavaScript syntax**: ✅ 23/23 files.
**Generated contracts**: ✅ deterministic generation, exports, method counts, output hashes, and manifest identity.
**Dead code**: ✅ command passed; unchanged 206/156/1 non-blocking baseline.

### Issues Found

**CRITICAL**: None.

**WARNING**:

1. Focused Bun file-level coverage is below 80% for six measured, broad UI modules. The required Codex branches have explicit passing behavioral tests, but the files contain substantial pre-existing unrelated behavior that the focused commands do not cover.

**SUGGESTION**:

1. Add browser-level coverage for the actual `ChatInput`, `ComposerFooter`, and `PermissionCard` visibility/render path when the repository gains a stable DOM/browser harness; current tests prove routing and capability logic, not rendering.
2. Consider a focused performance benchmark if a latency budget is later specified. Current evidence proves O(changes + affected buckets), bounded 256-entry replay/buffers, bounded two-read repair, no history scan, and reference stability, but not production-scale browser latency.
3. Migrate the Vitest bootstrap away from deprecated Node `module.register()` when convenient; the current `DEP0205` warning is unrelated to Codex behavior.

### Residual Risks

- The real Codex process fixture was intentionally not rerun. Runtime confidence relies on the accepted independent WU12 5/5 evidence and final WU12R closure, as required by the verification scope.
- Browser visual/interaction behavior has no automated DOM/E2E coverage in this package; selection/routing/state contracts are automated.
- No production browser performance profile was run because the specification defines structural bounds but no user-facing latency budget.

### Cleanup and Authority

- No native attempt command was run. Parent-owned token `sha256:156b043d888565d86f769fca519c0894f5bcd301c5b5d1a1342fe9560cf1c9a0` was not acquired, reset, settled, or mutated.
- The WU12 real-process fixture was not rerun.
- Parent POST-CLEANUP evidence is accepted: a stable 25-second observation found no schema-root recreation and no Codex app-server.
- WU13 native settlement is complete/passed at `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`, explicitly remediating `sha256:67537102bc7841bf5e7d4d37a861414ca77903a9f48b00e818ac53829e0906e4`.
- Verification changed no source, test, task, apply-progress, dependency, lockfile, generated protocol, Git/GitHub state, formatter output, or `.codegraph/` data.

### Candidate Evidence Revision

`sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`

This is the authoritative settled WU13 candidate verified here. WU12R remains passed at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`; independent WU12 process acceptance remains passed at `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`.

### Verdict

**PASS WITH WARNINGS**

All 11 requirements and 14 scenarios have passing runtime evidence, all 18 tasks are complete, current release checks pass 391/391, and there are zero critical findings. Warnings are informational coverage/tooling limitations, not missing requirement evidence.
