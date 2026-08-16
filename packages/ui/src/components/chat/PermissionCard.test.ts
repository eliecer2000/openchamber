import { describe, expect, test } from 'bun:test';

import { supportsAlwaysPermissionResponse, getVisiblePermissionPatterns } from './permissionCardPatterns';

describe('getVisiblePermissionPatterns', () => {
  test('omits a pattern already rendered as the bash command', () => {
    const command = 'bunx eslint "src/components/session/SessionSidebar.tsx"';

    expect(getVisiblePermissionPatterns([command], command)).toEqual([]);
  });

  test('preserves distinct permission patterns', () => {
    const command = 'bunx eslint "src/components/session/SessionSidebar.tsx"';

    expect(getVisiblePermissionPatterns(['bunx eslint *', command], command)).toEqual(['bunx eslint *']);
  });
});

describe('supportsAlwaysPermissionResponse', () => {
  test('never exposes always semantics for Codex approvals', () => {
    expect(supportsAlwaysPermissionResponse({ engine: 'codex' })).toBe(false);
  });

  test('preserves existing OpenCode always semantics', () => {
    expect(supportsAlwaysPermissionResponse({})).toBe(true);
  });
});
