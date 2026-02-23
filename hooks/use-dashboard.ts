import { useCallback, useEffect, useMemo } from "react";

import { useApps } from "@/hooks/use-apps";
import {
  calculateDashboardCompletion,
  calculateLevelProgress,
  getGreetingByHour,
} from "@/services/dashboard-metrics";
import { useGamificationStore, useHabitsStore } from "@/stores";

export interface DashboardTopApp {
  id: number;
  name: string;
  iconEmoji: string;
  usedMinutes: number;
  goalMinutes: number;
  progressRatio: number;
  isGoalMet: boolean;
  statusMark: "✓" | "✗";
}

const getIsoDate = (): string => new Date().toISOString().slice(0, 10);

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export const useDashboard = () => {
  const {
    activeApps,
    todayLogs,
    isHydrating: isHydratingApps,
    error: appsError,
    refresh: refreshApps,
  } = useApps();
  const currentDate = useHabitsStore((state) => state.currentDate);
  const dailySummarySnapshot = useHabitsStore((state) => state.dailySummarySnapshot);

  const currentXp = useGamificationStore((state) => state.currentXp);
  const currentLevel = useGamificationStore((state) => state.currentLevel);
  const currentStreak = useGamificationStore((state) => state.currentStreak);
  const isHydratingGamification = useGamificationStore((state) => state.isHydrating);
  const gamificationError = useGamificationStore((state) => state.error);
  const hydrateGamification = useGamificationStore((state) => state.hydrate);

  useEffect(() => {
    void hydrateGamification();
  }, [hydrateGamification]);

  const effectiveDate = currentDate || getIsoDate();
  const greeting = useMemo(() => getGreetingByHour(new Date().getHours()), []);

  const completion = useMemo(
    () => calculateDashboardCompletion(activeApps, todayLogs, effectiveDate),
    [activeApps, todayLogs, effectiveDate],
  );

  const topApps = useMemo<DashboardTopApp[]>(() => {
    const usedMinutesByAppId = new Map<number, number>();
    for (const log of todayLogs) {
      if (log.date !== effectiveDate)
        continue;

      const current = usedMinutesByAppId.get(log.appId) ?? 0;
      usedMinutesByAppId.set(log.appId, current + log.minutesUsed);
    }

    return activeApps.slice(0, 5).map((app) => {
      const usedMinutes = usedMinutesByAppId.get(app.id) ?? 0;
      const progressRatio = app.dailyGoalMinutes > 0
        ? clamp(usedMinutes / app.dailyGoalMinutes)
        : 0;
      const isGoalMet = usedMinutes <= app.dailyGoalMinutes && usedMinutesByAppId.has(app.id);

      return {
        id: app.id,
        name: app.name,
        iconEmoji: app.iconEmoji || "📱",
        usedMinutes,
        goalMinutes: app.dailyGoalMinutes,
        progressRatio,
        isGoalMet,
        statusMark: isGoalMet ? "✓" : "✗",
      };
    });
  }, [activeApps, todayLogs, effectiveDate]);

  const levelProgress = useMemo(
    () => calculateLevelProgress(currentXp, currentLevel),
    [currentXp, currentLevel],
  );

  const refresh = useCallback(async () => {
    await Promise.all([refreshApps(), hydrateGamification()]);
  }, [refreshApps, hydrateGamification]);

  return {
    greeting,
    completionPercentage: completion.completionPercentage,
    metGoalsCount: completion.metGoalsCount,
    totalGoalsCount: completion.totalGoalsCount,
    currentStreak,
    currentLevel,
    levelTitle: levelProgress.levelTitle,
    currentXp,
    xpToday: dailySummarySnapshot?.xpEarned ?? 0,
    levelProgress,
    topApps,
    isHydrating: isHydratingApps || isHydratingGamification,
    error: appsError || gamificationError,
    refresh,
  };
};
