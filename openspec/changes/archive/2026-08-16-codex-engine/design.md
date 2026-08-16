# Design: Codex Engine MVP

## Technical Approach

Preserve accepted WU0–WU10 and add the missing production publication boundary before WU11. **Correction rationale:** WU6 proved translator/orderer/reducer behavior only in isolation; production never forwards app-server notifications, invokes `translateCodexEvent`, publishes projected memory, or broadcasts it. The authorized WU11 reset (`sha256:81e20a70c2a2e34d5890ecb37a68eb0b8b1ea522b23a02f756a48c3140b745f5`) permits planning correction, not fabricated UI convergence.

## Architecture Decisions

| Decision | Choice | Alternative / rationale |
|---|---|---|
| Existing boundaries | Keep the explicit OpenCode/Codex target, Web-only eligibility, `ses_codex_*` binding, direct stdio process, generated schema, and completed-thread recovery. | Reworking completed scope adds risk and is unauthorized. |
| Revision authority | `CodexRuntime.publishProjection` alone mutates projected messages/parts/status/approvals/diff, increments one per-session revision, appends one bounded replay envelope, then broadcasts it. | Translator-, route-, or browser-owned revisions create competing truth. |
| Capture/translation | `CodexAppServerSession` forwards validated notifications through `onNotification`; `CodexRuntime` invokes pure `translateCodexEvent` for revisionless changes. Runtime-native prompt, approval, abort, exit, and recovery transitions use the same publisher. | Raw-frame broadcast leaks protocol and bypasses canonical state. |
| Transport | Inject existing `broadcastGlobalUiEvent` at composition. Publish `openchamber:codex-projection` through existing authenticated global WS and SSE fan-out; do not alter upstream OpenCode SSE, WS paths, auth, origin, relay, or normalization. | A Codex socket/hub duplicates transport and relay logic. |
| Reconnect | Web UI subscribes first, buffers at most 256 events per session, applies one authoritative snapshot, then contiguous events strictly newer than its revision. | Fetch-first loses races; event-first can retain partial state. |
| Runtime support | Direct and relayed Web Server are supported. Electron, VS Code, hosted-mobile, and Capacitor remain explicitly unavailable. | Shared UI visibility cannot grant server capability. |

## Data Flow

```text
validated notification -> CodexAppServerSession callback -> translateCodexEvent
runtime transition -------------------------------> CodexRuntime.publishProjection
                                      -> projected memory@revision -> replay(256)
                                      -> existing authenticated WS/SSE broadcaster
Web reconnect -> subscribe/buffer -> GET projected snapshot -> apply newer contiguous events
```

## Interfaces / Contracts

`GET /api/codex/sessions/:id/messages` returns `{engine:"codex",sessionID,revision,messages,parts,status,pendingApprovals,diff,activeTurn,failure,recovery}` parsed from unknown; it never returns raw transcript or JSON-RPC payloads. `?afterRevision=N` returns contiguous replay or `{kind:"snapshot-required",snapshot}`. `/status` is a same-revision subset, never a separate authority.

Duplicate/stale revisions are no-ops. A gap, replay miss, malformed envelope, buffer overflow, reconnect, or WS backpressure signal triggers bounded snapshot/replay repair; later events are not applied across a gap. Fetch failure preserves prior state and exposes retryable stale/error state. Snapshot replacement is one session-scoped transaction; runtime/generation changes discard stale completions. Broadcast failure never rolls back Codex execution: committed replay/snapshot remains recovery authority.

Publishing is O(changes + affected buckets), with no history scan; replay and live buffers are count-bounded at 256. Existing WS buffered-byte limits remove slow clients. Aggregate counters cover translated/rejected frames, replay misses, gaps, overflow, snapshot retries, and dropped clients without payload/content logging.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/web/server/lib/codex/{app-server-session,event-translator,runtime,routes}.js` | Modify | Capture, single publication authority, replay, projected route. |
| `packages/web/server/index.js` | Modify | Thin broadcaster dependency injection only. |
| `packages/ui/src/lib/codex/client.ts` | Modify | Parse projected snapshot/replay contracts. |
| `packages/ui/src/sync/{bootstrap,session-message-loader,event-pipeline,event-reducer}.ts*` | Modify | Buffer, atomic snapshot, revision/gap reconciliation. |
| Adjacent focused tests and owning `DOCUMENTATION.md` files | Modify | Preserve contracts and evidence. |

## Testing Strategy

| Layer | RED evidence |
|---|---|
| Server unit/integration | Callback-to-translator production call; one revision per visible transition; projected route excludes raw transcript; replay hit/miss; broadcast failure; auth/origin and WS/SSE fan-out. |
| UI unit | Subscribe-before-fetch race; duplicate/stale/gap/overflow; snapshot failure preservation; approval replacement; runtime-switch rejection; reference stability. |
| Process-backed | Disconnect/reconnect during text, tool, approval, abort, completion; direct and relay transport; unchanged OpenCode event behavior. |

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior and planned RED test |
|---|---|---|
| Documentation-like paths | N/A | No executable classification. |
| Git repository selection | Applicable | Canonical absolute cwd only; reject relative/mismatch/symlink escape; RED covers absolute, relative, and authoritative cwd. |
| Commit state | N/A | No commit automation. |
| Push state | N/A | No push automation. |
| PR commands | N/A | No PR automation. |

## Migration / Rollout

Add **WU6R — Production projection publication** before WU11; do not reopen WU6 or any WU0–WU10 acceptance. Keep WU6R server-focused at 650–750 authored lines including RED tests; WU11 remains the separate UI reconciliation slice below 800 lines. Rollback removes WU6R wiring/projected publication while preserving completed scope and disabled-by-default Codex. No data migration.

## Open Questions

None.

## Phase Result Contract

```yaml
status: success
executive_summary: >-
  The corrected Codex Engine design is technically accepted, with
  CodexRuntime.publishProjection as the sole projection publication authority
  and WU6R as the required production-publication prerequisite before WU11.
artifacts:
  - OpenSpec openspec/changes/codex-engine/design.md
  - Engram sdd/codex-engine/design
next_recommended: sdd-tasks
risks:
  - WU6R must be planned before WU11.
  - Production projection publication remains unimplemented.
skill_resolution: paths-injected
```
