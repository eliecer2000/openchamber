import { beforeEach, describe, expect, test } from 'bun:test';

import { useSelectionStore } from './selection-store';

describe('execution target selection', () => {
  beforeEach(() => {
    useSelectionStore.getState().resetExecutionTargets();
  });

  test('keeps draft and session targets independent across session switches', () => {
    const state = useSelectionStore.getState();
    state.setDraftExecutionHarness('codex');
    state.saveSessionExecutionHarness('ses_codex_1', 'codex');
    state.saveSessionExecutionHarness('ses_open_1', 'opencode');

    expect(useSelectionStore.getState().draftExecutionHarness).toBe('codex');
    expect(useSelectionStore.getState().sessionExecutionHarnesses.get('ses_codex_1')).toBe('codex');
    expect(useSelectionStore.getState().sessionExecutionHarnesses.get('ses_open_1')).toBe('opencode');
  });

  test('resets only execution targets on runtime switch', () => {
    const modelSelections = new Map([['ses_open_1', { providerId: 'provider-a', modelId: 'model-a' }]]);
    useSelectionStore.setState({ sessionModelSelections: modelSelections });
    useSelectionStore.getState().setDraftExecutionHarness('codex');
    useSelectionStore.getState().saveSessionExecutionHarness('ses_codex_1', 'codex');

    useSelectionStore.getState().resetExecutionTargets();

    const state = useSelectionStore.getState();
    expect(state.draftExecutionHarness).toBe('opencode');
    expect(state.sessionExecutionHarnesses.size).toBe(0);
    expect(state.sessionModelSelections).toBe(modelSelections);
  });
});
