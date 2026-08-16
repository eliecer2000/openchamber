# Archive Report: codex-engine

## Closure

- **Change**: `codex-engine`
- **Artifact store**: Hybrid (`openspec` + Engram)
- **Final result**: Success; verification verdict `pass_with_warnings`
- **Review gate**: Not applicable. RDD is disabled and no `reviewGate` was present.
- **Task completion**: 18/18 implementation tasks complete; no unchecked tasks remain.

## Final Evidence

- WU13 parent POST-CLEANUP passed stable 25-second observations with no schema-root recreation and no Codex app-server.
- WU13 native settlement is `COMPLETE/PASSED` at `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`, remediating `sha256:67537102bc7841bf5e7d4d37a861414ca77903a9f48b00e818ac53829e0906e4`.
- Release checks: Web 105/105, Codex 79/79, isolated UI 207/207, total 391/391; syntax, UI/Web type-check and lint, protocol generation/export/manifest, and dead-code checks passed.
- One test-only `sync-refs` mock line was added during WU13 closure; no production behavior changed.
- Independent verification settlement is `COMPLETE/PASSED` at report SHA `sha256:7415c8372dcf9ac7cbe67ead4651f6501416c47a34a83f59b5ed7223d8841e65`.
- Verification passed 11/11 requirements and 14/14 scenarios with zero blockers and zero critical findings.
- WU12 independent process acceptance passed 5/5 at `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`.
- WU12R was accepted at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`.

## Spec Synchronization

The delta was a complete specification because no canonical spec existed. It was copied mechanically to:

- `openspec/specs/codex-engine/spec.md` — created from `openspec/changes/codex-engine/specs/codex-engine/spec.md`.

Mechanical copy readback (`diff -r`): no output; source and temporary destination were byte-identical before installation.

## Archive Move

The complete change folder was mechanically moved to:

- `openspec/changes/archive/2026-08-16-codex-engine/`

Archived artifacts:

- `exploration.md`
- `proposal.md`
- `specs/codex-engine/spec.md`
- `design.md`
- `tasks.md`
- `apply-progress.md`
- `verify-report.md`
- `archive-report.md` (added after the pre-move snapshot)

Mechanical move readback (`diff -r` against the pre-move recursive snapshot): no output; the archived tree is byte-identical to the source snapshot. The active `openspec/changes/codex-engine/` directory no longer exists.

## Warnings and Follow-ups

- Six broad UI modules have focused file-level coverage below 80%; required Codex branches have passing behavioral evidence.
- No browser E2E or DOM/render automation is configured for the covered UI surfaces.
- No production-scale browser latency benchmark was run because the specification defines structural bounds but no user-facing latency budget.
- The accepted WU12 process fixture was intentionally not rerun during independent verification; confidence relies on its accepted 5/5 evidence and WU12R closure.
- The verification report notes an unrelated deprecated Node `module.register()` warning for future cleanup.

## Traceability

Engram artifact observations read in full:

- `#138` — `sdd/codex-engine/proposal`
- `#140` — `sdd/codex-engine/spec`
- `#147` — `sdd/codex-engine/design`
- `#154` — `sdd/codex-engine/tasks`
- `#165` — `sdd/codex-engine/apply-progress`
- `#357` — `sdd/codex-engine/verify-report`

OpenSpec artifacts read from the active change before archival:

- `openspec/changes/codex-engine/exploration.md`
- `openspec/changes/codex-engine/proposal.md`
- `openspec/changes/codex-engine/specs/codex-engine/spec.md`
- `openspec/changes/codex-engine/design.md`
- `openspec/changes/codex-engine/tasks.md`
- `openspec/changes/codex-engine/apply-progress.md`
- `openspec/changes/codex-engine/verify-report.md`

## Exact Archive-Scope Changes

- Created canonical spec: `openspec/specs/codex-engine/spec.md`.
- Moved active change: `openspec/changes/codex-engine/` → `openspec/changes/archive/2026-08-16-codex-engine/`.
- Added this report: `openspec/changes/archive/2026-08-16-codex-engine/archive-report.md`.
- Upserted Engram artifact: `sdd/codex-engine/archive-report`.
- No source, test, dependency, lockfile, formatter, Git/GitHub, or `.codegraph/` changes were made by archival.
