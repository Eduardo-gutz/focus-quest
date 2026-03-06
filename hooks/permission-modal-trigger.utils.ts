interface PermissionModalTriggerState {
  hasCompletedOnboarding: boolean;
  permissionModalShown: boolean;
  hasPermission: boolean;
  isAndroid: boolean;
}

export function shouldTriggerPermissionModal({
  hasCompletedOnboarding,
  permissionModalShown,
  hasPermission,
  isAndroid,
}: PermissionModalTriggerState): boolean {
  if (!isAndroid) return false;
  if (!hasCompletedOnboarding) return false;
  if (hasPermission) return false;
  if (permissionModalShown) return false;
  return true;
}
