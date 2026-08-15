import { randomUUID } from 'node:crypto';
import * as defaultFs from 'node:fs/promises';
import path from 'node:path';

const STORE_VERSION = 1;
const CODEX_TARGET = Object.freeze({ harnessId: 'codex', modelRef: Object.freeze({ kind: 'default' }) });

class CodexBindingStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CodexBindingStoreError';
    this.code = code;
  }
}

const fail = (code, message) => { throw new CodexBindingStoreError(code, message); };
const isString = (value) => typeof value === 'string' && value.length > 0 && !/[\r\n]/.test(value);
const sameTarget = (value) => value?.harnessId === 'codex' && value?.modelRef?.kind === 'default';

export class CodexBindingStore {
  constructor({ dataDirectory, serverId, fs = defaultFs, uuid = randomUUID, now = () => new Date().toISOString() }) {
    if (!path.isAbsolute(dataDirectory)) fail('invalid-store-path', 'Codex data directory must be absolute');
    if (!isString(serverId)) fail('invalid-server-id', 'Codex server identity is invalid');
    this.fs = fs;
    this.serverId = serverId;
    this.uuid = uuid;
    this.now = now;
    this.filePath = path.join(dataDirectory, 'codex', 'bindings.v1.json');
    this.lockPath = `${this.filePath}.lock`;
    this.corruption = null;
    this.recordCorruption = null;
  }

  async validateScope(directory, authoritativeDirectory) {
    if (!path.isAbsolute(directory) || !path.isAbsolute(authoritativeDirectory)) {
      fail('invalid-directory', 'Codex binding directories must be absolute');
    }
    const canonical = await this.fs.realpath(directory).catch(() => fail('invalid-directory', 'Codex binding directory is unavailable'));
    if (canonical !== directory) fail('non-canonical-directory', 'Codex binding directory must be canonical');
    const authoritative = await this.fs.realpath(authoritativeDirectory)
      .catch(() => fail('invalid-directory', 'Authoritative Codex directory is unavailable'));
    if (canonical !== authoritative) fail('directory-mismatch', 'Codex binding directory does not match runtime authority');
    return canonical;
  }

  assertAvailable() {
    if (this.corruption) throw this.corruption;
  }

  validateRecord(record) {
    if (!record || record.version !== STORE_VERSION || record.harnessId !== 'codex' || !isString(record.serverId) ||
      !/^ses_codex_[0-9a-f-]{36}$/.test(record.sessionId) || !isString(record.directory) ||
      !isString(record.runtimeId) || !sameTarget(record.target) ||
      (record.threadId !== null && !isString(record.threadId)) || !isString(record.createdAt) ||
      !isString(record.updatedAt) || (record.firstTurnAt !== null && !isString(record.firstTurnAt)) ||
      (record.lastCompletedAt !== null && !isString(record.lastCompletedAt))) {
      fail('store-corrupt', 'Codex binding store contains an invalid record');
    }
    return record;
  }

  async quarantine() {
    const error = new CodexBindingStoreError('store-corrupt', 'Codex binding store is corrupt and was quarantined');
    this.corruption = error;
    const destination = `${this.filePath}.corrupt-${Date.now()}-${this.uuid()}`;
    await this.fs.rename(this.filePath, destination).catch(() => {});
    throw error;
  }

  async readEnvelope() {
    this.assertAvailable();
    let raw;
    try {
      raw = await this.fs.readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') return { version: STORE_VERSION, revision: 0, records: [] };
      throw error;
    }
    let value;
    try { value = JSON.parse(raw); } catch { return this.quarantine(); }
    if (!value || value.version !== STORE_VERSION || !Number.isSafeInteger(value.revision) ||
      value.revision < 0 || !Array.isArray(value.records)) return this.quarantine();
    const records = value.records.filter((record) => {
      try { this.validateRecord(record); return true; } catch {
        this.recordCorruption ??= new CodexBindingStoreError('record-corrupt', 'Codex binding store contains quarantined records');
        return false;
      }
    });
    return { ...value, records };
  }

  async writeEnvelope(envelope) {
    const directory = path.dirname(this.filePath);
    const temporary = `${this.filePath}.tmp-${process.pid}-${this.uuid()}`;
    await this.fs.mkdir(directory, { recursive: true, mode: 0o700 });
    if (process.platform !== 'win32') await this.fs.chmod(directory, 0o700);
    try {
      await this.fs.writeFile(temporary, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
      if (process.platform !== 'win32') await this.fs.chmod(temporary, 0o600);
      await this.fs.rename(temporary, this.filePath);
      if (process.platform !== 'win32') await this.fs.chmod(this.filePath, 0o600);
    } finally {
      await this.fs.rm(temporary, { force: true }).catch(() => {});
    }
  }

  async mutate(change) {
    this.assertAvailable();
    await this.fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    let lock;
    try {
      lock = await this.fs.open(this.lockPath, 'wx', 0o600);
    } catch (error) {
      if (error?.code === 'EEXIST') fail('write-conflict', 'Codex binding store is being modified');
      throw error;
    }
    try {
      const envelope = await this.readEnvelope();
      if (this.recordCorruption) throw this.recordCorruption;
      const result = change(envelope.records);
      await this.writeEnvelope({ version: STORE_VERSION, revision: envelope.revision + 1, records: envelope.records });
      return result;
    } finally {
      await lock.close().catch(() => {});
      await this.fs.rm(this.lockPath, { force: true }).catch(() => {});
    }
  }

  async create({ directory, authoritativeDirectory, runtimeId, target = CODEX_TARGET }) {
    const canonical = await this.validateScope(directory, authoritativeDirectory);
    if (!isString(runtimeId) || !sameTarget(target)) fail('invalid-binding', 'Codex binding metadata is invalid');
    return this.mutate((records) => {
      const timestamp = this.now();
      const record = {
        version: STORE_VERSION,
        serverId: this.serverId,
        sessionId: `ses_codex_${this.uuid()}`,
        harnessId: 'codex',
        threadId: null,
        runtimeId,
        directory: canonical,
        target: CODEX_TARGET,
        createdAt: timestamp,
        updatedAt: timestamp,
        firstTurnAt: null,
        lastCompletedAt: null,
      };
      records.push(record);
      return structuredClone(record);
    });
  }

  async list({ directory, authoritativeDirectory, runtimeId }) {
    const canonical = await this.validateScope(directory, authoritativeDirectory);
    return (await this.readEnvelope()).records
      .filter((record) => record.serverId === this.serverId && record.directory === canonical && record.runtimeId === runtimeId)
      .map((record) => structuredClone(record));
  }

  async get({ sessionId, directory, authoritativeDirectory, runtimeId }) {
    const records = await this.list({ directory, authoritativeDirectory, runtimeId });
    const record = records.find((candidate) => candidate.sessionId === sessionId);
    if (!record && this.recordCorruption) throw this.recordCorruption;
    if (!record) fail('binding-not-found', 'Codex session binding was not found');
    return record;
  }

  async bindThread({ sessionId, directory, authoritativeDirectory, runtimeId, target, threadId }) {
    const canonical = await this.validateScope(directory, authoritativeDirectory);
    if (!sameTarget(target) || !isString(threadId)) fail('invalid-binding', 'Codex thread binding is invalid');
    return this.mutate((records) => {
      const record = records.find((candidate) => candidate.sessionId === sessionId && candidate.serverId === this.serverId);
      if (!record) fail('binding-not-found', 'Codex session binding was not found');
      if (record.directory !== canonical || record.runtimeId !== runtimeId || !sameTarget(record.target) ||
        (record.threadId !== null && record.threadId !== threadId)) {
        fail('binding-conflict', 'Codex session binding is immutable after the first turn');
      }
      const timestamp = this.now();
      record.threadId = threadId;
      record.firstTurnAt ??= timestamp;
      record.updatedAt = timestamp;
      return structuredClone(record);
    });
  }
}
