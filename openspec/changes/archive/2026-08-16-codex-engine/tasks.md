# Tasks: Codex Engine MVP

TDD: RED → GREEN → REFACTOR. Web-only Codex; preserve other runtimes. Chain: WU0→WU6R→WU11→WU12R→WU12→WU13.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Forecast: WU12R completed at 437 authored lines (<800); WU12 process acceptance passed without source changes; auto-chain next slice WU13. WU11 alone retains maintainer-approved `size:exception`/`exception-ok` for 866/800 lines. T/H=test+harness; R=rollback; D=dependency.

## Phase 1

- [x] **WU0** — `scripts/codex-app-server-spike.mjs`, spike docs: compatibility gate, schemas/hashes, hard stop. T/H: isolated+Codex. R: spike. D: none.
- [x] **WU1** — `packages/web/server/lib/codex/{generated/*,jsonrpc-client.js}`: bounded JSONL parsing/correlation. T/H: protocol+real initialize. R: protocol. D: WU0.
- [x] **WU2** — `binding-store.js`: atomic `ses_codex_<uuid>`/0600 and path, symlink, corruption, conflict, missing-vs-empty rejection. T/H: binding filesystem. R: binding. D: WU1.
- [x] **WU3** — `app-server-session.js`, `runtime.js`: spawn, handshake, control, timeout, exit, idle, browser-close lifecycle. T/H: lifecycle+real server. R: lifecycle. D: WU1.

## Phase 2

- [x] **WU4** — `runtime.js`: canonical transcript/status/approval/turn/revision/replay, recovery, stale ordering, explicit failure. T/H: authority+recovery. R: runtime. D: WU3.
- [x] **WU5** — server routes/index/runtime wiring: authenticated Web-only capability, ordering, shutdown, unsupported runtimes. T/H: routes+auth. R: wiring. D: WU4.
- [x] **WU6** — `event-translator.js` and existing UI reducer: ordered text/reasoning/tool/command/file/status/error projections. T/H: translator/reducer. R: projection. D: WU4.

## Phase 3

- [x] **WU7** — `routes.js`, `runtime.js`, `codex/client.ts`: deduplicated starts and one active turn. T/H: prompt+auth. R: turn. D: WU4–WU6.
- [x] **WU8** — runtime/routes/`PermissionCard.tsx`: atomic approve-once/reject and actionable reload projection. T/H: permission. R: approval. D: WU5–WU6.
- [x] **WU9** — runtime/session: idempotent interrupt/reject/terminalize/clear/dispose. T/H: concurrent abort. R: cleanup. D: WU7–WU8.
- [x] **WU10** — target/client/`ChatInput.tsx` and stores: Web target outside provider/model/OpenCode. T/H: target→session→prompt. R: UI target. D: WU5,WU7.

## Phase 4

- [x] **WU6R RED/GREEN** — production callback→translator→sole publisher, replay/snapshot, parsed routes, direct/relay WS/SSE; focused tests/harness passed at `sha256:8989831dd46fb7004d609e271f952705f17ea1947115b62eae087e4c0e5f8854`. R: WU6R paths/docs/tests. D: WU6,WU9,WU10.
- [x] **WU11** — UI snapshot/buffer/reconciliation; 104/104 tests passed at `sha256:0fe04fa4898e54d507c36ada7a2ee6455863064fe07859505344d4834f7c66ef`; native 866/800, maintainer-approved WU11-only `size:exception`; reset `sha256:8aa2a2de2ac805efcd47d39705149aacbcecf3bd22068db352891f71e8de1c29`. R: nine WU11 paths. D: WU6R,WU9,WU10.
- [x] **WU12R RED** — `event-translator.test.js`, `runtime.test.js`, `codex-engine.integration.test.js`: reproduced real file/Git edits yielding empty `session.diff`, abort projection behavior, missing native file/diff notifications, and the isolated binding-create 409. T/H: strict focused RED. R: tests. D: WU12 evidence,WU6R,WU9.
- [x] **WU12R GREEN/REFACTOR** — `event-translator.js`, `runtime.js`: terminal authoritative working-tree projection and active projection terminalization preserve sole authority, ordering, idempotence, bounded failure semantics; focused 33/33 and safety 69/69 passed. R: production/test paths. D: RED.
- [x] **WU12R VERIFY/CLEANUP** — real process fixture passed 5/5 at `sha256:87aa14a612d212607389db7756060abe1fbcd5c0fc51bf2e0af82720cd200b37`; syntax/type/lint/dead-code and zero-resource cleanup passed. No commit per maintainer instruction. R: WU12R paths/tests. D: GREEN/REFACTOR.
- [x] **WU12** — isolated process acceptance passed 5/5 and parent-confirmed native settlement is complete/passed at `sha256:22e4d902dd428f4b0325359e43d5e0f83775ea43c8d1e54ac8d83370dee5cae3`; no source/test changes and no native attempt. R: acceptance artifacts only. D: WU12R.
- [x] **WU13** — OpenCode 105/105, Codex 79/79, isolated UI 207/207, syntax/type/lint/protocol/export/manifest/dead-code checks passed at test-only candidate `sha256:8a77edf7d1f11c199d363f72b4adb223e7401e8965dd85513ff7ff4bf6249d1d`; final acceptance remains conditional on parent POST-CLEANUP/native settlement. R: one-line test mock plus acceptance artifacts. D: WU12.

## Phase Result Contract

```yaml
status: success
executive_summary: WU13 worker checks passed after a one-line faithful test-mock correction; completion remains conditional on parent POST-CLEANUP/native settlement.
artifacts:
  - OpenSpec openspec/changes/codex-engine/tasks.md
  - Engram sdd/codex-engine/tasks
next_recommended: sdd-verify
risks:
  - Parent POST-CLEANUP and native settlement remain pending outside this worker.
skill_resolution: paths-injected
```
