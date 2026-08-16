import { describe, expect, test } from "bun:test"
import type { Message, OpencodeClient, Part } from "@opencode-ai/sdk/v2/client"
import { ChildStoreManager } from "./child-store"
import { SessionMessageLoader } from "./session-message-loader"
import type { CodexProjectionEvent, CodexProjectionSnapshot } from "./event-reducer"
import {
  createFirstVisibleSessionPerformanceTracker,
  startSessionLoadPerformanceEvent,
} from "./session-load-performance"

const createRecord = (sessionID: string, id = "msg_1", created = 1) => ({
  info: { id, sessionID, role: "user", time: { created } } as Message,
  parts: [{ id: `part_${id}`, messageID: id, sessionID, type: "text", text: "hello" }] as Part[],
})

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })
  return { promise, resolve }
}

const response = (data: ReturnType<typeof createRecord>[], cursor?: string) => ({
  data,
  response: { headers: { get: (name: string) => name === "x-next-cursor" ? cursor ?? null : null } },
})

const createLoader = (messages: (input: {
  sessionID: string
  directory?: string
  limit?: number
  before?: string
}) => Promise<unknown>) => {
  const childStores = new ChildStoreManager()
  const sdk = { session: { messages } } as unknown as OpencodeClient
  const loader = new SessionMessageLoader(childStores, { sdk, runtimeKey: "runtime-a" })
  return { childStores, loader }
}

const codexSnapshot = (revision: number, text: string, approvalId = "approval-current"): CodexProjectionSnapshot => ({
  engine: "codex",
  sessionID: "ses_codex_1",
  revision,
  messages: [{ id: "msg_codex_1", sessionID: "ses_codex_1", role: "assistant", time: { created: 1 } } as Message],
  parts: [{ id: "prt_codex_1", messageID: "msg_codex_1", sessionID: "ses_codex_1", type: "text", text } as Part],
  status: "running",
  pendingApprovals: [{ id: approvalId, sessionID: "ses_codex_1" } as never],
  diff: [],
  activeTurn: { id: "turn-1" },
  failure: null,
  recovery: { kind: "memory" },
})

const codexStatusEvent = (revision: number, status: "running" | "idle" = "idle"): CodexProjectionEvent => ({
  engine: "codex",
  sessionID: "ses_codex_1",
  revision,
  changes: [{ kind: "session.status", status }],
})

const createCodexLoader = (fetchSnapshot: () => Promise<CodexProjectionSnapshot>) => {
  const childStores = new ChildStoreManager()
  const sdk = { session: { messages: async () => response([]) } } as unknown as OpencodeClient
  const loader = new SessionMessageLoader(childStores, { sdk, runtimeKey: "runtime-a", fetchCodexSnapshot: fetchSnapshot })
  return { childStores, loader, sdk }
}

describe("SessionMessageLoader", () => {
  test("deduplicates navigation and reactive loading for the same target", async () => {
    const pending = deferred<ReturnType<typeof response>>()
    let calls = 0
    const { childStores, loader } = createLoader(async () => {
      calls += 1
      return pending.promise
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    const navigation = loader.ensure(target, { reason: "navigation" })
    const reactive = loader.ensure(target, { reason: "reactive" })
    expect(calls).toBe(1)

    pending.resolve(response([createRecord(target.sessionID)]))
    await Promise.all([navigation, reactive])

    expect(loader.getSnapshot(target).status).toBe("ready")
    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]?.length).toBe(1)
    loader.dispose()
    childStores.disposeAll()
  })

  test("leaves older history loading to explicit viewport demand", async () => {
    const calls: Array<{ limit?: number; before?: string }> = []
    const { childStores, loader } = createLoader(async ({ sessionID, limit, before }) => {
      calls.push({ limit, before })
      return before
        ? response([createRecord(sessionID, "msg_older", 1)])
        : response([createRecord(sessionID, "msg_latest", 2)], "older-cursor")
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    await loader.ensure(target, { reason: "prefetch" })
    await Promise.resolve()

    expect(calls).toEqual([{ limit: 50, before: undefined }])
    expect(loader.getSnapshot(target).cursor).toBe("older-cursor")

    await loader.loadOlder(target)

    expect(calls).toEqual([
      { limit: 50, before: undefined },
      { limit: 100, before: "older-cursor" },
    ])
    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]?.map((message) => message.id))
      .toEqual(["msg_older", "msg_latest"])
    loader.dispose()
    childStores.disposeAll()
  })

  test("keeps a post-rollover tail after legacy messages for shared runtime identities", async () => {
    const runtimes = ["web", "desktop", "vscode", "mobile"]
    for (const runtimeKey of runtimes) {
      const childStores = new ChildStoreManager()
      const sdk = {
        session: {
          messages: async ({ sessionID }: { sessionID: string }) => response([
            createRecord(sessionID, "msg_000000000000Current", 200),
            createRecord(sessionID, "msg_ffffffffffffLegacy", 100),
          ]),
        },
      } as unknown as OpencodeClient
      const loader = new SessionMessageLoader(childStores, { sdk, runtimeKey })
      const target = { directory: `/repo-${runtimeKey}`, sessionID: "session-a" }

      await loader.ensure(target)

      expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]?.map((message) => message.id))
        .toEqual(["msg_ffffffffffffLegacy", "msg_000000000000Current"])
      loader.dispose()
      childStores.disposeAll()
    }
  })

  test("loads every history page for an explicit complete-history request", async () => {
    const calls: Array<{ before?: string }> = []
    const { childStores, loader } = createLoader(async ({ sessionID, before }) => {
      calls.push({ before })
      if (!before) return response([createRecord(sessionID, "msg_latest")], "cursor-2")
      if (before === "cursor-2") return response([createRecord(sessionID, "msg_middle")], "cursor-1")
      return response([createRecord(sessionID, "msg_oldest")])
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    await loader.loadComplete(target)

    expect(calls).toEqual([
      { before: undefined },
      { before: "cursor-2" },
      { before: "cursor-1" },
    ])
    expect(loader.getSnapshot(target).complete).toBe(true)
    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]).toHaveLength(3)
    loader.dispose()
    childStores.disposeAll()
  })

  test("rejects a complete-history request when its initial load fails", async () => {
    const { childStores, loader } = createLoader(async () => ({
      error: { message: "rejected" },
      response: { status: 400 },
    }))
    const target = { directory: "/repo", sessionID: "session-a" }

    await expect(loader.loadComplete(target)).rejects.toThrow("session.messages failed (400): rejected")

    loader.dispose()
    childStores.disposeAll()
  })

  test("rejects a complete-history request when an older page fails", async () => {
    const { childStores, loader } = createLoader(async ({ sessionID, before }) => before
      ? { error: { message: "older rejected" }, response: { status: 400 } }
      : response([createRecord(sessionID)], "older-cursor"))
    const target = { directory: "/repo", sessionID: "session-a" }

    await expect(loader.loadComplete(target)).rejects.toThrow("session.messages failed (400): older rejected")

    expect(loader.getSnapshot(target).cursor).toBe("older-cursor")
    loader.dispose()
    childStores.disposeAll()
  })

  test("fetches authoritative coverage when renderable messages have no loader metadata", async () => {
    let calls = 0
    const { childStores, loader } = createLoader(async ({ sessionID }) => {
      calls += 1
      return response([createRecord(sessionID)])
    })
    const target = { directory: "/repo", sessionID: "session-a" }
    childStores.ensureChild(target.directory, { bootstrap: false }).setState({
      message: { [target.sessionID]: [createRecord(target.sessionID, "cached").info] },
    })

    await loader.loadComplete(target)

    expect(calls).toBe(1)
    expect(loader.getSnapshot(target).complete).toBe(true)
    loader.dispose()
    childStores.disposeAll()
  })

  test("rejects repeated pagination cursors instead of looping forever", async () => {
    let calls = 0
    const { childStores, loader } = createLoader(async ({ sessionID, before }) => {
      calls += 1
      if (!before) return response([createRecord(sessionID, "latest")], "cursor-a")
      if (before === "cursor-a") return response([createRecord(sessionID, "middle")], "cursor-b")
      return response([createRecord(sessionID, "older")], "cursor-a")
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    await expect(loader.loadComplete(target)).rejects.toThrow("Session history pagination made no progress")

    expect(calls).toBe(3)
    loader.dispose()
    childStores.disposeAll()
  })

  test("runs a requested tail refresh after an older in-flight load", async () => {
    const initial = deferred<ReturnType<typeof response>>()
    const refresh = deferred<ReturnType<typeof response>>()
    let calls = 0
    const limits: number[] = []
    const { childStores, loader } = createLoader(async ({ limit }) => {
      calls += 1
      limits.push(limit ?? 0)
      return calls === 1 ? initial.promise : refresh.promise
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    const loading = loader.ensure(target, { reason: "navigation" })
    const refreshing = loader.refreshTail(target, 30)
    const duplicateRefresh = loader.refreshTail(target, 80)
    expect(calls).toBe(1)
    expect(duplicateRefresh).toBe(refreshing)

    initial.resolve(response([createRecord(target.sessionID, "msg_1")]))
    await loading
    await Promise.resolve()
    expect(calls).toBe(2)
    expect(limits).toEqual([50, 80])

    refresh.resolve(response([createRecord(target.sessionID, "msg_2")]))
    await Promise.all([refreshing, duplicateRefresh])

    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]?.map((message) => message.id))
      .toEqual(["msg_1", "msg_2"])
    loader.dispose()
    childStores.disposeAll()
  })

  test("preserves complete history coverage across a tail refresh", async () => {
    let calls = 0
    const { childStores, loader } = createLoader(async ({ sessionID }) => {
      calls += 1
      return calls === 1
        ? response([createRecord(sessionID, "msg_1")])
        : response([createRecord(sessionID, "msg_2")], "stale-tail-cursor")
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    await loader.ensure(target)
    expect(loader.getSnapshot(target).complete).toBe(true)
    expect(loader.getSnapshot(target).cursor).toBe(undefined)

    await loader.refreshTail(target, 2)

    expect(loader.getSnapshot(target).complete).toBe(true)
    expect(loader.getSnapshot(target).cursor).toBe(undefined)
    loader.dispose()
    childStores.disposeAll()
  })

  test("does not deduplicate identical session IDs across directories", async () => {
    const calls: string[] = []
    const { childStores, loader } = createLoader(async ({ directory, sessionID }) => {
      calls.push(directory ?? "")
      return response([createRecord(sessionID)])
    })

    await Promise.all([
      loader.ensure({ directory: "/repo-a", sessionID: "shared" }),
      loader.ensure({ directory: "/repo-b", sessionID: "shared" }),
    ])

    expect(calls.sort()).toEqual(["/repo-a", "/repo-b"])
    loader.dispose()
    childStores.disposeAll()
  })

  test("loads older history with the selected directory's cursor for duplicate session IDs", async () => {
    const providerDirectory = "/repo/provider"
    const selectedDirectory = "/repo/selected-worktree"
    const sessionID = "shared"
    const calls: Array<{ directory?: string; before?: string }> = []
    const { childStores, loader } = createLoader(async ({ directory, before }) => {
      calls.push({ directory, before })
      return before
        ? response([createRecord(sessionID, `older-${directory}`)])
        : response([createRecord(sessionID, `latest-${directory}`)], `${directory}-cursor`)
    })

    await Promise.all([
      loader.ensure({ directory: providerDirectory, sessionID }),
      loader.ensure({ directory: selectedDirectory, sessionID }),
    ])
    calls.length = 0

    await loader.loadOlder({ directory: selectedDirectory, sessionID })

    expect(calls).toEqual([{
      directory: selectedDirectory,
      before: `${selectedDirectory}-cursor`,
    }])
    loader.dispose()
    childStores.disposeAll()
  })

  test("exposes a retryable error without clearing an existing snapshot", async () => {
    let fail = true
    const { childStores, loader } = createLoader(async ({ sessionID }) => {
      if (fail) return { error: { message: "rejected" }, response: { status: 400 } }
      return response([createRecord(sessionID)])
    })
    const target = { directory: "/repo", sessionID: "session-a" }
    const store = childStores.ensureChild(target.directory, { bootstrap: false })
    store.setState({ message: { [target.sessionID]: [{ id: "cached", sessionID: target.sessionID, role: "user", time: { created: 0 } } as Message] } })

    await loader.ensure(target, { force: true })
    expect(loader.getSnapshot(target).status).toBe("error")
    expect((loader.getSnapshot(target).error as Error & { status?: number }).status).toBe(400)
    expect(store.getState().message[target.sessionID]?.[0]?.id).toBe("cached")

    fail = false
    await loader.ensure(target, { force: true })
    expect(loader.getSnapshot(target).status).toBe("ready")
    loader.dispose()
    childStores.disposeAll()
  })

  test("propagates a zero response status on SDK errors", async () => {
    const { childStores, loader } = createLoader(async () => ({
      error: { message: "network rejected" },
      response: { status: 0 },
    }))
    const target = { directory: "/repo", sessionID: "session-a" }

    await loader.ensure(target, { force: true })

    expect((loader.getSnapshot(target).error as Error & { status?: number }).status).toBe(0)
    loader.dispose()
    childStores.disposeAll()
  })

  test("prevents an evicted in-flight request from repopulating the store", async () => {
    const pending = deferred<ReturnType<typeof response>>()
    const { childStores, loader } = createLoader(async () => pending.promise)
    const target = { directory: "/repo", sessionID: "session-a" }

    const loading = loader.ensure(target)
    loader.invalidateSession(target)
    pending.resolve(response([createRecord(target.sessionID)]))
    await loading

    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]).toBe(undefined)
    expect(loader.getSnapshot(target).status).toBe("idle")
    loader.dispose()
    childStores.disposeAll()
  })

  test("treats an empty successful response as resolved authoritative state", async () => {
    const { childStores, loader } = createLoader(async () => response([]))
    const target = { directory: "/repo", sessionID: "empty" }

    await loader.ensure(target)

    expect(loader.getSnapshot(target).resolved).toBe(true)
    expect(loader.getSnapshot(target).complete).toBe(true)
    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]).toEqual([])
    loader.dispose()
    childStores.disposeAll()
  })

  test("retries a missing message payload instead of treating it as an empty snapshot", async () => {
    let calls = 0
    const { childStores, loader } = createLoader(async ({ sessionID }) => {
      calls += 1
      return calls === 1 ? {} : response([createRecord(sessionID)])
    })
    const target = { directory: "/repo", sessionID: "session-a" }

    await loader.ensure(target)

    expect(calls).toBe(2)
    expect(loader.getSnapshot(target).status).toBe("ready")
    expect(childStores.getChild(target.directory)?.getState().message[target.sessionID]?.length).toBe(1)
    loader.dispose()
    childStores.disposeAll()
  })

  test("reports retries and every downloaded initial expansion record", async () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
    const diagnosticWindow = {
      location: { search: "" },
      localStorage: {
        getItem: (key: string) => key === "openchamber_session_load_perf" ? "1" : null,
      },
    } as unknown as Window
    Object.defineProperty(globalThis, "window", { configurable: true, value: diagnosticWindow })

    const target = { directory: "/repo", sessionID: "session-a" }
    let calls = 0
    const { childStores, loader } = createLoader(async () => {
      calls += 1
      if (calls === 1) return {}
      if (calls === 2) {
        const assistant = createRecord(target.sessionID, "msg_assistant")
        assistant.info = { ...assistant.info, role: "assistant" } as Message
        return response([assistant], "older")
      }
      return response([createRecord(target.sessionID, "msg_user")])
    })

    try {
      await loader.ensure(target)

      const events = diagnosticWindow.__openchamberSessionLoadPerformance?.events ?? []
      const initialEvent = events.find((event) => event.operation === "session-messages.initial")
      const pageEvents = events.filter((event) => event.operation === "session-messages.page")
      expect(calls).toBe(3)
      expect(pageEvents.map((event) => event.requestLimit)).toEqual([50, 100])
      expect(pageEvents.map((event) => event.cursorPresent)).toEqual([false, false])
      expect(pageEvents.map((event) => event.recordCount)).toEqual([1, 1])
      expect(initialEvent?.outcome).toBe("complete")
      expect(initialEvent?.retryCount).toBe(1)
      expect(initialEvent?.recordCount).toBe(2)
      expect("runtimeKey" in initialEvent!).toBe(false)
      expect("directory" in initialEvent!).toBe(false)
      expect("sessionID" in initialEvent!).toBe(false)
    } finally {
      loader.dispose()
      childStores.disposeAll()
      if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow)
      else Reflect.deleteProperty(globalThis, "window")
    }
  })

  test("buffers live Codex events before the snapshot and commits snapshot plus contiguous events atomically", async () => {
    const pending = deferred<CodexProjectionSnapshot>()
    const { childStores, loader } = createCodexLoader(() => pending.promise)
    const target = { directory: "/repo", sessionID: "ses_codex_1" }
    const store = childStores.ensureChild(target.directory, { bootstrap: false })
    let publications = 0
    const unsubscribe = store.subscribe(() => { publications += 1 })

    const loading = loader.ensure(target)
    loader.acceptCodexProjection(target.directory, codexStatusEvent(6, "idle"))
    loader.acceptCodexProjection(target.directory, codexStatusEvent(5, "running"))
    pending.resolve(codexSnapshot(4, "authoritative", "approval-new"))
    await loading

    expect(loader.getCodexRevision(target)).toBe(6)
    expect((store.getState().part.msg_codex_1?.[0] as { text?: string })?.text).toBe("authoritative")
    expect(store.getState().session_status.ses_codex_1).toEqual({ type: "idle" })
    expect(store.getState().permission.ses_codex_1.map((item) => item.id)).toEqual(["approval-new"])
    expect(publications).toBe(1)
    unsubscribe()
    loader.dispose()
    childStores.disposeAll()
  })

  test("replaces a stale cached Codex snapshot and preserves unrelated session references", async () => {
    const { childStores, loader } = createCodexLoader(async () => codexSnapshot(9, "fresh"))
    const target = { directory: "/repo", sessionID: "ses_codex_1" }
    const store = childStores.ensureChild(target.directory, { bootstrap: false })
    const other = [createRecord("ses_other", "msg_other").info]
    store.setState({
      message: {
        [target.sessionID]: [createRecord(target.sessionID, "msg_stale").info],
        ses_other: other,
      },
      permission: { [target.sessionID]: [{ id: "approval-stale", sessionID: target.sessionID } as never] },
    })

    await loader.ensure(target)

    expect(store.getState().message[target.sessionID].map((item) => item.id)).toEqual(["msg_codex_1"])
    expect(store.getState().message.ses_other).toBe(other)
    expect(store.getState().permission[target.sessionID].map((item) => item.id)).toEqual(["approval-current"])
    loader.dispose()
    childStores.disposeAll()
  })

  test("fails closed on a gap or overflow and refetches instead of inventing convergence", async () => {
    const snapshots = [codexSnapshot(3, "first"), codexSnapshot(300, "repaired")]
    let calls = 0
    const { childStores, loader } = createCodexLoader(async () => snapshots[Math.min(calls++, 1)])
    const target = { directory: "/repo", sessionID: "ses_codex_1" }

    await loader.ensure(target)
    loader.acceptCodexProjection(target.directory, codexStatusEvent(5))
    await loader.waitForCodexReconciliation(target)
    expect(calls).toBe(2)
    expect(loader.getCodexRevision(target)).toBe(300)

    const pending = deferred<CodexProjectionSnapshot>()
    loader.setCodexSnapshotFetcher(() => pending.promise)
    loader.reconcileCodexSessions()
    for (let revision = 301; revision <= 557; revision += 1) {
      loader.acceptCodexProjection(target.directory, codexStatusEvent(revision))
    }
    expect(loader.getCodexBufferedEventCount(target) <= 256).toBe(true)
    pending.resolve(codexSnapshot(557, "overflow-repaired"))
    await loader.waitForCodexReconciliation(target)
    expect(loader.getCodexRevision(target)).toBe(557)
    loader.dispose()
    childStores.disposeAll()
  })

  test("bounds repeated gap repair when the authoritative server snapshot cannot converge", async () => {
    let calls = 0
    const { childStores, loader } = createCodexLoader(async () => {
      calls += 1
      return codexSnapshot(3, "still-three")
    })
    const target = { directory: "/repo", sessionID: "ses_codex_1" }

    await loader.ensure(target)
    loader.acceptCodexProjection(target.directory, codexStatusEvent(5))
    await loader.waitForCodexReconciliation(target)

    expect(calls).toBe(3)
    expect(loader.getCodexRevision(target)).toBe(3)
    expect(loader.getSnapshot(target).status).toBe("error")
    expect(loader.getSnapshot(target).error?.message).toContain("did not converge")
    loader.dispose()
    childStores.disposeAll()
  })

  test("preserves the last valid Codex state on snapshot failure and accepts an explicit retry", async () => {
    let fail = true
    const { childStores, loader } = createCodexLoader(async () => {
      if (fail) throw new Error("snapshot unavailable")
      return codexSnapshot(7, "recovered")
    })
    const target = { directory: "/repo", sessionID: "ses_codex_1" }
    const store = childStores.ensureChild(target.directory, { bootstrap: false })
    store.setState({ message: { [target.sessionID]: [createRecord(target.sessionID, "cached").info] } })

    await loader.ensure(target)
    expect(loader.getSnapshot(target).status).toBe("error")
    expect(store.getState().message[target.sessionID]?.[0]?.id).toBe("cached")

    fail = false
    await loader.ensure(target, { force: true })
    expect(loader.getSnapshot(target).status).toBe("ready")
    expect((store.getState().part.msg_codex_1?.[0] as { text?: string })?.text).toBe("recovered")
    loader.dispose()
    childStores.disposeAll()
  })

  test("rejects a stale Codex completion after runtime switch and reloads on close/reopen", async () => {
    const old = deferred<CodexProjectionSnapshot>()
    const { childStores, loader, sdk } = createCodexLoader(() => old.promise)
    const target = { directory: "/repo", sessionID: "ses_codex_1" }
    const loading = loader.ensure(target)

    loader.configure({ sdk, runtimeKey: "runtime-b", fetchCodexSnapshot: async () => codexSnapshot(2, "runtime-b") })
    old.resolve(codexSnapshot(10, "stale-runtime-a"))
    await loading
    expect(childStores.getChild(target.directory)?.getState().part.msg_codex_1).toBe(undefined)

    await loader.ensure(target)
    expect((childStores.getChild(target.directory)?.getState().part.msg_codex_1?.[0] as { text?: string })?.text).toBe("runtime-b")
    loader.dispose()
    const reopened = new SessionMessageLoader(childStores, {
      sdk,
      runtimeKey: "runtime-b",
      fetchCodexSnapshot: async () => codexSnapshot(3, "reopened"),
    })
    await reopened.ensure(target)
    expect(reopened.getCodexRevision(target)).toBe(3)
    expect((childStores.getChild(target.directory)?.getState().part.msg_codex_1?.[0] as { text?: string })?.text).toBe("reopened")
    reopened.dispose()
    childStores.disposeAll()
  })
})

describe("session load performance diagnostics", () => {
  test("rejects unknown raw labels and preserves approved input counts", () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
    const diagnosticWindow = {
      localStorage: {
        getItem: (key: string) => key === "openchamber_session_load_perf" ? "1" : null,
      },
    } as unknown as Window
    Object.defineProperty(globalThis, "window", { configurable: true, value: diagnosticWindow })

    try {
      const finishUnknown = startSessionLoadPerformanceEvent({
        operation: "secret-operation",
        caller: "secret-caller",
        recordCount: 999,
      })
      finishUnknown("complete")
      const finishVisible = startSessionLoadPerformanceEvent({
        operation: "session-messages.visible",
        caller: "selected-session",
        recordCount: 30,
      })
      finishVisible("complete")

      expect(diagnosticWindow.__openchamberSessionLoadPerformance?.events).toHaveLength(1)
      const event = diagnosticWindow.__openchamberSessionLoadPerformance?.events[0]
      expect(event?.operation).toBe("session-messages.visible")
      expect(event?.caller).toBe("selected-session")
      expect(event?.recordCount).toBe(30)
      expect(JSON.stringify(diagnosticWindow.__openchamberSessionLoadPerformance)).not.toContain("secret")
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow)
      else Reflect.deleteProperty(globalThis, "window")
    }
  })

  test("does not schedule visibility work while diagnostics are disabled", () => {
    let requestedFrames = 0
    let visibleMarks = 0
    const tracker = createFirstVisibleSessionPerformanceTracker({
      enabled: () => false,
      requestFrame: () => {
        requestedFrames += 1
        return 1
      },
      cancelFrame: () => undefined,
      markVisible: () => {
        visibleMarks += 1
      },
    })

    tracker.schedule("session-a", 10)

    expect(requestedFrames).toBe(0)
    expect(visibleMarks).toBe(0)
  })

  test("reschedules an identity when its pending visibility frame was canceled", () => {
    let nextFrame = 0
    const frames = new Map<number, FrameRequestCallback>()
    const marks: string[] = []
    const tracker = createFirstVisibleSessionPerformanceTracker({
      enabled: () => true,
      requestFrame: (callback) => {
        nextFrame += 1
        frames.set(nextFrame, callback)
        return nextFrame
      },
      cancelFrame: (frame) => {
        frames.delete(frame)
      },
      markVisible: () => marks.push("visible"),
      startEvent: () => () => undefined,
    })

    const cancelFirstA = tracker.schedule("session-a", 10)
    cancelFirstA()
    const cancelB = tracker.schedule("session-b", 10)
    cancelB()
    tracker.schedule("session-a", 10)
    frames.get(3)?.(0)

    expect(marks).toEqual(["visible"])
  })

  test("does not remeasure a completed identity after another session", () => {
    let nextFrame = 0
    const frames = new Map<number, FrameRequestCallback>()
    const marks: string[] = []
    const tracker = createFirstVisibleSessionPerformanceTracker({
      enabled: () => true,
      requestFrame: (callback) => {
        nextFrame += 1
        frames.set(nextFrame, callback)
        return nextFrame
      },
      cancelFrame: (frame) => {
        frames.delete(frame)
      },
      markVisible: () => marks.push("visible"),
      startEvent: () => () => undefined,
    })

    tracker.schedule("session-a", 10)
    frames.get(1)?.(0)
    tracker.schedule("session-b", 10)
    frames.get(2)?.(0)
    tracker.schedule("session-a", 10)

    expect(nextFrame).toBe(2)
    expect(marks).toEqual(["visible", "visible"])
  })
})
