import { spawn as defaultSpawn } from 'node:child_process';
import path from 'node:path';
import { CodexJsonRpcClient, CodexProtocolError } from './jsonrpc-client.js';

const DEFAULT_STARTUP_TIMEOUT_MS = 10_000;
const DEFAULT_CONTROL_TIMEOUT_MS = 30_000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 5_000;
const DEFAULT_STDERR_LIMIT_BYTES = 64 * 1024;

class CodexProcessExitError extends Error {
  constructor(code, signal) {
    super(`Codex app-server exited (code ${code ?? 'null'}, signal ${signal ?? 'none'})`);
    this.name = 'CodexProcessExitError';
    this.code = 'process-exit';
    this.exitCode = code;
    this.signal = signal;
  }
}

export class CodexAppServerSession {
  constructor({
    directory,
    codexPath = 'codex',
    spawn = defaultSpawn,
    startupTimeoutMs = DEFAULT_STARTUP_TIMEOUT_MS,
    controlTimeoutMs = DEFAULT_CONTROL_TIMEOUT_MS,
    shutdownTimeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
    stderrLimitBytes = DEFAULT_STDERR_LIMIT_BYTES,
    onExit = () => {},
    onNotification = () => {},
    onRequest = () => {},
  }) {
    if (!path.isAbsolute(directory)) throw new TypeError('Codex app-server directory must be absolute');
    this.directory = directory;
    this.codexPath = codexPath;
    this.spawn = spawn;
    this.startupTimeoutMs = startupTimeoutMs;
    this.controlTimeoutMs = controlTimeoutMs;
    this.shutdownTimeoutMs = shutdownTimeoutMs;
    this.stderrLimitBytes = stderrLimitBytes;
    this.onExit = onExit;
    this.onNotification = onNotification;
    this.onRequest = onRequest;
    this.state = 'new';
    this.stderrBytes = 0;
    this.stderrTruncated = false;
    this.child = null;
    this.client = null;
    this.exitPromise = null;
    this.shutdownPromise = null;
    this.intentionalExit = false;
  }

  async start() {
    if (this.state === 'ready') return;
    if (this.state !== 'new') throw new Error(`Cannot start Codex app-server from state ${this.state}`);
    this.state = 'starting';
    try {
      const child = this.spawn(this.codexPath, ['app-server', '--listen', 'stdio://'], {
        cwd: this.directory,
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      this.child = child;
      child.once('error', () => this.handleProcessError());
      this.exitPromise = new Promise((resolve) => child.once('exit', (code, signal) => {
        resolve({ code, signal });
        if (!this.intentionalExit) this.handleUnexpectedExit(code, signal);
      }));
      child.stderr?.on('data', (chunk) => {
        const bytes = Buffer.byteLength(chunk);
        this.stderrTruncated ||= this.stderrBytes + bytes > this.stderrLimitBytes;
        this.stderrBytes = Math.min(this.stderrLimitBytes, this.stderrBytes + bytes);
      });
      this.client = new CodexJsonRpcClient({
        write: (frame) => {
          if (!child.stdin?.writable) throw new Error('Codex app-server stdin is unavailable');
          child.stdin.write(frame);
        },
        onProtocolError: (error) => this.handleProtocolFailure(error),
        onNotification: (notification) => this.onNotification(notification),
        onRequest: (request) => this.onRequest(request),
      });
      child.stdout?.on('data', (chunk) => this.client.push(chunk));
      await this.client.request('initialize', {
        clientInfo: { name: 'openchamber', title: 'OpenChamber', version: '1.0.0' },
        capabilities: { experimentalApi: true },
      }, { timeoutMs: this.startupTimeoutMs });
      this.client.notify('initialized');
      this.state = 'ready';
    } catch (error) {
      this.state = 'failed';
      await this.shutdown();
      this.state = 'failed';
      throw error;
    }
  }

  control(method, params, { timeoutMs = this.controlTimeoutMs } = {}) {
    this.assertReady();
    return this.client.request(method, params, { timeoutMs });
  }

  turn(method, params) {
    this.assertReady();
    return this.client.request(method, params);
  }

  interrupt(threadId, turnId) {
    return this.control('turn/interrupt', { threadId, turnId });
  }

  respond(id, result) {
    this.assertReady();
    this.client.respond(id, result);
  }

  respondError(id, error) {
    this.assertReady();
    this.client.respondError(id, error);
  }

  assertReady() {
    if (this.state !== 'ready') throw new Error(`Codex app-server is not ready (${this.state})`);
  }

  handleProtocolFailure(error) {
    if (this.state === 'stopping' || this.state === 'closed' || this.state === 'failed') return;
    this.state = 'failed';
    this.onExit(error);
    this.intentionalExit = true;
    this.child?.kill('SIGTERM');
  }

  handleProcessError() {
    if (this.state === 'stopping' || this.state === 'closed' || this.state === 'failed') return;
    const error = Object.assign(new Error('Codex app-server failed to spawn'), { code: 'process-spawn' });
    this.state = 'failed';
    this.intentionalExit = true;
    this.client?.close(error);
    this.onExit(error);
    this.child?.kill('SIGTERM');
  }

  handleUnexpectedExit(code, signal) {
    if (this.state === 'closed') return;
    const error = new CodexProcessExitError(code, signal);
    this.state = 'failed';
    this.client?.close(error);
    this.onExit(error);
  }

  shutdown() {
    if (this.shutdownPromise) return this.shutdownPromise;
    this.shutdownPromise = this.performShutdown().catch((error) => {
      this.shutdownPromise = null;
      throw error;
    });
    return this.shutdownPromise;
  }

  async performShutdown() {
    const preserveFailure = this.state === 'failed';
    const child = this.child;
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      this.client?.close(new CodexProtocolError('session-closed', 'Codex app-server session closed'));
      if (!preserveFailure) this.state = 'closed';
      return;
    }
    this.intentionalExit = true;
    this.state = preserveFailure ? 'failed' : 'stopping';
    child.kill('SIGTERM');
    let escalation;
    const escalated = new Promise((resolve) => {
      escalation = setTimeout(() => {
        child.kill('SIGKILL');
        resolve();
      }, this.shutdownTimeoutMs);
    });
    await Promise.race([this.exitPromise, escalated]);
    clearTimeout(escalation);
    this.client?.close(new CodexProtocolError('session-closed', 'Codex app-server session closed'));
    if (!preserveFailure) this.state = 'closed';
  }
}
