import { useCallback, useEffect, useMemo, useState } from 'react';

import { useHabitsStore } from '@/stores';
import { MAX_ACTIVE_APPS } from '@/services/appService';
import { rescheduleAll } from '@/services/notificationService';

export interface AddAppPayload {
  name: string;
  iconEmoji?: string | null;
  dailyGoalMinutes: number;
  packageName?: string | null;
}

export interface UpdateAppPayload {
  dailyGoalMinutes?: number;
  name?: string;
  iconEmoji?: string | null;
  packageName?: string | null;
}

export interface LogUsagePayload {
  appId: number;
  minutesUsed: number;
  source?: 'manual' | 'auto';
  date?: string;
}

export const useApps = () => {
  const apps = useHabitsStore((state) => state.apps);
  const todayLogs = useHabitsStore((state) => state.todayLogs);
  const error = useHabitsStore((state) => state.error);
  const isHydrating = useHabitsStore((state) => state.isHydrating);
  const hydrateToday = useHabitsStore((state) => state.hydrateToday);
  const addMonitoredApp = useHabitsStore((state) => state.addMonitoredApp);
  const updateMonitoredApp = useHabitsStore((state) => state.updateMonitoredApp);
  const setAppActive = useHabitsStore((state) => state.setAppActive);
  const deleteMonitoredApp = useHabitsStore((state) => state.deleteMonitoredApp);
  const logUsageInStore = useHabitsStore((state) => state.logUsage);
  const clearError = useHabitsStore((state) => state.clearError);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    void hydrateToday();
  }, [hydrateToday]);

  const activeAppsCount = useMemo(() => apps.filter((app) => app.isActive).length, [apps]);
  const activeApps = useMemo(() => apps.filter((app) => app.isActive), [apps]);

  const refresh = useCallback(async () => {
    await hydrateToday();
  }, [hydrateToday]);

  const addApp = useCallback(async (payload: AddAppPayload) => {
    setIsMutating(true);
    clearError();
    try {
      await addMonitoredApp(payload);
    } finally {
      setIsMutating(false);
    }
  }, [addMonitoredApp, clearError]);

  const updateApp = useCallback(async (appId: number, payload: UpdateAppPayload) => {
    setIsMutating(true);
    clearError();
    try {
      await updateMonitoredApp(appId, payload);
    } finally {
      setIsMutating(false);
    }
  }, [clearError, updateMonitoredApp]);

  const toggleApp = useCallback(async (appId: number, isActive: boolean) => {
    setIsMutating(true);
    clearError();
    try {
      await setAppActive(appId, isActive);
    } finally {
      setIsMutating(false);
    }
  }, [clearError, setAppActive]);

  const deleteApp = useCallback(async (appId: number) => {
    setIsMutating(true);
    clearError();
    try {
      await deleteMonitoredApp(appId);
    } finally {
      setIsMutating(false);
    }
  }, [clearError, deleteMonitoredApp]);

  const logUsage = useCallback(async (payload: LogUsagePayload) => {
    setIsMutating(true);
    clearError();
    try {
      await logUsageInStore(payload);
      void rescheduleAll();
    } finally {
      setIsMutating(false);
    }
  }, [clearError, logUsageInStore]);

  return {
    apps,
    activeApps,
    todayLogs,
    activeAppsCount,
    maxActiveApps: MAX_ACTIVE_APPS,
    isHydrating,
    isMutating,
    error,
    refresh,
    addApp,
    updateApp,
    toggleApp,
    deleteApp,
    logUsage,
    clearError,
  };
};
