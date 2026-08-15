import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CodexBindingStore } from './binding-store.js';

const roots = [];
const target = { harnessId: 'codex', modelRef: { kind: 'default' } };

const fixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'openchamber-codex-bindings-'));
  roots.push(root);
  const workspace = path.join(root, 'workspace');
  await mkdir(workspace);
  return {
    root,
    workspace,
    store: new CodexBindingStore({ dataDirectory: root, serverId: 'server-a' }),
  };
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('CodexBindingStore path and identity validation', () => {
  it('rejects relative, non-canonical, mismatched, and symlinked directories', async () => {
    const { root, store, workspace } = await fixture();
    const other = path.join(root, 'other');
    const link = path.join(root, 'workspace-link');
    await mkdir(other);
    await symlink(other, link, 'dir');

    await expect(store.create({ directory: 'workspace', authoritativeDirectory: workspace, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'invalid-directory' });
    await expect(store.create({ directory: workspace, authoritativeDirectory: other, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'directory-mismatch' });
    await expect(store.create({ directory: link, authoritativeDirectory: other, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'non-canonical-directory' });
  });

  it('creates isolated session identities and rejects frozen binding conflicts', async () => {
    const { store, workspace } = await fixture();
    const binding = await store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target });
    const second = await store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target });
    expect(binding.sessionId).toMatch(/^ses_codex_[0-9a-f-]{36}$/);
    expect(second.sessionId).not.toBe(binding.sessionId);

    const bound = await store.bindThread({
      sessionId: binding.sessionId,
      directory: workspace,
      authoritativeDirectory: workspace,
      runtimeId: 'web',
      target,
      threadId: 'thread-1',
    });
    expect(bound).toMatchObject({ threadId: 'thread-1', firstTurnAt: expect.any(String) });
    await expect(store.bindThread({ ...bound, authoritativeDirectory: workspace, threadId: 'thread-2' }))
      .rejects.toMatchObject({ code: 'binding-conflict' });
  });
});

describe('CodexBindingStore durability', () => {
  it('distinguishes a missing store from corrupt empty content and quarantines corruption', async () => {
    const { store, workspace } = await fixture();
    await expect(store.list({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web' }))
      .resolves.toEqual([]);

    await mkdir(path.dirname(store.filePath), { recursive: true });
    await writeFile(store.filePath, '');
    await expect(store.list({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web' }))
      .rejects.toMatchObject({ code: 'store-corrupt' });
    expect((await readdir(path.dirname(store.filePath))).some((name) => name.includes('.corrupt-'))).toBe(true);
    await expect(store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'store-corrupt' });
  });

  it('round-trips metadata atomically with mode 0600 and excludes sensitive input', async () => {
    const { root, store, workspace } = await fixture();
    const created = await store.create({
      directory: workspace,
      authoritativeDirectory: workspace,
      runtimeId: 'web',
      target,
      prompt: 'must not persist',
      bearerToken: 'must not persist',
    });
    const reopened = new CodexBindingStore({ dataDirectory: root, serverId: 'server-a' });
    await expect(reopened.get({
      sessionId: created.sessionId,
      directory: workspace,
      authoritativeDirectory: workspace,
      runtimeId: 'web',
    })).resolves.toEqual(created);
    expect((await stat(store.filePath)).mode & 0o777).toBe(0o600);
    const raw = await readFile(store.filePath, 'utf8');
    expect(raw).not.toContain('must not persist');
  });

  it('reports an existing cross-process write lock as a conflict', async () => {
    const { store, workspace } = await fixture();
    await mkdir(path.dirname(store.filePath), { recursive: true });
    await writeFile(`${store.filePath}.lock`, 'locked', { mode: 0o600 });
    await expect(store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'write-conflict' });
  });

  it('keeps bindings from different server identities isolated in one store', async () => {
    const { root, store, workspace } = await fixture();
    await store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target });
    const other = new CodexBindingStore({ dataDirectory: root, serverId: 'server-b' });
    await other.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target });
    await expect(store.list({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web' }))
      .resolves.toHaveLength(1);
    await expect(other.list({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web' }))
      .resolves.toHaveLength(1);
  });

  it('keeps valid records readable while blocking writes around a corrupt record', async () => {
    const { store, workspace } = await fixture();
    const created = await store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target });
    const envelope = JSON.parse(await readFile(store.filePath, 'utf8'));
    envelope.records.push({ version: 1, sessionId: 'invalid' });
    await writeFile(store.filePath, JSON.stringify(envelope), { mode: 0o600 });

    await expect(store.list({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web' }))
      .resolves.toEqual([created]);
    await expect(store.create({ directory: workspace, authoritativeDirectory: workspace, runtimeId: 'web', target }))
      .rejects.toMatchObject({ code: 'record-corrupt' });
    expect(JSON.parse(await readFile(store.filePath, 'utf8')).records).toHaveLength(2);
  });
});
