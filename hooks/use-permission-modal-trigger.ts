import { Platform } from 'react-native';
import { useCallback, useEffect } from 'react';

import { usePermissionModalStore } from '@/stores/permission-modal-store';
import { useSettingsStore } from '@/stores/settings-store';
import { hasUsageStatsPermission } from 'usage-stats';

/**
 * Triggers the permission modal when:
 * - Platform is Android
 * - User does not have UsageStats permission
 * - Modal has not been shown yet (permission_modal_shown is false)
 *
 * Call this hook in the Dashboard (or the screen where the modal should appear).
 * When S6-T1 onboarding exists, step 4 will show the modal directly;
 * this trigger can be disabled when coming from onboarding.
 */
export function usePermissionModalTrigger() {
  const permissionModalShown = useSettingsStore((s) => s.permission_modal_shown);
  const showPermissionModal = usePermissionModalStore((s) => s.show);

  const shouldShowModal = useCallback(() => {
    if (Platform.OS !== 'android') return false;
    if (hasUsageStatsPermission()) return false;
    if (permissionModalShown) return false;
    return true;
  }, [permissionModalShown]);

  useEffect(() => {
    if (shouldShowModal()) {
      showPermissionModal();
    }
  }, [shouldShowModal, showPermissionModal]);
}
