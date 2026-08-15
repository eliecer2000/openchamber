# Codex App-Server Compatibility Gate: PASS

Codex CLI `0.147.0` passed the WU0 hard gate on checkout `75bd5ac6ab7ef3b99932a5e910410cf9b958f8a9`. The process-backed spike proved initialization, a new thread, streaming completion, process replacement, thread resume, a second turn, approval, interrupt, and deterministic cleanup. Package implementation may proceed in a later slice; this slice changed no `packages/**` files.

## Reproduce

```bash
node scripts/codex-app-server-spike.mjs
```

The command requires an installed, authenticated Codex CLI. It does not read, copy, persist, or print credentials. Generated schema working directories and the approval probe remain confined to `docs/.codex-app-server-spike/` and are removed after hashing. Redacted machine-readable evidence remains in `docs/.codex-app-server-spike/report.json` with mode `0600`.

## Environment identity

| Evidence | Observed value |
|---|---|
| Checkout ref | `refs/heads/personal` |
| Checkout SHA | `75bd5ac6ab7ef3b99932a5e910410cf9b958f8a9` |
| Codex | `codex-cli 0.147.0` |
| Node.js | `v26.7.0` |
| Bun | `1.3.14` |
| Codex executable SHA-256 | `134063e133f0b4244fa3b251acf973d4fe4b4aeeacbdc135211bf480f59f1477` |

Checkout identity is read directly from `.git/HEAD` and its ref file; the spike does not invoke Git.

## Schema evidence

Both generators ran with `--experimental`, matching the initialized `experimentalApi` capability.

| Generated contract | Files | Aggregate SHA-256 |
|---|---:|---|
| TypeScript | 723 | `81515e7bbee62a6eea19a5a686a1a2d9c310ea0c5124e6b7eba4fc46c71d83a1` |
| JSON Schema | 361 | `e0e83a5379d87b58746426d7d7f53dafc151ec40910a1f3e7c9f2b838b663e2a` |

The aggregate hashes include each relative path and file content in sorted order. Generated files are reproducible evidence, not committed production contracts; WU1 must generate and validate its own pinned descriptor.

## Executable protocol evidence

| Step | Result |
|---|---|
| `initialize` then `initialized` | PASS |
| `thread/start` | PASS |
| First `turn/start` | PASS — terminal status `completed` |
| Streaming | PASS — non-empty `item/agentMessage/delta` observed |
| Replace app-server process | PASS — first process exited cleanly |
| `thread/resume` | PASS — returned the original thread identity |
| Second `turn/start` | PASS — streamed and completed |
| Approval | PASS — `item/commandExecution/requestApproval`, one-time `accept`, approved probe verified |
| `turn/interrupt` | PASS — `turn/completed` reported `interrupted` |
| Cleanup | PASS — two processes exited with code `0`; no live process, probe, or schema working directory remained |

Only method names, decisions, terminal statuses, counts, versions, and hashes are persisted. Prompts, reasoning, command output, raw JSON-RPC payloads, environment contents, credentials, and thread identifiers are not recorded.

## PR #884 compatibility findings

The five planned reference files are absent from the current checkout, so PR #884 remains historical implementation evidence rather than code to port verbatim.

### Confirmed assumptions

- Direct `codex app-server --listen stdio://` spawn with `shell: false` works.
- `initialize` followed by `initialized` is required and works.
- `thread/start`, `turn/start`, `thread/resume`, and `turn/interrupt` remain supported.
- Approval requests remain server-to-client JSON-RPC requests; `accept` and `decline` remain valid decisions.

### Incompatibilities and unsafe assumptions

- Current interrupt settlement is `turn/completed` with status `interrupted`; the PR's `turn/aborted` handler is stale.
- The PR logs raw notification payloads, which can expose source, paths, reasoning, prompts, and command output.
- The PR's JSONL parser reports malformed lines and continues; the MVP contract requires explicit affected-work failure and deterministic cleanup.
- The PR's session binding persistence is neither atomic nor mode `0600`, and malformed storage becomes empty success instead of quarantine.
- The PR hard-codes backend descriptors as available before runtime evidence; eligibility must be server-authoritative.
- The PR maps unexpected process exit to an error followed by idle, risking false success and stranded turn ownership.
- Current text input requires `text_elements: []`; generated schemas, not copied hand-written payloads, are authoritative.

## TDD and verification

| Phase | Command | Exact result |
|---|---|---|
| RED | `node scripts/codex-app-server-spike.mjs --help` before creation | Exit `1`, `MODULE_NOT_FOUND` |
| GREEN | `node scripts/codex-app-server-spike.mjs --help` | Exit `0`, usage printed |
| TRIANGULATE | `node scripts/codex-app-server-spike.mjs` | Exit `0`, compatibility gate `PASS` |
| REFACTOR | `node --check scripts/codex-app-server-spike.mjs` and full spike rerun | Both exit `0`; gate remains `PASS` |

## Gate decision

**PASS.** WU0 may be checked off. WU1 is the next permitted work unit, but it is intentionally outside this slice. Rollback is limited to `scripts/codex-app-server-spike.mjs`, this document, and `docs/.codex-app-server-spike/`.
