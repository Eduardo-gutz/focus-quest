import { shouldTriggerPermissionModal } from '@/hooks/permission-modal-trigger.utils';

describe('usePermissionModalTrigger', () => {
  it('should not trigger before onboarding completion', () => {
    const shouldTrigger = shouldTriggerPermissionModal({
      hasCompletedOnboarding: false,
      permissionModalShown: false,
      hasPermission: false,
      isAndroid: true,
    });

    expect(shouldTrigger).toBe(false);
  });

  it('should trigger when onboarding is completed and permission is missing', () => {
    const shouldTrigger = shouldTriggerPermissionModal({
      hasCompletedOnboarding: true,
      permissionModalShown: false,
      hasPermission: false,
      isAndroid: true,
    });

    expect(shouldTrigger).toBe(true);
  });

  it('should not trigger if permission already granted', () => {
    const shouldTrigger = shouldTriggerPermissionModal({
      hasCompletedOnboarding: true,
      permissionModalShown: false,
      hasPermission: true,
      isAndroid: true,
    });

    expect(shouldTrigger).toBe(false);
  });

  it('should not trigger if modal was already shown', () => {
    const shouldTrigger = shouldTriggerPermissionModal({
      hasCompletedOnboarding: true,
      permissionModalShown: true,
      hasPermission: false,
      isAndroid: true,
    });

    expect(shouldTrigger).toBe(false);
  });
});
