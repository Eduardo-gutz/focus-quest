import { useCallback, useEffect, useMemo, useState } from "react";

import { db } from "@/db/client";
import { useApps } from "@/hooks/use-apps";
import { useHabitsStore } from "@/stores";
import { usageService } from "@/services/usageService";

export interface HistoryDayItem {
  date: string;
  dayLabel: string;
  minutesUsed: number;
  hasLog: boolean;
  isGoalMet: boolean | null;
  statusMark: "✓" | "✗" | "—";
  progressRatio: number;
}

export interface AppDetailStats {
  completionRate: number;
  averageMinutes: number;
  bestStreak: number;
}

const toIsoDateFromParts = (year: number, monthIndex: number, day: number): string =>
  new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);

const parseIsoDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

const getLastIsoDates = (endDateIso: string, totalDays: number): string[] => {
  const result: string[] = [];
  const endDate = parseIsoDate(endDateIso);

  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const current = new Date(endDate);
    current.setUTCDate(endDate.getUTCDate() - offset);
    result.push(toIsoDateFromParts(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()));
  }

  return result;
};

const getSpanishWeekdayLabel = (isoDate: string): string =>
  new Intl.DateTimeFormat("es-ES", { weekday: "short" })
    .format(parseIsoDate(isoDate))
    .replace(".", "")
    .slice(0, 3);

export const normalizeHistoryDays = (
  dates: string[],
  logs: Array<{ date: string; minutesUsed: number }>,
  dailyGoalMinutes: number,
): HistoryDayItem[] => {
  const logsByDate = new Map(logs.map((log) => [log.date, log]));

  return dates.map((date) => {
    const log = logsByDate.get(date);
    const minutesUsed = log?.minutesUsed ?? 0;
    const hasLog = Boolean(log);
    const isGoalMet = hasLog ? minutesUsed <= dailyGoalMinutes : null;
    const statusMark = hasLog ? (isGoalMet ? "✓" : "✗") : "—";
    const progressRatio = dailyGoalMinutes > 0 ? Math.min(minutesUsed / dailyGoalMinutes, 1) : 0;

    return {
      date,
      dayLabel: getSpanishWeekdayLabel(date),
      minutesUsed,
      hasLog,
      isGoalMet,
      statusMark,
      progressRatio,
    };
  });
};

export const calculateAppDetailStats = (
  historyDays: HistoryDayItem[],
): AppDetailStats => {
  const totalDays = historyDays.length;
  if (totalDays === 0) {
    return {
      completionRate: 0,
      averageMinutes: 0,
      bestStreak: 0,
    };
  }

  const metDays = historyDays.reduce((count, day) => count + (day.isGoalMet ? 1 : 0), 0);
  const totalMinutes = historyDays.reduce((sum, day) => sum + day.minutesUsed, 0);

  let currentStreak = 0;
  let bestStreak = 0;
  for (const day of historyDays) {
    if (day.isGoalMet) {
      currentStreak += 1;
      if (currentStreak > bestStreak)
        bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return {
    completionRate: Math.round((metDays / totalDays) * 100),
    averageMinutes: Math.round(totalMinutes / totalDays),
    bestStreak,
  };
};

export const useAppDetail = (appId: number) => {
  const { apps, todayLogs, updateApp } = useApps();
  const currentDate = useHabitsStore((state) => state.currentDate);
  const [historyLogs, setHistoryLogs] = useState<Array<{ date: string; minutesUsed: number }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const app = useMemo(() => apps.find((item) => item.id === appId) ?? null, [apps, appId]);

  const todayUsedMinutes = useMemo(() => (
    todayLogs
      .filter((log) => log.appId === appId && log.date === currentDate)
      .reduce((sum, log) => sum + log.minutesUsed, 0)
  ), [todayLogs, appId, currentDate]);

  const sevenDays = useMemo(() => getLastIsoDates(currentDate, 7), [currentDate]);
  const historyStartDate = sevenDays[0] ?? currentDate;
  const historyEndDate = sevenDays[6] ?? currentDate;

  const refreshHistory = useCallback(async () => {
    if (!app) {
      setHistoryLogs([]);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const rows = await usageService.getUsageHistoryRange({
        appId: app.id,
        startDate: historyStartDate,
        endDate: historyEndDate,
      }, db as never);
      setHistoryLogs(rows.map((row) => ({ date: row.date, minutesUsed: row.minutesUsed })));
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el historial";
      setHistoryError(message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [app, historyStartDate, historyEndDate]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory, todayUsedMinutes]);

  const historyDays = useMemo(() => {
    if (!app) {
      return normalizeHistoryDays(sevenDays, [], 1);
    }

    return normalizeHistoryDays(sevenDays, historyLogs, app.dailyGoalMinutes);
  }, [app, historyLogs, sevenDays]);

  const stats = useMemo(() => calculateAppDetailStats(historyDays), [historyDays]);

  const updateDailyGoal = useCallback(async (dailyGoalMinutes: number) => {
    if (!app)
      return;

    await updateApp(app.id, { dailyGoalMinutes });
  }, [app, updateApp]);

  return {
    app,
    todayUsedMinutes,
    historyDays,
    stats,
    isLoadingHistory,
    historyError,
    refreshHistory,
    updateDailyGoal,
  };
};
