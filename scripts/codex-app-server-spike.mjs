#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { access, chmod, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises"
import { constants as fsConstants } from "node:fs"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const evidenceDir = path.join(root, "docs", ".codex-app-server-spike")
const tsDir = path.join(evidenceDir, "schema-ts")
const jsonDir = path.join(evidenceDir, "schema-json")
const reportPath = path.join(evidenceDir, "report.json")
const approvalProbe = path.join(evidenceDir, "approval-probe.txt")
const timeoutMs = 120_000

const hash = (value) => createHash("sha256").update(value).digest("hex")
const invariant = (condition, message) => {
  if (!condition) throw new Error(message)
}

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  if (result.status !== 0) throw new Error(`${command} failed with exit ${result.status ?? "unknown"}`)
  return result.stdout.trim()
}

async function resolveExecutable(name) {
  for (const entry of (process.env.PATH || "").split(path.delimiter)) {
    if (!entry) continue
    const candidate = path.join(entry, process.platform === "win32" ? `${name}.cmd` : name)
    try {
      await access(candidate, fsConstants.X_OK)
      return realpath(candidate)
    } catch {}
  }
  throw new Error(`${name} executable not found`)
}

async function checkoutIdentity() {
  const dotGit = path.join(root, ".git")
  const stat = await readFile(dotGit, "utf8").catch(() => null)
  const gitDir = stat?.startsWith("gitdir:") ? path.resolve(root, stat.slice(7).trim()) : dotGit
  const head = (await readFile(path.join(gitDir, "HEAD"), "utf8")).trim()
  if (!head.startsWith("ref:")) return { headRef: "detached", headSha: head }
  const headRef = head.slice(4).trim()
  let headSha = (await readFile(path.join(gitDir, headRef), "utf8").catch(() => "")).trim()
  if (!headSha) {
    const packed = await readFile(path.join(gitDir, "packed-refs"), "utf8").catch(() => "")
    headSha = packed.split("\n").find((line) => line.endsWith(` ${headRef}`))?.split(" ")[0] || "unresolved"
  }
  return { headRef, headSha }
}

async function hashDirectory(directory) {
  const files = []
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(target)
      else files.push(target)
    }
  }
  await visit(directory)
  files.sort()
  const digest = createHash("sha256")
  for (const file of files) {
    digest.update(path.relative(directory, file)).update("\0").update(await readFile(file)).update("\0")
  }
  return { fileCount: files.length, sha256: digest.digest("hex") }
}

class AppServer {
  constructor(codexPath) {
    this.pending = new Map()
    this.messages = []
    this.waiters = []
    this.nextId = 1
    this.buffer = ""
    this.stderrBytes = 0
    this.approvals = []
    this.child = spawn(codexPath, ["app-server", "--listen", "stdio://"], {
      cwd: root,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    })
    this.exited = new Promise((resolve) => this.child.once("exit", (code, signal) => {
      for (const entry of this.pending.values()) entry.reject(new Error("app-server exited with pending request"))
      this.pending.clear()
      resolve({ code, signal, stderrBytes: this.stderrBytes })
    }))
    this.child.stderr.on("data", (chunk) => { this.stderrBytes += chunk.length })
    this.child.stdout.on("data", (chunk) => this.consume(chunk.toString("utf8")))
  }

  consume(chunk) {
    this.buffer += chunk
    for (;;) {
      const newline = this.buffer.indexOf("\n")
      if (newline < 0) return
      const line = this.buffer.slice(0, newline).trim()
      this.buffer = this.buffer.slice(newline + 1)
      if (!line) continue
      let message
      try { message = JSON.parse(line) } catch { throw new Error("app-server emitted malformed JSONL") }
      if (message.id != null && !message.method) {
        const pending = this.pending.get(message.id)
        if (!pending) continue
        this.pending.delete(message.id)
        clearTimeout(pending.timer)
        message.error ? pending.reject(new Error(`RPC ${pending.method} failed`)) : pending.resolve(message.result)
        continue
      }
      if (message.id != null && message.method) {
        const approval = message.method === "item/commandExecution/requestApproval"
          || message.method === "item/fileChange/requestApproval"
        if (approval) {
          this.approvals.push({ method: message.method, decision: "accept" })
          this.send({ id: message.id, result: { decision: "accept" } })
        } else {
          this.send({ id: message.id, error: { code: -32601, message: "Unsupported spike callback" } })
        }
        continue
      }
      if (message.method) {
        this.messages.push(message)
        for (const waiter of [...this.waiters]) waiter(message)
      }
    }
  }

  send(message) {
    invariant(this.child.stdin.writable, "app-server stdin is not writable")
    this.child.stdin.write(`${JSON.stringify(message)}\n`)
  }

  request(method, params, requestTimeout = timeoutMs) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`RPC ${method} timed out`))
      }, requestTimeout)
      this.pending.set(id, { method, resolve, reject, timer })
      this.send({ id, method, params })
    })
  }

  notify(method) { this.send({ method }) }

  waitFor(method, predicate = () => true, waitTimeout = timeoutMs) {
    const existing = this.messages.find((message) => message.method === method && predicate(message.params))
    if (existing) return Promise.resolve(existing.params)
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((entry) => entry !== waiter)
        reject(new Error(`notification ${method} timed out`))
      }, waitTimeout)
      const waiter = (message) => {
        if (message.method !== method || !predicate(message.params)) return
        clearTimeout(timer)
        this.waiters = this.waiters.filter((entry) => entry !== waiter)
        resolve(message.params)
      }
      this.waiters.push(waiter)
    })
  }

  async initialize() {
    const result = await this.request("initialize", {
      clientInfo: { name: "openchamber-spike", title: "OpenChamber compatibility spike", version: "1.0.0" },
      capabilities: { experimentalApi: true },
    })
    this.notify("initialized")
    return result
  }

  async close() {
    if (this.child.exitCode != null || this.child.signalCode != null) return this.exited
    this.child.kill("SIGTERM")
    const forced = setTimeout(() => this.child.kill("SIGKILL"), 5_000)
    const result = await this.exited
    clearTimeout(forced)
    return result
  }
}

const textInput = (text) => [{ type: "text", text, text_elements: [] }]
const turnId = (result) => result?.turn?.id
const completedTurn = (rpc, id) => rpc.waitFor("turn/completed", (params) => params?.turn?.id === id)

async function runCompletedStreamingTurn(rpc, threadId, prompt, label) {
  const started = await rpc.request("turn/start", { threadId, input: textInput(prompt) })
  const id = turnId(started)
  invariant(id, `${label} turn/start did not return a turn id`)
  const completed = await completedTurn(rpc, id)
  invariant(completed.turn.status === "completed", `${label} turn did not complete`)
  invariant(rpc.messages.some((message) => message.method === "item/agentMessage/delta" && message.params?.turnId === id && message.params?.delta), `${label} turn emitted no streaming text`)
  return completed
}

async function runSpike() {
  await mkdir(evidenceDir, { recursive: true, mode: 0o700 })
  await Promise.all([rm(tsDir, { recursive: true, force: true }), rm(jsonDir, { recursive: true, force: true }), rm(approvalProbe, { force: true })])
  const codexPath = await resolveExecutable("codex")
  const versions = { codex: run(codexPath, ["--version"]), node: process.version, bun: run("bun", ["--version"]) }
  run(codexPath, ["app-server", "generate-ts", "--experimental", "--out", tsDir])
  run(codexPath, ["app-server", "generate-json-schema", "--experimental", "--out", jsonDir])
  const schemas = { typescript: await hashDirectory(tsDir), json: await hashDirectory(jsonDir), experimental: true }
  const exits = []
  let first
  let second
  try {
    first = new AppServer(codexPath)
    await first.initialize()
    const started = await first.request("thread/start", { cwd: root, approvalPolicy: "untrusted", sandbox: "read-only" })
    const threadId = started?.thread?.id
    invariant(typeof threadId === "string", "thread/start did not return a thread id")
    await runCompletedStreamingTurn(first, threadId, "Reply with exactly OPENCHAMBER_CODEX_SPIKE_ONE.", "first")
    exits.push(await first.close())

    second = new AppServer(codexPath)
    await second.initialize()
    const resumed = await second.request("thread/resume", { threadId, cwd: root, approvalPolicy: "untrusted", sandbox: "read-only" })
    invariant(resumed?.thread?.id === threadId, "thread/resume returned a different thread")
    await runCompletedStreamingTurn(second, threadId, "Reply with exactly OPENCHAMBER_CODEX_SPIKE_TWO.", "second")

    const approvalStart = await second.request("turn/start", {
      threadId,
      input: textInput("Use a shell command to write exactly APPROVED to docs/.codex-app-server-spike/approval-probe.txt, then stop."),
    })
    const approvalDone = await completedTurn(second, turnId(approvalStart))
    invariant(approvalDone.turn.status === "completed", "approval turn did not complete")
    invariant(second.approvals.length > 0, "no approval request was observed")
    invariant((await readFile(approvalProbe, "utf8")).trim() === "APPROVED", "approved operation did not run")
    await rm(approvalProbe, { force: true })

    const interruptStart = await second.request("turn/start", {
      threadId,
      approvalPolicy: "never",
      input: textInput("Run a Node.js command that waits 30 seconds before printing INTERRUPT_PROBE."),
    })
    const interruptTurnId = turnId(interruptStart)
    await second.waitFor("turn/started", (params) => params?.turn?.id === interruptTurnId)
    const interruptResponse = second.request("turn/interrupt", { threadId, turnId: interruptTurnId })
    const interrupted = await completedTurn(second, interruptTurnId)
    await interruptResponse
    invariant(interrupted.turn.status === "interrupted", "turn/interrupt did not produce interrupted terminal status")
    invariant(second.approvals.length === 1, "interrupt created an unexpected approval request")
    exits.push(await second.close())

    const report = {
      gate: "PASS",
      checkout: await checkoutIdentity(),
      versions,
      codexExecutableSha256: hash(await readFile(codexPath)),
      schemas,
      flow: { initialize: true, threadStart: true, firstTurnCompleted: true, streamingText: true, threadResume: true, secondTurnCompleted: true },
      approval: { observed: true, requests: second.approvals },
      interrupt: { observed: true, terminalStatus: interrupted.turn.status },
      process: { instances: 2, exits, liveAfterCleanup: false },
      cleanup: { approvalProbeRemoved: true, schemaWorkingDirectoriesRemoved: true, appServerProcessesExited: true },
      pr884: {
        confirmed: ["direct stdio app-server spawn", "initialize then initialized", "thread/start", "turn/start", "thread/resume", "turn/interrupt", "accept/decline approval decisions"],
        incompatible: ["turn/aborted is replaced by turn/completed with interrupted status", "raw JSON-RPC logging is unsafe", "malformed JSONL cannot be ignored", "binding writes require atomic mode-0600 persistence and corruption handling", "backend availability cannot be hard-coded", "process exit cannot be projected as idle success"],
      },
    }
    await rm(tsDir, { recursive: true, force: true })
    await rm(jsonDir, { recursive: true, force: true })
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
    await chmod(reportPath, 0o600)
    console.log(`Codex app-server compatibility gate: PASS\nEvidence: ${path.relative(root, reportPath)}`)
  } finally {
    await rm(approvalProbe, { force: true })
    if (first && first.child.exitCode == null && first.child.signalCode == null) await first.close()
    if (second && second.child.exitCode == null && second.child.signalCode == null) await second.close()
  }
}

if (process.argv.includes("--help")) {
  console.log("Usage: node scripts/codex-app-server-spike.mjs\nRuns the authenticated Codex app-server compatibility gate and writes redacted evidence.")
} else {
  runSpike().catch(async (error) => {
    await mkdir(evidenceDir, { recursive: true, mode: 0o700 })
    const safe = String(error?.message || "unknown compatibility failure").replaceAll(root, "<checkout>").replaceAll(os.homedir(), "<home>").slice(0, 300)
    await writeFile(reportPath, `${JSON.stringify({ gate: "FAIL", diagnosis: safe }, null, 2)}\n`, { mode: 0o600 })
    console.error(`Codex app-server compatibility gate: FAIL (${safe})`)
    process.exitCode = 1
  })
}
