import { getLevelTitle as getLevelTitleFromConstants, xpNeededForLevel as xpNeededForLevelFromConstants } from '@/constants/gamification';

export interface DashboardLevelProgress {
  currentXp: number;
  currentLevel: number;
  levelTitle: string;
  previousLevelThreshold: number;
  nextLevelThreshold: number;
  xpInCurrentLevel: number;
  xpRangeInCurrentLevel: number;
  xpToNextLevel: number;
  progressRatio: number;
}

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export const xpNeededForLevel = xpNeededForLevelFromConstants;
export const getLevelTitle = getLevelTitleFromConstants;

export const getGreetingByHour = (hour: number, userName?: string): string => {
  const normalizedHour = Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 12;
  const name = userName?.trim() || "FocusQuester";

  if (normalizedHour < 12)
    return `Buenos días, ${name}`;
  if (normalizedHour < 19)
    return `Buenas tardes, ${name}`;
  return `Buenas noches, ${name}`;
};

export const calculateDashboardCompletion = (
  activeApps: { id: number; dailyGoalMinutes: number }[],
  logs: { appId: number; date: string; minutesUsed: number }[],
  currentDate: string,
): { usedPercentage: number; minutesUsed: number; minutesGoal: number } => {
  if (activeApps.length === 0) {
    return {
      usedPercentage: 0,
      minutesUsed: 0,
      minutesGoal: 0,
    };
  }

  const usedMinutesByAppId = new Map<number, number>();
  for (const log of logs) {
    if (log.date !== currentDate)
      continue;

    const current = usedMinutesByAppId.get(log.appId) ?? 0;
    usedMinutesByAppId.set(log.appId, current + log.minutesUsed);
  }

  let totalUsedMinutes = 0;
  let totalGoalMinutes = 0;

  for (const app of activeApps) {
    const usedMinutes = usedMinutesByAppId.get(app.id) ?? 0;
    totalUsedMinutes += usedMinutes;
    totalGoalMinutes += app.dailyGoalMinutes;
  }

  const usedPercentage = totalGoalMinutes > 0
    ? Math.min(100, Math.round((totalUsedMinutes / totalGoalMinutes) * 100))
    : 0;

  return {
    usedPercentage,
    minutesUsed: totalUsedMinutes,
    minutesGoal: totalGoalMinutes,
  };
};

export const calculateLevelProgress = (currentXp: number, currentLevel: number): DashboardLevelProgress => {
  const safeLevel = Math.max(1, currentLevel);
  const previousLevelThreshold = safeLevel <= 1 ? 0 : xpNeededForLevel(safeLevel - 1);
  const nextLevelThreshold = xpNeededForLevel(safeLevel);
  const xpRangeInCurrentLevel = Math.max(1, nextLevelThreshold - previousLevelThreshold);
  const xpInCurrentLevel = Math.max(0, currentXp - previousLevelThreshold);
  const progressRatio = clamp(xpInCurrentLevel / xpRangeInCurrentLevel);

  return {
    currentXp,
    currentLevel: safeLevel,
    levelTitle: getLevelTitle(safeLevel),
    previousLevelThreshold,
    nextLevelThreshold,
    xpInCurrentLevel,
    xpRangeInCurrentLevel,
    xpToNextLevel: Math.max(0, nextLevelThreshold - currentXp),
    progressRatio,
  };
};
