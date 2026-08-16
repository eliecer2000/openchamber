import { describe, expect, test } from 'bun:test';

import {
  CODEX_EXECUTION_TARGET,
  isCodexSupportedSurface,
  resolveExecutionTarget,
} from './execution-target';

describe('execution target routing', () => {
  test('keeps the complete OpenCode provider/model execution contract unchanged', async () => {
    const target = resolveExecutionTarget({
      sessionId: 'ses_opencode_1',
      draftOpen: false,
      selectedHarnessId: 'codex',
      providerID: 'provider-a',
      modelID: 'model-a',
      agent: 'build',
      variant: 'high',
    });

    expect(target).toEqual({
      harnessId: 'opencode',
      providerID: 'provider-a',
      modelID: 'model-a',
      agent: 'build',
      variant: 'high',
    });
  });

  test('routes only a selected draft or Codex session through the Codex discriminant', async () => {
    const draftTarget = resolveExecutionTarget({
      sessionId: null,
      draftOpen: true,
      selectedHarnessId: 'codex',
      providerID: null,
      modelID: null,
    });
    const sessionTarget = resolveExecutionTarget({
      sessionId: 'ses_codex_1',
      draftOpen: false,
      selectedHarnessId: 'opencode',
      providerID: 'stale-provider',
      modelID: 'stale-model',
    });

    expect(draftTarget).toEqual(CODEX_EXECUTION_TARGET);
    expect(sessionTarget).toEqual(CODEX_EXECUTION_TARGET);
  });

  test('allows Codex selection only on the browser Web surface', () => {
    expect(isCodexSupportedSurface({ platform: 'web', isDesktop: false, isVSCode: false, isMobile: false, isCapacitor: false })).toBe(true);
    expect(isCodexSupportedSurface({ platform: 'desktop', isDesktop: true, isVSCode: false, isMobile: false, isCapacitor: false })).toBe(false);
    expect(isCodexSupportedSurface({ platform: 'vscode', isDesktop: false, isVSCode: true, isMobile: false, isCapacitor: false })).toBe(false);
    expect(isCodexSupportedSurface({ platform: 'web', isDesktop: false, isVSCode: false, isMobile: true, isCapacitor: false })).toBe(false);
    expect(isCodexSupportedSurface({ platform: 'web', isDesktop: false, isVSCode: false, isMobile: true, isCapacitor: true })).toBe(false);
  });
});
