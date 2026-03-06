import { Platform } from 'react-native';
import { useCallback, useEffect } from 'react';

import { shouldTriggerPermissionModal } from '@/hooks/permission-modal-trigger.utils';
import { usePermissionModalStore } from '@/stores/permission-modal-store';
import { useSettingsStore } from '@/stores/settings-store';
import { hasUsageStatsPermission } from 'usage-stats';

/**
 * Triggers the permission modal when:
 * - Platform is Android
 * - Onboarding has been completed
 * - User does not have UsageStats permission
 * - Modal has not been shown yet (permission_modal_shown is false)
 *
 * Call this hook in the Dashboard (or the screen where the modal should appear).
 * When S6-T1 onboarding exists, step 4 will show the modal directly;
 * this trigger can be disabled when coming from onboarding.
 */
interface UsePermissionModalTriggerOptions {
  enabled?: boolean;
}

export function usePermissionModalTrigger(options: UsePermissionModalTriggerOptions = {}) {
  const { enabled = true } = options;
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const permissionModalShown = useSettingsStore((s) => s.permission_modal_shown);
  const showPermissionModal = usePermissionModalStore((s) => s.show);

  const shouldShowModal = useCallback(() => {
    if (!enabled) return false;
    return shouldTriggerPermissionModal({
      hasCompletedOnboarding,
      permissionModalShown,
      hasPermission: hasUsageStatsPermission(),
      isAndroid: Platform.OS === 'android',
    });
  }, [enabled, hasCompletedOnboarding, permissionModalShown]);

  useEffect(() => {
    if (shouldShowModal()) {
      showPermissionModal();
    }
  }, [shouldShowModal, showPermissionModal]);
}
