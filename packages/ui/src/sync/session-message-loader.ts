import type { Message, OpencodeClient, Part } from "@opencode-ai/sdk/v2/client"
import type { ChildStoreManager, DirectoryStore } from "./child-store"
import { retry } from "./retry"
import { mergeOptimisticPage, type OptimisticItem } from "./optimistic"
import { findMessageIndex, insertMessageChronologically, sortMessagesChronologically } from "./message-ordering"
import { stripMessageDiffSnapshots } from "./sanitize"
import { getSessionMaterializationStatus, materializeSessionSnapshots } from "./materialization"
import {
  clearDirectorySessionPrefetch,
  clearRuntimeSessionPrefetch,
  clearSessionPrefetch,
  getSessionPrefetch,
  setSessionPrefetch,
} from "./session-prefetch-cache"
import { isVSCodeRuntime } from "@/lib/desktop"
import { isMobileSurfaceRuntime } from "@/lib/runtimeSurface"
import { normalizePath } from "@/lib/pathNormalization"
import { startSessionLoadPerformanceEvent } from "./session-load-performance"
import { fetchCodexProjectionSnapshot } from "./bootstrap"
import {
  applyCodexProjectionEvents,
  applyCodexProjectionSnapshot,
  type CodexProjectionEvent,
  type CodexProjectionSnapshot,
} from "./event-reducer"

const SKIP_PARTS = new Set(["patch", "step-start", "step-finish"])
const INITIAL_MESSAGE_PAGE_SIZE = 50
const CONSTRAINED_INITIAL_MESSAGE_PAGE_SIZE = 30
const HISTORY_MESSAGE_PAGE_SIZE = 100
const INITIAL_PAGE_EXPANSION_LIMITS = [100, 150] as const
const CONSTRAINED_INITIAL_PAGE_EXPANSION_LIMITS = [50, 80, 120] as const
const CODEX_EVENT_BUFFER_LIMIT = 256
const CODEX_REPAIR_ATTEMPT_LIMIT = 2

export type SessionMessageTarget = {
  directory: string
  sessionID: string
}

export type SessionMessageLoadKind = "initial" | "older" | "refresh" | "prefetch"
export type SessionMessageLoadStatus = "idle" | "loading" | "ready" | "error"

export type SessionMessageLoadState = {
  status: SessionMessageLoadStatus
  loadingKind: SessionMessageLoadKind | null
  error: Error | null
  resolved: boolean
  limit: number
  cursor: string | undefined
  complete: boolean
  generation: number
  updatedAt: number | undefined
}

type LoaderEntry = {
  target: SessionMessageTarget
  snapshot: SessionMessageLoadState
  listeners: Set<() => void>
  inflight: Promise<void> | null
  queuedRefresh: Promise<void> | null
  queuedRefreshLimit: number
  optimistic: Map<string, OptimisticItem>
  codexRevision: number
  codexBuffer: CodexProjectionEvent[]
  codexNeedsResync: boolean
  codexRequiredRevision: number
  codexRepairAttempts: number
}

type FetchedPage = {
  session: Message[]
  partsByMessageID: Map<string, Part[]>
  cursor: string | undefined
  complete: boolean
}

type LoadPerformanceDetails = {
  retryCount: number
  recordCount: number
}

type LoaderConfiguration = {
  sdk: OpencodeClient
  runtimeKey: string
  fetchCodexSnapshot?: (target: SessionMessageTarget) => Promise<CodexProjectionSnapshot>
}

const isConstrainedRuntime = () => isVSCodeRuntime() || isMobileSurfaceRuntime()
const getInitialPageSize = () => isConstrainedRuntime()
  ? CONSTRAINED_INITIAL_MESSAGE_PAGE_SIZE
  : INITIAL_MESSAGE_PAGE_SIZE
const getInitialExpansionLimits = () => isConstrainedRuntime()
  ? CONSTRAINED_INITIAL_PAGE_EXPANSION_LIMITS
  : INITIAL_PAGE_EXPANSION_LIMITS

const isUserMessage = (message: Message): boolean => {
  const candidate = message as Message & { clientRole?: unknown; role?: unknown }
  const role = typeof candidate.clientRole === "string" ? candidate.clientRole : candidate.role
  return role === "user"
}

const hasUserMessage = (messages: Message[]): boolean => messages.some(isUserMessage)

const formatSdkError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message) return message
  }
  return "Session messages could not be loaded"
}

const assertSdkSuccess = (result: {
  error?: unknown
  response?: { status?: number }
}, operation: string): void => {
  if (!result.error) return
  const status = result.response?.status
  const message = `${operation} failed${status ? ` (${status})` : ""}: ${formatSdkError(result.error)}`
  const error = new Error(message) as Error & { status?: number }
  if (status !== undefined) error.status = status
  throw error
}

const filterIdentifiedParts = (parts: Part[]): Part[] => parts
  .filter((part) => Boolean(part?.id))

const createDefaultState = (generation = 0): SessionMessageLoadState => ({
  status: "idle",
  loadingKind: null,
  error: null,
  resolved: false,
  limit: getInitialPageSize(),
  cursor: undefined,
  complete: false,
  generation,
  updatedAt: undefined,
})

export const EMPTY_SESSION_MESSAGE_LOAD_STATE = createDefaultState()

export class SessionMessageLoader {
  private sdk: OpencodeClient
  private runtimeKey: string
  private sdkEpoch = 0
  private fetchCodexSnapshot: (target: SessionMessageTarget) => Promise<CodexProjectionSnapshot>
  private disposed = false
  private readonly entries = new Map<string, LoaderEntry>()

  constructor(
    private readonly childStores: ChildStoreManager,
    configuration: LoaderConfiguration,
  ) {
    this.sdk = configuration.sdk
    this.runtimeKey = configuration.runtimeKey
    this.fetchCodexSnapshot = configuration.fetchCodexSnapshot ?? fetchCodexProjectionSnapshot
  }

  configure(configuration: LoaderConfiguration): void {
    const nextFetcher = configuration.fetchCodexSnapshot ?? this.fetchCodexSnapshot
    if (this.sdk === configuration.sdk && this.runtimeKey === configuration.runtimeKey && this.fetchCodexSnapshot === nextFetcher) return
    const runtimeChanged = this.runtimeKey !== configuration.runtimeKey
    const previousRuntimeKey = this.runtimeKey
    this.sdk = configuration.sdk
    this.runtimeKey = configuration.runtimeKey
    this.fetchCodexSnapshot = nextFetcher
    this.sdkEpoch += 1
    for (const entry of this.entries.values()) {
      entry.snapshot = {
        ...entry.snapshot,
        status: entry.snapshot.resolved ? "ready" : "idle",
        loadingKind: null,
        error: null,
        generation: entry.snapshot.generation + 1,
      }
      entry.inflight = null
      this.notify(entry)
    }
    if (runtimeChanged) {
      this.entries.clear()
      clearRuntimeSessionPrefetch(previousRuntimeKey)
    }
  }

  /**
   * Re-enable a loader which was disposed by a transient React effect cleanup.
   *
   * React Strict Mode runs effect setup, cleanup, then setup again in
   * development. The provider owns one ref-stable loader across that sequence,
   * so the second setup must be able to accept new work after the first cleanup
   * invalidated its in-flight requests.
   */
  activate(): void {
    this.disposed = false
  }

  ensure(
    target: SessionMessageTarget,
    options?: { force?: boolean; reason?: "navigation" | "reactive" | "prefetch" },
  ): Promise<void> {
    const normalized = this.normalizeTarget(target)
    if (!normalized || this.disposed) return Promise.resolve()
    if (this.isCodexTarget(normalized)) return this.ensureCodex(normalized, options?.force === true)
    const entry = this.getEntry(normalized)
    const store = this.childStores.ensureChild(normalized.directory, { bootstrap: false })
    const materialization = getSessionMaterializationStatus(store.getState(), normalized.sessionID)
    if (!options?.force && materialization.renderable) {
      if (!entry.snapshot.resolved) {
        this.patchEntry(entry, {
          status: "ready",
          error: null,
          resolved: true,
          limit: Math.max(entry.snapshot.limit, store.getState().message[normalized.sessionID]?.length ?? 0),
        })
      }
      return entry.inflight ?? Promise.resolve()
    }
    if (entry.inflight) {
      if (options?.reason !== "prefetch" && entry.snapshot.loadingKind === "prefetch") {
        this.patchEntry(entry, { loadingKind: "initial" })
      }
      return entry.inflight
    }
    if (options?.force) this.bumpGeneration(entry)
    const kind: SessionMessageLoadKind = options?.reason === "prefetch" ? "prefetch" : "initial"
    return this.startLoad(normalized, entry, store, kind, async (isCurrent, performance) => {
      await this.loadInitial(normalized, entry, store, isCurrent, performance)
    })
  }

  prefetch(target: SessionMessageTarget): Promise<void> {
    return this.ensure(target, { reason: "prefetch" })
  }

  loadOlder(target: SessionMessageTarget): Promise<void> {
    const normalized = this.normalizeTarget(target)
    if (!normalized || this.disposed) return Promise.resolve()
    if (this.isCodexTarget(normalized)) return this.ensureCodex(normalized, false)
    const entry = this.getEntry(normalized)
    if (entry.inflight) return entry.inflight.then(() => this.loadOlder(normalized))
    if (entry.snapshot.complete || !entry.snapshot.cursor) return Promise.resolve()
    const store = this.childStores.ensureChild(normalized.directory, { bootstrap: false })
    const cursor = entry.snapshot.cursor
    return this.startLoad(normalized, entry, store, "older", async (isCurrent, performance) => {
      const page = await this.fetchPage(normalized, HISTORY_MESSAGE_PAGE_SIZE, cursor, "older", performance)
      if (!isCurrent()) return
      const committed = this.commitPage(normalized, entry, store, page, "prepend", isCurrent)
      if (!committed || !isCurrent()) return
      this.patchEntry(entry, {
        status: "ready",
        loadingKind: null,
        error: null,
        resolved: true,
        limit: Math.max(entry.snapshot.limit, committed.messages.length),
        cursor: page.cursor,
        complete: page.complete,
        updatedAt: Date.now(),
      })
      this.persistCoverage(normalized, entry.snapshot)
    })
  }

  async loadComplete(target: SessionMessageTarget): Promise<void> {
    const normalized = this.normalizeTarget(target)
    if (!normalized || this.disposed) throw new Error("Session message loader is unavailable")
    if (this.isCodexTarget(normalized)) {
      await this.ensureCodex(normalized, false)
      const snapshot = this.getSnapshot(normalized)
      if (snapshot.status === "error") throw snapshot.error ?? new Error("Codex projection could not be loaded")
      return
    }
    const initial = this.getSnapshot(normalized)
    await this.ensure(normalized, { force: !initial.resolved })

    const visitedCursors = new Set<string>()
    while (true) {
      const snapshot = this.getSnapshot(normalized)
      if (snapshot.status === "error") throw snapshot.error ?? new Error("Session history could not be loaded")
      if (snapshot.complete) return
      if (!snapshot.cursor) throw new Error("Session history coverage is unresolved")
      if (visitedCursors.has(snapshot.cursor)) {
        throw new Error("Session history pagination made no progress")
      }
      visitedCursors.add(snapshot.cursor)

      await this.loadOlder(normalized)
    }
  }

  refreshTail(target: SessionMessageTarget, limit: number): Promise<void> {
    const normalized = this.normalizeTarget(target)
    if (!normalized || this.disposed) return Promise.resolve()
    if (this.isCodexTarget(normalized)) return this.ensureCodex(normalized, true)
    const entry = this.getEntry(normalized)
    if (entry.inflight) {
      entry.queuedRefreshLimit = Math.max(entry.queuedRefreshLimit, limit)
      if (entry.queuedRefresh) return entry.queuedRefresh
      const inflight = entry.inflight
      const entryKey = this.keyFor(normalized)
      const generation = entry.snapshot.generation
      const sdkEpoch = this.sdkEpoch
      const clearQueuedRefresh = () => {
        if (entry.queuedRefresh !== queuedRefresh) return
        entry.queuedRefresh = null
        entry.queuedRefreshLimit = 0
      }
      const queuedRefresh = inflight.then(() => {
        if (
          this.disposed
          || this.sdkEpoch !== sdkEpoch
          || entry.snapshot.generation !== generation
          || this.entries.get(entryKey) !== entry
        ) {
          clearQueuedRefresh()
          return
        }
        const refreshLimit = entry.queuedRefreshLimit
        clearQueuedRefresh()
        return this.refreshTail(normalized, refreshLimit)
      })
      entry.queuedRefresh = queuedRefresh
      return queuedRefresh
    }
    const store = this.childStores.ensureChild(normalized.directory, { bootstrap: false })
    this.bumpGeneration(entry)
    return this.startLoad(normalized, entry, store, "refresh", async (isCurrent, performance) => {
      const previousCoverage = entry.snapshot.resolved
        ? { cursor: entry.snapshot.cursor, complete: entry.snapshot.complete }
        : null
      const page = await this.fetchPage(normalized, Math.max(1, limit), undefined, "refresh", performance)
      if (!isCurrent()) return
      const committed = this.commitPage(normalized, entry, store, page, "merge", isCurrent)
      if (!committed || !isCurrent()) return
      const coverage = previousCoverage ?? page
      this.patchEntry(entry, {
        status: "ready",
        loadingKind: null,
        error: null,
        resolved: true,
        limit: Math.max(entry.snapshot.limit, committed.messages.length),
        // A tail refresh uses a deliberately small window. Its cursor only
        // describes that window, so it must not replace the established
        // history coverage and spuriously expose "load older".
        cursor: coverage.cursor,
        complete: coverage.complete,
        updatedAt: Date.now(),
      })
      this.persistCoverage(normalized, entry.snapshot)
    })
  }

  getSnapshot(target: SessionMessageTarget): SessionMessageLoadState {
    const normalized = this.normalizeTarget(target)
    return normalized ? this.getEntry(normalized).snapshot : EMPTY_SESSION_MESSAGE_LOAD_STATE
  }

  subscribe(target: SessionMessageTarget, listener: () => void): () => void {
    const normalized = this.normalizeTarget(target)
    if (!normalized) return () => undefined
    const entry = this.getEntry(normalized)
    entry.listeners.add(listener)
    return () => entry.listeners.delete(listener)
  }

  acceptCodexProjection(directory: string, event: CodexProjectionEvent): void {
    const target = this.resolveCodexTarget(directory, event.sessionID)
    if (!target || this.disposed) return
    const entry = this.getEntry(target)
    if (event.revision <= entry.codexRevision) return
    if (entry.inflight || !entry.snapshot.resolved) {
      this.bufferCodexEvent(entry, event)
      return
    }
    if (event.revision !== entry.codexRevision + 1) {
      entry.codexRequiredRevision = Math.max(entry.codexRequiredRevision, event.revision)
      this.requestCodexResync(entry)
      return
    }
    this.commitCodexState(entry, null, [event])
    entry.codexRevision = event.revision
  }

  rejectCodexProjection(directory: string, sessionID?: string, revision?: number): void {
    const target = sessionID ? this.resolveCodexTarget(directory, sessionID) : null
    const entries = target ? [this.getEntry(target)] : [...this.entries.values()].filter((entry) =>
      this.isCodexTarget(entry.target) && (directory === "global" || entry.target.directory === normalizePath(directory)))
    for (const entry of entries) {
      if (revision !== undefined) entry.codexRequiredRevision = Math.max(entry.codexRequiredRevision, revision)
      this.requestCodexResync(entry)
    }
  }

  reconcileCodexSessions(): void {
    for (const entry of this.entries.values()) {
      if (!this.isCodexTarget(entry.target)) continue
      if (!entry.snapshot.resolved && !this.childStores.getChild(entry.target.directory)) continue
      this.requestCodexResync(entry)
    }
  }

  getCodexRevision(target: SessionMessageTarget): number {
    const normalized = this.normalizeTarget(target)
    return normalized ? this.getEntry(normalized).codexRevision : 0
  }

  getCodexBufferedEventCount(target: SessionMessageTarget): number {
    const normalized = this.normalizeTarget(target)
    return normalized ? this.getEntry(normalized).codexBuffer.length : 0
  }

  setCodexSnapshotFetcher(fetcher: (target: SessionMessageTarget) => Promise<CodexProjectionSnapshot>): void {
    this.fetchCodexSnapshot = fetcher
  }

  async waitForCodexReconciliation(target: SessionMessageTarget): Promise<void> {
    const normalized = this.normalizeTarget(target)
    if (!normalized) return
    const entry = this.getEntry(normalized)
    for (let count = 0; count < 10; count += 1) {
      if (entry.inflight) await entry.inflight
      if (!entry.codexNeedsResync && !entry.inflight) return
      await Promise.resolve()
    }
    throw new Error("Codex reconciliation did not settle")
  }

  optimisticAdd(input: SessionMessageTarget & { message: Message; parts: Part[] }): void {
    const target = this.normalizeTarget(input)
    if (!target) return
    const entry = this.getEntry(target)
    entry.optimistic.set(input.message.id, { message: input.message, parts: filterIdentifiedParts(input.parts) })
    const store = this.childStores.ensureChild(target.directory, { bootstrap: false })
    const current = store.getState()
    const messages = current.message[target.sessionID] ? [...current.message[target.sessionID]] : []
    if (findMessageIndex(messages, input.message.id) < 0) {
      insertMessageChronologically(messages, input.message)
    }
    store.setState({
      message: { ...current.message, [target.sessionID]: messages },
      part: { ...current.part, [input.message.id]: filterIdentifiedParts(input.parts) },
    })
  }

  optimisticRemove(input: SessionMessageTarget & { messageID: string }): void {
    const target = this.normalizeTarget(input)
    if (!target) return
    const entry = this.getEntry(target)
    entry.optimistic.delete(input.messageID)
    const store = this.childStores.ensureChild(target.directory, { bootstrap: false })
    const current = store.getState()
    const existing = current.message[target.sessionID]
    const messages = existing ? existing.filter((message) => message.id !== input.messageID) : undefined
    const part = { ...current.part }
    delete part[input.messageID]
    store.setState({
      ...(messages ? { message: { ...current.message, [target.sessionID]: messages } } : {}),
      part,
    })
  }

  optimisticConfirm(input: SessionMessageTarget & { messageID: string }): void {
    const target = this.normalizeTarget(input)
    if (!target) return
    this.getEntry(target).optimistic.delete(input.messageID)
  }

  invalidateSession(target: SessionMessageTarget): void {
    const normalized = this.normalizeTarget(target)
    if (!normalized) return
    const entry = this.entries.get(this.keyFor(normalized))
    if (!entry) return
    this.bumpGeneration(entry)
    entry.inflight = null
    entry.optimistic.clear()
    entry.snapshot = createDefaultState(entry.snapshot.generation)
    clearSessionPrefetch(normalized.directory, [normalized.sessionID], this.runtimeKey)
    this.notify(entry)
  }

  invalidateDirectory(directory: string): void {
    const normalizedDirectory = normalizePath(directory)
    if (!normalizedDirectory) return
    const prefix = `${this.runtimeKey}\n${normalizedDirectory}\n`
    clearDirectorySessionPrefetch(normalizedDirectory, this.runtimeKey)
    for (const [key, entry] of this.entries) {
      if (!key.startsWith(prefix)) continue
      this.bumpGeneration(entry)
      entry.inflight = null
      entry.optimistic.clear()
      this.entries.delete(key)
      this.notify(entry)
    }
  }

  dispose(): void {
    this.disposed = true
    this.sdkEpoch += 1
    for (const entry of this.entries.values()) {
      this.bumpGeneration(entry)
      entry.inflight = null
      entry.optimistic.clear()
      this.notify(entry)
    }
    this.entries.clear()
    clearRuntimeSessionPrefetch(this.runtimeKey)
  }

  private normalizeTarget(target: SessionMessageTarget): SessionMessageTarget | null {
    const directory = normalizePath(target.directory)
    if (!directory || !target.sessionID) return null
    return { directory, sessionID: target.sessionID }
  }

  private keyFor(target: SessionMessageTarget): string {
    return `${this.runtimeKey}\n${target.directory}\n${target.sessionID}`
  }

  private getEntry(target: SessionMessageTarget): LoaderEntry {
    const key = this.keyFor(target)
    const existing = this.entries.get(key)
    if (existing) return existing
    const prefetched = getSessionPrefetch(target.directory, target.sessionID, this.runtimeKey)
    const entry: LoaderEntry = {
      target,
      snapshot: prefetched
        ? {
            ...createDefaultState(),
            status: "ready",
            resolved: true,
            limit: prefetched.limit,
            cursor: prefetched.cursor,
            complete: prefetched.complete,
            updatedAt: prefetched.at,
          }
        : createDefaultState(),
      listeners: new Set(),
      inflight: null,
      queuedRefresh: null,
      queuedRefreshLimit: 0,
      optimistic: new Map(),
      codexRevision: 0,
      codexBuffer: [],
      codexNeedsResync: false,
      codexRequiredRevision: 0,
      codexRepairAttempts: 0,
    }
    this.entries.set(key, entry)
    return entry
  }

  private patchEntry(entry: LoaderEntry, patch: Partial<SessionMessageLoadState>): void {
    entry.snapshot = { ...entry.snapshot, ...patch }
    this.notify(entry)
  }

  private bumpGeneration(entry: LoaderEntry): number {
    const generation = entry.snapshot.generation + 1
    entry.snapshot = { ...entry.snapshot, generation }
    return generation
  }

  private notify(entry: LoaderEntry): void {
    for (const listener of entry.listeners) listener()
  }

  private isCodexTarget(target: SessionMessageTarget): boolean {
    return target.sessionID.startsWith("ses_codex_")
  }

  private resolveCodexTarget(directory: string, sessionID: string): SessionMessageTarget | null {
    const normalizedDirectory = directory === "global" ? null : normalizePath(directory)
    if (normalizedDirectory) return { directory: normalizedDirectory, sessionID }
    const matches = [...this.entries.values()].filter((entry) => entry.target.sessionID === sessionID)
    return matches.length === 1 ? matches[0].target : null
  }

  private bufferCodexEvent(entry: LoaderEntry, event: CodexProjectionEvent): void {
    if (entry.codexBuffer.length >= CODEX_EVENT_BUFFER_LIMIT) {
      entry.codexBuffer.length = 0
      entry.codexRequiredRevision = Math.max(entry.codexRequiredRevision, event.revision)
      this.requestCodexResync(entry)
      return
    }
    entry.codexBuffer.push(event)
  }

  private requestCodexResync(entry: LoaderEntry): void {
    if (!entry.codexNeedsResync) entry.codexRepairAttempts = 0
    entry.codexNeedsResync = true
    if (entry.inflight || this.disposed) return
    void this.ensureCodex(entry.target, true)
  }

  private ensureCodex(target: SessionMessageTarget, force: boolean): Promise<void> {
    const entry = this.getEntry(target)
    if (entry.inflight) return entry.inflight
    if (!force && entry.snapshot.resolved && !entry.codexNeedsResync) return Promise.resolve()
    entry.codexNeedsResync = false
    if (force) entry.codexRepairAttempts += 1
    const store = this.childStores.ensureChild(target.directory, { bootstrap: false })
    if (force) this.bumpGeneration(entry)
    const load = this.startLoad(target, entry, store, force ? "refresh" : "initial", async (isCurrent) => {
      const snapshot = await this.fetchCodexSnapshot(target)
      if (!isCurrent()) return
      if (snapshot.sessionID !== target.sessionID || snapshot.revision < entry.codexRevision) {
        entry.codexRequiredRevision = Math.max(entry.codexRequiredRevision, entry.codexRevision)
        throw new Error("Codex projection snapshot revision is stale")
      }

      const ordered = [...entry.codexBuffer].sort((left, right) => left.revision - right.revision)
      const contiguous: CodexProjectionEvent[] = []
      let revision = snapshot.revision
      let gapRevision = 0
      for (const event of ordered) {
        if (event.revision <= revision) continue
        if (event.revision !== revision + 1) {
          gapRevision = event.revision
          break
        }
        contiguous.push(event)
        revision = event.revision
      }
      entry.codexBuffer.length = 0
      if (gapRevision > 0) entry.codexRequiredRevision = Math.max(entry.codexRequiredRevision, gapRevision)
      this.commitCodexState(entry, snapshot, contiguous)
      entry.codexRevision = revision
      if (entry.codexRevision >= entry.codexRequiredRevision) entry.codexRequiredRevision = 0
      entry.codexNeedsResync = entry.codexRequiredRevision > entry.codexRevision
      if (!entry.codexNeedsResync) entry.codexRepairAttempts = 0
      this.patchEntry(entry, {
        status: "ready",
        loadingKind: null,
        error: null,
        resolved: true,
        limit: snapshot.messages.length,
        cursor: undefined,
        complete: true,
        updatedAt: Date.now(),
      })
    })
    return load.finally(() => {
      if (entry.codexNeedsResync && entry.codexRepairAttempts >= CODEX_REPAIR_ATTEMPT_LIMIT) {
        entry.codexNeedsResync = false
        this.patchEntry(entry, {
          status: "error",
          loadingKind: null,
          error: new Error("Codex projection reconciliation did not converge"),
        })
        return
      }
      if (entry.codexNeedsResync && !this.disposed) queueMicrotask(() => {
        if (entry.codexNeedsResync && !entry.inflight) void this.ensureCodex(entry.target, true)
      })
    })
  }

  private commitCodexState(
    entry: LoaderEntry,
    snapshot: CodexProjectionSnapshot | null,
    events: readonly CodexProjectionEvent[],
  ): void {
    const store = this.childStores.getChild(entry.target.directory)
    if (!store) return
    store.setState((current) => {
      const draft: DirectoryStore = {
        ...current,
        message: { ...current.message },
        part: { ...current.part },
        session_status: { ...current.session_status },
        session_diff: { ...current.session_diff },
        permission: { ...current.permission },
      }
      const snapshotChanged = snapshot ? applyCodexProjectionSnapshot(draft, snapshot) : false
      const eventResult = applyCodexProjectionEvents(
        draft,
        events,
        { [entry.target.sessionID]: snapshot?.revision ?? entry.codexRevision },
      )
      return snapshotChanged || eventResult.changed ? draft : current
    })
  }

  private startLoad(
    target: SessionMessageTarget,
    entry: LoaderEntry,
    store: { getState: () => DirectoryStore; setState: DirectoryStoreSetter },
    kind: SessionMessageLoadKind,
    run: (isCurrent: () => boolean, performance: LoadPerformanceDetails) => Promise<void>,
  ): Promise<void> {
    const generation = entry.snapshot.generation
    const sdkEpoch = this.sdkEpoch
    const finishPerformanceEvent = startSessionLoadPerformanceEvent({
      operation: kind === "prefetch" ? "session-prefetch" : `session-messages.${kind}`,
      caller: kind,
    })
    const isCurrent = () => (
      !this.disposed
      && this.sdkEpoch === sdkEpoch
      && entry.snapshot.generation === generation
      && this.childStores.getChild(target.directory) === store
    )
    const performance = { retryCount: 0, recordCount: 0 }
    this.patchEntry(entry, { status: "loading", loadingKind: kind, error: null })
    let loadPromise: Promise<void>
    try {
      loadPromise = run(isCurrent, performance)
    } catch (error) {
      loadPromise = Promise.reject(error)
    }
    const promise = loadPromise
      .then(() => finishPerformanceEvent(isCurrent() ? "complete" : "stale", performance))
      .catch((error: unknown) => {
        if (!isCurrent()) {
          finishPerformanceEvent("stale", performance)
          return
        }
        finishPerformanceEvent("error", performance)
        this.patchEntry(entry, {
          status: "error",
          loadingKind: null,
          error: error instanceof Error ? error : new Error(formatSdkError(error)),
        })
      })
      .finally(() => {
        if (entry.inflight === promise) entry.inflight = null
      })
    entry.inflight = promise
    return promise
  }

  private async loadInitial(
    target: SessionMessageTarget,
    entry: LoaderEntry,
    store: { getState: () => DirectoryStore; setState: DirectoryStoreSetter },
    isCurrent: () => boolean,
    performance?: LoadPerformanceDetails,
  ): Promise<void> {
    const storeMessageCount = store.getState().message[target.sessionID]?.length ?? 0
    const firstLimit = Math.max(entry.snapshot.limit, storeMessageCount, getInitialPageSize())
    const firstPage = await this.fetchPage(target, firstLimit, undefined, "initial-page", performance)
    if (!isCurrent()) return
    const deferFirstCommit = !firstPage.complete && !hasUserMessage(firstPage.session)
    let committed = deferFirstCommit
      ? { messages: firstPage.session }
      : this.commitPage(target, entry, store, firstPage, "merge", isCurrent)
    let acceptedPage = firstPage

    if (deferFirstCommit) {
      for (const limit of getInitialExpansionLimits()) {
        if (limit <= firstLimit || !isCurrent()) continue
        const expandedPage = await this.fetchPage(target, limit, undefined, "initial-page", performance)
        if (!isCurrent()) return
        acceptedPage = expandedPage
        const boundaryFound = hasUserMessage(expandedPage.session)
        const isLast = limit === getInitialExpansionLimits()[getInitialExpansionLimits().length - 1]
        if (expandedPage.complete || boundaryFound || isLast) {
          committed = this.commitPage(target, entry, store, expandedPage, "merge", isCurrent)
        } else {
          committed = { messages: expandedPage.session }
        }
        if (expandedPage.complete || boundaryFound) break
      }
    }

    if (!committed || !isCurrent()) return
    this.patchEntry(entry, {
      status: "ready",
      loadingKind: null,
      error: null,
      resolved: true,
      limit: committed.messages.length,
      cursor: acceptedPage.cursor,
      complete: acceptedPage.complete,
      updatedAt: Date.now(),
    })
    this.persistCoverage(target, entry.snapshot)
  }

  private async fetchPage(
    target: SessionMessageTarget,
    limit: number,
    before?: string,
    caller: "initial-page" | "older" | "refresh" = "initial-page",
    performance?: LoadPerformanceDetails,
  ): Promise<FetchedPage> {
    const finishPagePerformance = startSessionLoadPerformanceEvent({
      operation: "session-messages.page",
      caller,
      requestLimit: limit,
      cursorPresent: before !== undefined,
    })
    let attempts = 0
    let recordCount = 0
    try {
      const result = await retry(async () => {
        attempts += 1
        const response = await this.sdk.session.messages({
          sessionID: target.sessionID,
          directory: target.directory,
          limit,
          before,
        })
        assertSdkSuccess(response, "session.messages")
        const data = response.data
        if (!Array.isArray(data)) {
          const error = new Error("session.messages returned no data") as Error & { status?: number }
          error.status = 503
          throw error
        }
        return { data, response: response.response }
      })
      const records = result.data.filter((record: { info?: { id?: string } }) => Boolean(record?.info?.id))
      recordCount = records.length
      if (performance) performance.recordCount += recordCount
      const session = sortMessagesChronologically(
        records.map((record: { info: Message }) => stripMessageDiffSnapshots(record.info)),
      )
      const partsByMessageID = new Map<string, Part[]>()
      for (const record of records as Array<{ info: { id: string }; parts?: Part[] }>) {
        partsByMessageID.set(record.info.id, filterIdentifiedParts(record.parts ?? []))
      }
      const cursor = result.response?.headers?.get?.("x-next-cursor") ?? undefined
      finishPagePerformance("complete", { retryCount: Math.max(0, attempts - 1), recordCount })
      return { session, partsByMessageID, cursor, complete: !cursor }
    } catch (error) {
      finishPagePerformance("error", { retryCount: Math.max(0, attempts - 1), recordCount })
      throw error
    } finally {
      if (performance) performance.retryCount += Math.max(0, attempts - 1)
    }
  }

  private commitPage(
    target: SessionMessageTarget,
    entry: LoaderEntry,
    store: { getState: () => DirectoryStore; setState: DirectoryStoreSetter },
    page: FetchedPage,
    mode: "merge" | "prepend",
    isCurrent: () => boolean,
  ): { messages: Message[] } | null {
    if (!isCurrent()) return null
    const merged = mergeOptimisticPage({
      session: page.session,
      part: [...page.partsByMessageID].map(([id, part]) => ({ id, part })),
      cursor: page.cursor,
      complete: page.complete,
    }, [...entry.optimistic.values()])
    for (const messageID of merged.confirmed) entry.optimistic.delete(messageID)
    const mergedPartsByMessageID = new Map(merged.part.map((candidate) => [candidate.id, candidate.part] as const))
    const materialized = materializeSessionSnapshots(
      store.getState(),
      target.sessionID,
      merged.session.map((info) => ({
        info,
        parts: page.partsByMessageID.get(info.id)
          ?? mergedPartsByMessageID.get(info.id)
          ?? [],
      })),
      { skipPartTypes: SKIP_PARTS, mode },
    )
    if (!isCurrent()) return null
    if (materialized.messagesChanged || materialized.partsChanged) {
      store.setState({
        ...(materialized.messagesChanged ? { message: materialized.message } : {}),
        ...(materialized.partsChanged ? { part: materialized.part } : {}),
      })
    }
    return { messages: materialized.messages }
  }

  private persistCoverage(target: SessionMessageTarget, state: SessionMessageLoadState): void {
    setSessionPrefetch({
      directory: target.directory,
      sessionID: target.sessionID,
      limit: state.limit,
      cursor: state.cursor,
      complete: state.complete,
      at: state.updatedAt,
      runtimeKey: this.runtimeKey,
    })
  }
}

type DirectoryStoreSetter = (
  partial: Partial<DirectoryStore> | ((state: DirectoryStore) => Partial<DirectoryStore> | DirectoryStore),
) => void

let imperativeLoader: SessionMessageLoader | null = null

export function setImperativeSessionMessageLoader(loader: SessionMessageLoader | null): void {
  imperativeLoader = loader
}

export function getImperativeSessionMessageLoader(): SessionMessageLoader | null {
  return imperativeLoader
}
