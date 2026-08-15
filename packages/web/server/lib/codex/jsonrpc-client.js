import { StringDecoder } from 'node:string_decoder';
import {
  CodexProtocolError,
  parseCodexProtocolMessage,
} from './generated/protocol-descriptor.js';

const DEFAULT_MAX_FRAME_BYTES = 8 * 1024 * 1024;

export { CodexProtocolError };

export class CodexRpcError extends Error {
  constructor({ code, message, method }) {
    super(`Codex JSON-RPC request failed: ${message}`);
    this.name = 'CodexRpcError';
    this.code = code;
    this.method = method;
  }
}

class CodexRequestTimeoutError extends Error {
  constructor(method) {
    super(`Codex JSON-RPC request timed out: ${method}`);
    this.name = 'CodexRequestTimeoutError';
    this.code = 'request-timeout';
    this.method = method;
  }
}

const asProtocolError = (error) => {
  if (error instanceof CodexProtocolError) return error;
  return new CodexProtocolError('invalid-protocol-message', 'Invalid Codex protocol message');
};

export class CodexJsonRpcClient {
  constructor({
    write,
    onNotification = () => {},
    onRequest = () => {},
    onWarning = () => {},
    onProtocolError = () => {},
    maxFrameBytes = DEFAULT_MAX_FRAME_BYTES,
  }) {
    if (typeof write !== 'function') throw new TypeError('write must be a function');
    if (!Number.isSafeInteger(maxFrameBytes) || maxFrameBytes <= 0) {
      throw new TypeError('maxFrameBytes must be a positive safe integer');
    }
    this.write = write;
    this.onNotification = onNotification;
    this.onRequest = onRequest;
    this.onWarning = onWarning;
    this.onProtocolError = onProtocolError;
    this.maxFrameBytes = maxFrameBytes;
    this.decoder = new StringDecoder('utf8');
    this.buffer = '';
    this.bufferedBytes = 0;
    this.nextId = 1;
    this.pending = new Map();
    this.failure = null;
  }

  get failed() {
    return this.failure !== null;
  }

  get pendingCount() {
    return this.pending.size;
  }

  push(chunk) {
    if (this.failed) return;
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.bufferedBytes += bytes.length;
    this.buffer += this.decoder.write(bytes);

    for (;;) {
      const newline = this.buffer.indexOf('\n');
      if (newline < 0) break;
      const rawLine = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      const frameBytes = Buffer.byteLength(rawLine);
      this.bufferedBytes = Math.max(0, this.bufferedBytes - frameBytes - 1);
      if (frameBytes > this.maxFrameBytes) {
        this.failProtocol(new CodexProtocolError(
          'frame-too-large',
          `Codex JSONL frame exceeded ${this.maxFrameBytes} bytes`,
        ));
        return;
      }
      const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
      if (!line.trim()) continue;
      this.consumeLine(line);
      if (this.failed) return;
    }

    if (this.bufferedBytes > this.maxFrameBytes) {
      this.failProtocol(new CodexProtocolError(
        'frame-too-large',
        `Codex JSONL frame exceeded ${this.maxFrameBytes} bytes`,
      ));
    }
  }

  consumeLine(line) {
    let decoded;
    try {
      decoded = JSON.parse(line);
    } catch {
      this.failProtocol(new CodexProtocolError('malformed-jsonl', 'Codex emitted malformed JSONL'));
      return;
    }

    let message;
    try {
      message = parseCodexProtocolMessage(decoded);
    } catch (error) {
      this.failProtocol(asProtocolError(error));
      return;
    }

    if (Object.prototype.hasOwnProperty.call(message, 'method')) {
      if (Object.prototype.hasOwnProperty.call(message, 'id')) this.onRequest(message);
      else this.onNotification(message);
      return;
    }
    this.consumeResponse(message);
  }

  consumeResponse(message) {
    const pending = this.pending.get(message.id);
    if (!pending) {
      this.onWarning({ code: 'unknown-response-id', id: message.id });
      return;
    }
    this.pending.delete(message.id);
    clearTimeout(pending.timer);
    if (Object.prototype.hasOwnProperty.call(message, 'error')) {
      pending.reject(new CodexRpcError({
        code: message.error.code,
        message: message.error.message,
        method: pending.method,
      }));
      return;
    }
    pending.resolve(message.result);
  }

  request(method, params, { timeoutMs } = {}) {
    if (this.failed) return Promise.reject(this.failure);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = timeoutMs === undefined ? null : setTimeout(() => {
        this.pending.delete(id);
        reject(new CodexRequestTimeoutError(method));
      }, timeoutMs);
      this.pending.set(id, { method, resolve, reject, timer });
      try {
        this.send({ id, method, params });
      } catch (error) {
        this.pending.delete(id);
        if (timer) clearTimeout(timer);
        reject(error);
      }
    });
  }

  notify(method, params) {
    this.send(params === undefined ? { method } : { method, params });
  }

  respond(id, result) {
    this.send({ id, result });
  }

  respondError(id, { code, message }) {
    this.send({ id, error: { code, message } });
  }

  send(message) {
    if (this.failed) throw this.failure;
    this.write(`${JSON.stringify(message)}\n`);
  }

  failProtocol(error) {
    if (this.failed) return;
    this.failure = error;
    this.buffer = '';
    this.bufferedBytes = 0;
    for (const pending of this.pending.values()) {
      if (pending.timer) clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    this.onProtocolError(error);
  }

  close(error = new CodexProtocolError('client-closed', 'Codex JSON-RPC client closed')) {
    this.failProtocol(error);
  }
}
