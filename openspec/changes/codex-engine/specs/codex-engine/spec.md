# Codex Engine Specification

## Purpose

MVP SHALL provide Web Server Codex threads, approvals, streaming, abort, and recovery without changing OpenCode.

## Requirements

### Requirement: Compatibility Gate

Before changes, fixture MUST record versions/schema/findings and prove `initialize → thread/start → turn/start → stream → complete → resume → second turn`, approval/interrupt; failure MUST block.

#### Scenario: Gate
- GIVEN runtime; WHEN fixture runs; THEN pass; failure preserves findings/blocks.

### Requirement: Selection and Routing

Web users MUST select Codex independently. Codex turns MUST use only Codex Web Server path. OpenCode sessions MUST retain OpenCode SDK/provider/model route unchanged.

#### Scenario: Routing
- GIVEN Codex/OpenCode sessions; WHEN each gets turn; THEN specified paths; OpenCode unchanged.

### Requirement: Durable Binding

Session MUST atomically bind thread, directory, runtime, and target without credentials. Post-first-turn mutation/conflict MUST fail. Completed threads MUST resume; missing threads MUST fail.

#### Scenario: Binding
- GIVEN binding; WHEN reopen/conflict; THEN resume or explicit failure.

### Requirement: Process and JSON-RPC

Server MUST direct-spawn app-server, gate init, parse fragmented/multiple JSONL, correlate, handle notifications/requests, bound waits/stderr, reject exit, clean idle processes. Ordinary request timeouts MUST NOT kill long turns. Malformed JSONL MUST emit explicit protocol error, preserve truthful status, reject affected work, never fake success. Unrelated work MAY continue only if trustworthy; otherwise affected turn/process MUST fail with deterministic cleanup.

#### Scenario: Timeout
- GIVEN long turn/request; WHEN request times out; THEN request settles and turn/process stays active.

#### Scenario: Malformed input
- GIVEN pending work/malformed JSONL; WHEN assessed; THEN affected work rejects; unrelated work continues only if trustworthy.

### Requirement: Turn Projection

Codex MUST start `turn/start`, allow one active turn per thread, and project ordered text/reasoning/tools/commands/file changes/completion/errors. Git/file surfaces MUST show real changes; errors MUST NOT become idle/empty.

#### Scenario: Projection
- GIVEN idle bound thread; WHEN events/edits occur; THEN UI shows ordered parts, real changes, terminal status.

### Requirement: Approvals

Pending requests MUST use existing UI. MVP MUST support approve-once/reject, never silently auto-approve or advertise “always”. Browser close/reload MUST NOT reject/lose approval. Reconnect MUST authoritatively re-project each server-owned approval exactly once and keep it actionable. Process exit MUST explicitly fail/reject pending approval and settle turn.

#### Scenario: User decision
- GIVEN pending request; WHEN approved once/rejected; THEN exactly one response and truthful settlement.

#### Scenario: Browser reload
- GIVEN server-owned approval/reloaded browser; WHEN reconnecting; THEN exactly-once projection, actionable and not lost.

#### Scenario: Process exit
- GIVEN pending approval; WHEN Codex exits; THEN explicit approval/turn failure and no pending approval.

### Requirement: Abort and Cleanup

Server MUST interrupt active turns. Abort MUST be idempotent and scoped by authoritative runtime/directory/session. Terminal paths MUST clear ownership/status, reject requests, settle tools, and remove dead processes.

#### Scenario: Cleanup
- GIVEN active turn; WHEN abort repeats/process dies; THEN one outcome and no busy, pending, running, or dead resource.

### Requirement: Disconnect and Restart

Browser closure/reload MUST NOT cancel/reject/lose server work/approvals. Reconnect MUST restore authoritative status/transcript/parts/approvals/results and project pending approvals exactly once/actionable. Restart supports completed threads/next turn only; in-flight survival excluded. Process exit is failure, not disconnect.

#### Scenario: Reconnect
- GIVEN running turn/pending approval/disconnected browser; WHEN reconnect or completed restart; THEN state reconciles, approval stays actionable, exit settles explicitly.

### Requirement: Security and Privacy

Codex MUST own auth. Credentials/tokens/prompts/reasoning/command output/sensitive JSON-RPC payloads MUST NOT enter settings, bindings, browser storage, or default logs. Debug payloads require redacted opt-in.

#### Scenario: Privacy
- GIVEN protocol events; WHEN logged/persisted; THEN only non-sensitive IDs/statuses appear.

### Requirement: Runtime and Regression Boundaries

Codex execution MUST be Web Server-only. Electron/hosted-mobile/Capacitor/VS Code MUST expose unavailability. OpenCode flows MUST remain regression-tested.

#### Scenario: Boundary
- GIVEN non-Web runtime; WHEN Codex is invoked; THEN unavailable and OpenCode usable.

### Requirement: Verification Evidence

Strict TDD MUST cover deterministic JSON-RPC, lifecycle, events, bindings, approvals, abort, reconnect, process conversation, file edit/Git diff, command/tool, completed restart, concurrent isolation, and abort fixtures.

#### Scenario: Evidence
- GIVEN gate passed; WHEN both suites run; THEN listed behavior and workspace/identity isolation are proven.
