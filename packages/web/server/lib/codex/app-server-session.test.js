import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { CodexAppServerSession } from './app-server-session.js';
import { CodexRuntime } from './runtime.js';

const createChild = ({ autoRespond = true, exitOn = 'SIGTERM' } = {}) => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.exitCode = null;
  child.signalCode = null;
  child.frames = [];
  child.signals = [];
  child.stdin = {
    writable: true,
    write(frame) {
      const message = JSON.parse(frame);
      child.frames.push(message);
      if (autoRespond && Object.hasOwn(message, 'id')) {
        queueMicrotask(() => child.stdout.emit('data', Buffer.from(`${JSON.stringify({ id: message.id, result: { ok: true } })}\n`)));
      }
      return true;
    },
  };
  child.kill = (signal) => {
    child.signals.push(signal);
    if (signal === exitOn) {
      child.signalCode = signal;
      queueMicrotask(() => child.emit('exit', null, signal));
    }
    return true;
  };
  return child;
};

describe('CodexAppServerSession', () => {
  it('direct-spawns, initializes, notifies, and runs bounded control requests', async () => {
    const child = createChild();
    const spawn = vi.fn(() => child);
    const session = new CodexAppServerSession({ directory: '/workspace', spawn, codexPath: '/bin/codex' });
    await session.start();
    await expect(session.control('thread/list', {})).resolves.toEqual({ ok: true });

    expect(spawn).toHaveBeenCalledWith('/bin/codex', ['app-server', '--listen', 'stdio://'], {
      cwd: '/workspace', shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
    });
    expect(child.frames.map(({ method }) => method)).toEqual(['initialize', 'initialized', 'thread/list']);
    await session.shutdown();
  });

  it('fails startup on its bounded handshake timeout and cleans the child', async () => {
    vi.useFakeTimers();
    try {
      const child = createChild({ autoRespond: false });
      const session = new CodexAppServerSession({ directory: '/workspace', spawn: () => child, startupTimeoutMs: 10 });
      const started = session.start();
      const assertion = expect(started).rejects.toMatchObject({ code: 'request-timeout' });
      await vi.advanceTimersByTimeAsync(11);
      await assertion;
      expect(child.signals).toEqual(['SIGTERM']);
      expect(session.state).toBe('failed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('fails immediately and redacts the underlying child spawn error', async () => {
    const child = createChild({ autoRespond: false });
    const session = new CodexAppServerSession({ directory: '/workspace', spawn: () => child });
    const started = session.start();
    queueMicrotask(() => child.emit('error', new Error('ENOENT /private/codex/path')));
    await expect(started).rejects.toMatchObject({
      code: 'process-spawn',
      message: 'Codex app-server failed to spawn',
    });
  });

  it('escalates bounded shutdown from SIGTERM to SIGKILL', async () => {
    vi.useFakeTimers();
    try {
      const child = createChild({ exitOn: 'SIGKILL' });
      const session = new CodexAppServerSession({ directory: '/workspace', spawn: () => child, shutdownTimeoutMs: 10 });
      await session.start();
      const stopped = session.shutdown();
      await vi.advanceTimersByTimeAsync(11);
      await stopped;
      expect(child.signals).toEqual(['SIGTERM', 'SIGKILL']);
      expect(session.state).toBe('closed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves unexpected child exit as failure and rejects affected work', async () => {
    const child = createChild();
    const failures = [];
    const session = new CodexAppServerSession({ directory: '/workspace', spawn: () => child, onExit: (error) => failures.push(error) });
    await session.start();
    child.stdin.write = (frame) => { child.frames.push(JSON.parse(frame)); return true; };
    const pending = session.control('thread/list', {});
    child.emit('exit', 7, null);
    await expect(pending).rejects.toMatchObject({ code: 'process-exit' });
    expect(session.state).toBe('failed');
    expect(failures).toHaveLength(1);
  });

  it('does not impose an arbitrary timeout on ordinary turns', async () => {
    vi.useFakeTimers();
    try {
      const child = createChild();
      const session = new CodexAppServerSession({ directory: '/workspace', spawn: () => child });
      await session.start();
      child.stdin.write = (frame) => { child.frames.push(JSON.parse(frame)); return true; };
      const turn = session.turn('turn/start', { threadId: 'thread-1' });
      await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);
      expect(session.state).toBe('ready');
      expect(child.signals).toEqual([]);
      const id = child.frames.at(-1).id;
      child.stdout.emit('data', Buffer.from(`${JSON.stringify({ id, result: { turn: { id: 'turn-1' } } })}\n`));
      await expect(turn).resolves.toEqual({ turn: { id: 'turn-1' } });
      await session.shutdown();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('CodexRuntime lifecycle ownership', () => {
  it('disposes an idle process even while a browser remains connected', async () => {
    vi.useFakeTimers();
    try {
      const session = { start: vi.fn(async () => {}), shutdown: vi.fn(async () => {}) };
      const runtime = new CodexRuntime({ createSession: () => session, idleMs: 10 });
      await runtime.open('session-1', '/workspace');
      await vi.advanceTimersByTimeAsync(11);
      expect(session.shutdown).toHaveBeenCalledTimes(1);
      expect(runtime.getState('session-1')).toBe(null);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps active work alive across browser close, then disposes it when idle', async () => {
    vi.useFakeTimers();
    try {
      const session = { start: vi.fn(async () => {}), shutdown: vi.fn(async () => {}) };
      const runtime = new CodexRuntime({ createSession: () => session, idleMs: 10 });
      await runtime.open('session-1', '/workspace');
      runtime.beginTurn('session-1');
      runtime.closeBrowser('session-1');
      await vi.advanceTimersByTimeAsync(11);
      expect(session.shutdown).not.toHaveBeenCalled();

      runtime.completeTurn('session-1');
      await vi.advanceTimersByTimeAsync(11);
      expect(session.shutdown).toHaveBeenCalledTimes(1);
      expect(runtime.getState('session-1')).toBe(null);
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves child failure and makes cleanup idempotent', async () => {
    let exit;
    const session = { start: vi.fn(async () => {}), shutdown: vi.fn(async () => {}) };
    const runtime = new CodexRuntime({ createSession: ({ onExit }) => { exit = onExit; return session; } });
    await runtime.open('session-1', '/workspace');
    exit(Object.assign(new Error('Codex app-server exited'), { code: 'process-exit' }));
    expect(runtime.getState('session-1')).toMatchObject({ status: 'failed', error: { code: 'process-exit' } });
    await Promise.all([runtime.dispose('session-1'), runtime.dispose('session-1')]);
    expect(session.shutdown).toHaveBeenCalledTimes(1);
  });
});
