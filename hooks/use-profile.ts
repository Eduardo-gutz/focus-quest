import { useCallback, useEffect, useMemo, useState } from "react";

import { ACHIEVEMENT_CATALOG, TOTAL_ACHIEVEMENTS } from "@/constants/gamification";
import { db } from "@/db/client";
import { dailySummary } from "@/db/schema";
import {
  calculateLevelProgress,
  getLevelTitle,
} from "@/services/dashboard-metrics";
import { getLocalIsoDate } from "@/services/dateUtils";
import { useGamificationStore } from "@/stores";
import { count, desc, eq, lte } from "drizzle-orm";

/** Últimos N días incluyendo hoy, ordenados de más antiguo a más reciente */
const getLastIsoDates = (endDateIso: string, totalDays: number): string[] => {
  const result: string[] = [];
  const [y, m, d] = endDateIso.split("-").map(Number);
  const endDate = new Date(y, (m ?? 1) - 1, d ?? 1);

  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const current = new Date(endDate);
    current.setDate(endDate.getDate() - offset);
    const cy = current.getFullYear();
    const cm = String(current.getMonth() + 1).padStart(2, "0");
    const cd = String(current.getDate()).padStart(2, "0");
    result.push(`${cy}-${cm}-${cd}`);
  }

  return result;
};

const getSpanishWeekdayLabel = (isoDate: string): string =>
  new Intl.DateTimeFormat("es-ES", { weekday: "short" })
    .format(new Date(isoDate + "T12:00:00"))
    .replace(".", "")
    .slice(0, 3);

export interface ProfileChartDay {
  date: string;
  dayLabel: string;
  /** Minutos totales usados en apps monitoreadas ese día */
  minutesUsed: number;
  allGoalsMet: boolean;
  /** true si existe fila en daily_summary para esa fecha */
  hasRecord: boolean;
}

export const useProfile = () => {
  const currentXp = useGamificationStore((state) => state.currentXp);
  const currentLevel = useGamificationStore((state) => state.currentLevel);
  const currentStreak = useGamificationStore((state) => state.currentStreak);
  const longestStreak = useGamificationStore((state) => state.longestStreak);
  const totalDaysTracked = useGamificationStore((state) => state.totalDaysTracked);
  const totalGoalsMet = useGamificationStore((state) => state.totalGoalsMet);
  const unlockedAchievementIds = useGamificationStore(
    (state) => state.unlockedAchievementIds,
  );
  const unlockedCount = unlockedAchievementIds.length;
  const isHydrating = useGamificationStore((state) => state.isHydrating);
  const hydrate = useGamificationStore((state) => state.hydrate);

  const [chartData, setChartData] = useState<ProfileChartDay[]>([]);
  const [daysWithAllGoalsMet, setDaysWithAllGoalsMet] = useState(0);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const today = getLocalIsoDate();
  const sevenDays = useMemo(() => getLastIsoDates(today, 7), [today]);

  const levelProgress = useMemo(
    () => calculateLevelProgress(currentXp, currentLevel),
    [currentXp, currentLevel],
  );

  const levelTitle = useMemo(
    () => getLevelTitle(currentLevel),
    [currentLevel],
  );

  const levelEmoji = useMemo(() => {
    const emojis = ["🌱", "📗", "📘", "📙", "⭐", "🏆"];
    return emojis[Math.min(currentLevel - 1, emojis.length - 1)];
  }, [currentLevel]);

  const achievementsList = useMemo(() => {
    const unlockedSet = new Set(unlockedAchievementIds);
    const unlocked: typeof ACHIEVEMENT_CATALOG = [];
    const locked: typeof ACHIEVEMENT_CATALOG = [];
    for (const a of ACHIEVEMENT_CATALOG) {
      if (unlockedSet.has(a.id)) unlocked.push(a);
      else locked.push(a);
    }
    return [...unlocked, ...locked];
  }, [unlockedAchievementIds]);

  const controlPercentage = useMemo(
    () =>
      totalDaysTracked > 0
        ? Math.min(
            100,
            Math.round((daysWithAllGoalsMet / totalDaysTracked) * 100),
          )
        : 0,
    [totalDaysTracked, daysWithAllGoalsMet],
  );

  const refreshChart = useCallback(async () => {
    setIsLoadingChart(true);
    try {
      const [rows, daysMetResult] = await Promise.all([
        db
          .select()
          .from(dailySummary)
          .where(lte(dailySummary.date, today))
          .orderBy(desc(dailySummary.date))
          .limit(7),
        db
          .select({ count: count() })
          .from(dailySummary)
          .where(eq(dailySummary.allGoalsMet, true)),
      ]);

      const byDate = new Map(rows.map((r) => [r.date, r]));
      const chart: ProfileChartDay[] = sevenDays.map((date) => {
        const row = byDate.get(date);
        const hasRecord = !!row;
        return {
          date,
          dayLabel: getSpanishWeekdayLabel(date),
          minutesUsed: row?.totalMinutesUsed ?? 0,
          allGoalsMet: row?.allGoalsMet ?? false,
          hasRecord,
        };
      });
      setChartData(chart);
      setDaysWithAllGoalsMet(daysMetResult[0]?.count ?? 0);
    } finally {
      setIsLoadingChart(false);
    }
  }, [sevenDays, today]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void refreshChart();
  }, [refreshChart]);

  const refresh = useCallback(async () => {
    await Promise.all([hydrate(), refreshChart()]);
  }, [hydrate, refreshChart]);

  return {
    levelEmoji,
    currentLevel,
    levelTitle,
    levelProgress,
    currentStreak,
    longestStreak,
    totalDaysTracked,
    totalGoalsMet,
    controlPercentage,
      unlockedCount,
      unlockedAchievementIds,
      totalAchievements: TOTAL_ACHIEVEMENTS,
      achievementsList,
    chartData,
    isHydrating: isHydrating || isLoadingChart,
    refresh,
  };
};
