import { useCallback, useEffect, useMemo, useState } from "react";

import { db } from "@/db/client";
import { dailySummary } from "@/db/schema";
import { desc, lte } from "drizzle-orm";
import { TOTAL_ACHIEVEMENTS } from "@/constants/gamification";
import {
  calculateLevelProgress,
  getLevelTitle,
} from "@/services/dashboard-metrics";
import { useGamificationStore } from "@/stores";

const getIsoDate = (): string => new Date().toISOString().slice(0, 10);

const getLastIsoDates = (endDateIso: string, totalDays: number): string[] => {
  const result: string[] = [];
  const [y, m, d] = endDateIso.split("-").map(Number);
  const endDate = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));

  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const current = new Date(endDate);
    current.setUTCDate(endDate.getUTCDate() - offset);
    result.push(current.toISOString().slice(0, 10));
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
  xpEarned: number;
  allGoalsMet: boolean;
}

export const useProfile = () => {
  const currentXp = useGamificationStore((state) => state.currentXp);
  const currentLevel = useGamificationStore((state) => state.currentLevel);
  const currentStreak = useGamificationStore((state) => state.currentStreak);
  const longestStreak = useGamificationStore((state) => state.longestStreak);
  const totalDaysTracked = useGamificationStore((state) => state.totalDaysTracked);
  const totalGoalsMet = useGamificationStore((state) => state.totalGoalsMet);
  const unlockedCount = useGamificationStore(
    (state) => state.unlockedAchievementIds.length,
  );
  const isHydrating = useGamificationStore((state) => state.isHydrating);
  const hydrate = useGamificationStore((state) => state.hydrate);

  const [chartData, setChartData] = useState<ProfileChartDay[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const today = useMemo(() => getIsoDate(), []);
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

  const refreshChart = useCallback(async () => {
    setIsLoadingChart(true);
    try {
      const startDate = sevenDays[0] ?? today;
      const rows = await db
        .select()
        .from(dailySummary)
        .where(lte(dailySummary.date, today))
        .orderBy(desc(dailySummary.date))
        .limit(7);

      const byDate = new Map(rows.map((r) => [r.date, r]));
      const chart: ProfileChartDay[] = sevenDays.map((date) => {
        const row = byDate.get(date);
        return {
          date,
          dayLabel: getSpanishWeekdayLabel(date),
          xpEarned: row?.xpEarned ?? 0,
          allGoalsMet: row?.allGoalsMet ?? false,
        };
      });
      setChartData(chart);
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
    unlockedCount,
    totalAchievements: TOTAL_ACHIEVEMENTS,
    chartData,
    isHydrating: isHydrating || isLoadingChart,
    refresh,
  };
};
