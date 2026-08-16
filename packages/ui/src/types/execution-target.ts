export type ExecutionHarnessId = 'opencode' | 'codex';

export type OpenCodeExecutionTarget = {
  harnessId: 'opencode';
  providerID: string;
  modelID: string;
  agent?: string;
  variant?: string;
};

type CodexExecutionTarget = {
  harnessId: 'codex';
  modelRef: { kind: 'default' };
};

export type ExecutionTarget = OpenCodeExecutionTarget | CodexExecutionTarget;

export const CODEX_EXECUTION_TARGET: CodexExecutionTarget = Object.freeze({
  harnessId: 'codex',
  modelRef: Object.freeze({ kind: 'default' }),
});

export function resolveExecutionTarget(input: {
  sessionId: string | null;
  draftOpen: boolean;
  selectedHarnessId: ExecutionHarnessId;
  providerID: string | null;
  modelID: string | null;
  agent?: string | null;
  variant?: string | null;
}): ExecutionTarget {
  if (input.sessionId?.startsWith('ses_codex_') ||
    (!input.sessionId && input.draftOpen && input.selectedHarnessId === 'codex')) {
    return CODEX_EXECUTION_TARGET;
  }
  if (!input.providerID || !input.modelID) {
    throw new Error('OpenCode provider and model are required');
  }
  return {
    harnessId: 'opencode',
    providerID: input.providerID,
    modelID: input.modelID,
    ...(input.agent ? { agent: input.agent } : {}),
    ...(input.variant ? { variant: input.variant } : {}),
  };
}

export function isCodexSupportedSurface(input: {
  platform: 'web' | 'desktop' | 'vscode';
  isDesktop: boolean;
  isVSCode: boolean;
  isMobile: boolean;
  isCapacitor: boolean;
}): boolean {
  return input.platform === 'web' && !input.isDesktop && !input.isVSCode &&
    !input.isMobile && !input.isCapacitor;
}
