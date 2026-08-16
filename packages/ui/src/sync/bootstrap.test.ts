import { describe, expect, test } from "bun:test"
import type { OpencodeClient, Project } from "@opencode-ai/sdk/v2/client"
import { bootstrapDirectory, parseCodexProjectionSnapshot } from "./bootstrap"
import { INITIAL_STATE, type State } from "./types"

const createSdk = (options?: { commandList?: () => Promise<{ data: unknown[] }> }) => ({
  project: { current: async () => ({ data: { id: "project-a" } }) },
  config: { get: async () => ({ data: {} }) },
  path: { get: async () => ({ data: { state: "", config: "", worktree: "/repo", directory: "/repo", home: "/home" } }) },
  session: { status: async () => ({ data: {} }) },
  command: { list: options?.commandList ?? (async () => ({ data: [] })) },
  mcp: { status: async () => ({ data: {} }) },
  lsp: { status: async () => ({ data: [] }) },
  vcs: { get: async () => ({ data: { branch: "main" } }) },
  question: { list: async () => ({ data: [] }) },
  permission: { list: async () => ({ data: [] }) },
}) as unknown as OpencodeClient

const createState = (): State => ({
  ...INITIAL_STATE,
  message: {},
  part: {},
})

const project = { id: "project-a", worktree: "/repo" } as Project

describe("bootstrapDirectory", () => {
  test("prioritizes session loading without waiting for deferred fields", async () => {
    let state = createState()
    let deferredStarted = false
    let resolveDeferred!: () => void
    const deferred = new Promise<{ data: unknown[] }>((resolve) => {
      resolveDeferred = () => resolve({ data: [] })
    })
    let resolveSessions!: () => void
    const sessions = new Promise<void>((resolve) => {
      resolveSessions = resolve
    })
    let settled = false
    const sdk = createSdk({
      commandList: async () => {
        deferredStarted = true
        return deferred
      },
    })
    const bootstrapping = bootstrapDirectory({
      directory: "/repo",
      sdk,
      getState: () => state,
      set: (patch) => {
        state = { ...state, ...patch }
      },
      global: { config: {}, projects: [project] },
      loadSessions: () => sessions,
    }).then((result) => {
      settled = true
      return result
    })

    await Promise.resolve()
    await Promise.resolve()
    expect(settled).toBe(false)
    expect(deferredStarted).toBe(false)
    resolveSessions()

    expect(await bootstrapping).toBe("complete")
    expect(state.status).toBe("complete")
    expect(deferredStarted).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(deferredStarted).toBe(true)
    resolveDeferred()
  })

  test("reports session-list failure without clearing existing state", async () => {
    let state = { ...createState(), session: [{ id: "cached" }] as State["session"] }
    const result = await bootstrapDirectory({
      directory: "/repo",
      sdk: createSdk(),
      getState: () => state,
      set: (patch) => {
        state = { ...state, ...patch }
      },
      global: { config: {}, projects: [project] },
      loadSessions: async () => {
        throw new Error("unavailable")
      },
    })

    expect(result).toBe("failed")
    expect(state.session.map((session) => session.id)).toEqual(["cached"])
  })

  test("rejects stale work before committing", async () => {
    const state = createState()
    let commits = 0
    const result = await bootstrapDirectory({
      directory: "/repo",
      sdk: createSdk(),
      getState: () => state,
      set: () => {
        commits += 1
      },
      isStale: () => true,
      global: { config: {}, projects: [project] },
      loadSessions: async () => undefined,
    })

    expect(result).toBe("stale")
    expect(commits).toBe(0)
  })
})

describe("parseCodexProjectionSnapshot", () => {
  test("accepts the projected WU6R snapshot without granting authority to unknown fields", () => {
    const snapshot = parseCodexProjectionSnapshot({
      engine: "codex",
      sessionID: "ses_codex_1",
      revision: 4,
      messages: [{ id: "msg_1", sessionID: "ses_codex_1", role: "assistant", time: { created: 1 } }],
      parts: [{ id: "prt_1", messageID: "msg_1", sessionID: "ses_codex_1", type: "text", text: "hello" }],
      status: "waiting_approval",
      pendingApprovals: [{ id: "approval-1", sessionID: "ses_codex_1" }],
      diff: [{ file: "a.ts", patch: "@@" }],
      activeTurn: { id: "turn-1" },
      failure: null,
      recovery: { kind: "memory" },
    })

    expect(snapshot.revision).toBe(4)
    expect(snapshot.messages[0]?.id).toBe("msg_1")
    expect(snapshot.pendingApprovals[0]?.id).toBe("approval-1")
  })

  test("rejects malformed projected snapshots instead of treating them as empty success", () => {
    expect(() => parseCodexProjectionSnapshot({
      engine: "codex",
      sessionID: "ses_codex_1",
      revision: 4,
      messages: [],
      parts: [{ id: "prt_1", messageID: 7 }],
      status: "idle",
      pendingApprovals: [],
      diff: [],
      activeTurn: null,
      failure: null,
      recovery: { kind: "memory" },
    })).toThrow("malformed")
  })
})
