export const getVisiblePermissionPatterns = (patterns: string[], renderedCommand: string): string[] => {
  if (!renderedCommand) return patterns;
  return patterns.filter((pattern) => pattern !== renderedCommand);
};

export const supportsAlwaysPermissionResponse = (permission: { engine?: string }): boolean =>
  permission.engine !== 'codex';
