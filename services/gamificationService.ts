import { desc, eq, lte } from 'drizzle-orm';

import {
    XP_PERFECT_DAY,
    XP_REDUCTION_VS_YESTERDAY,
    XP_STREAK_PER_DAY,
} from '@/constants/gamification';
import { db } from '@/db/client';
import { dailySummary, monitoredApps, usageLogs, userStats } from '@/db/schema';
import { getPreviousLocalIsoDate } from '@/services/dateUtils';
import { summaryService } from '@/services/summaryService';
import { useAchievementToastStore } from '@/stores/achievement-toast-store';
import { useGamificationStore } from '@/stores/gamification-store';

interface ProcessDailyCompletionInput {
  date: string;
  allGoalsMet: boolean;
  activeAppsCount: number;
}

interface ProcessDailyCompletionResult {
  bonusXp: number;
  newStreak: number;
  newLongestStreak: number;
  streakDay: number;
}

const getPrevStreakFromHistory = async (todayDate: string): Promise<number> => {
  const yesterdayStr = getPreviousLocalIsoDate(todayDate);

  const rows = await db
    .select({ date: dailySummary.date, allGoalsMet: dailySummary.allGoalsMet })
    .from(dailySummary)
    .where(lte(dailySummary.date, yesterdayStr))
    .orderBy(desc(dailySummary.date))
    .limit(60);

  const byDate = new Map(rows.map((r) => [r.date, r.allGoalsMet]));

  let streak = 0;
  let cursor = yesterdayStr;
  for (let i = 0; i < 60; i++) {
    const allGoalsMet = byDate.get(cursor);
    if (allGoalsMet === undefined || !allGoalsMet)
      break;
    streak += 1;
    cursor = getPreviousLocalIsoDate(cursor);
  }

  return streak;
};

const getYesterdayTotalMinutes = async (date: string): Promise<number | null> => {
  const yesterdayStr = getPreviousLocalIsoDate(date);

  const logs = await db
    .select({ minutesUsed: usageLogs.minutesUsed, appId: usageLogs.appId })
    .from(usageLogs)
    .where(eq(usageLogs.date, yesterdayStr));

  if (logs.length === 0)
    return null;

  return logs.reduce((sum, log) => sum + log.minutesUsed, 0);
};

const getTodayTotalMinutes = async (date: string): Promise<number> => {
  const logs = await db
    .select({ minutesUsed: usageLogs.minutesUsed })
    .from(usageLogs)
    .where(eq(usageLogs.date, date));

  return logs.reduce((sum, log) => sum + log.minutesUsed, 0);
};

const hasReducedUsageVsYesterday = async (date: string): Promise<boolean> => {
  const [yesterdayTotal, todayTotal] = await Promise.all([
    getYesterdayTotalMinutes(date),
    getTodayTotalMinutes(date),
  ]);

  if (yesterdayTotal === null || yesterdayTotal === 0)
    return false;

  return todayTotal < yesterdayTotal;
};

export const gamificationService = {
  async processDailyCompletion(
    input: ProcessDailyCompletionInput,
  ): Promise<ProcessDailyCompletionResult> {
    const { date, allGoalsMet, activeAppsCount } = input;

    const [statsRows, lastActiveDate] = await Promise.all([
      db.select().from(userStats).where(eq(userStats.id, 1)),
      db.select({ lastActiveDate: userStats.lastActiveDate }).from(userStats).where(eq(userStats.id, 1)),
    ]);

    const stats = statsRows[0];
    const alreadyProcessedToday = lastActiveDate[0]?.lastActiveDate === date;

    if (!stats || alreadyProcessedToday) {
      return {
        bonusXp: 0,
        newStreak: stats?.currentStreak ?? 0,
        newLongestStreak: stats?.longestStreak ?? 0,
        streakDay: 0,
      };
    }

    const prevStreak = await getPrevStreakFromHistory(date);
    const newStreak = allGoalsMet ? prevStreak + 1 : 0;
    const newLongestStreak = Math.max(stats.longestStreak, newStreak);
    const streakDay = allGoalsMet ? newStreak : 0;

    const totalDaysTracked = stats.totalDaysTracked + 1;
    const totalGoalsMet = allGoalsMet
      ? stats.totalGoalsMet + activeAppsCount
      : stats.totalGoalsMet;

    await db
      .update(userStats)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: date,
        totalDaysTracked,
        totalGoalsMet,
      })
      .where(eq(userStats.id, 1));

    let bonusXp = 0;
    if (allGoalsMet) {
      bonusXp += XP_PERFECT_DAY;
      bonusXp += XP_STREAK_PER_DAY * streakDay;
    }

    const reducedVsYesterday = await hasReducedUsageVsYesterday(date);
    if (reducedVsYesterday)
      bonusXp += XP_REDUCTION_VS_YESTERDAY;

    return {
      bonusXp,
      newStreak,
      newLongestStreak,
      streakDay,
    };
  },

  /**
   * Procesa la racha tras un sync (tracking automático).
   * Se llama al abrir la app o volver a foreground cuando el día está completo.
   */
  async processStreakAfterSync(date: string): Promise<void> {
    const snapshot = await summaryService.calculateDailySummary(date);
    const activeApps = await db
      .select({ id: monitoredApps.id })
      .from(monitoredApps)
      .where(eq(monitoredApps.isActive, true));
    const activeAppsCount = activeApps.length;

    if (!snapshot.isCompleteDay || activeAppsCount === 0)
      return;

    const completion = await gamificationService.processDailyCompletion({
      date,
      allGoalsMet: snapshot.allGoalsMet,
      activeAppsCount,
    });

    const didProcessCompletion = completion.bonusXp > 0 || completion.streakDay > 0;
    if (!didProcessCompletion)
      return;

    if (completion.bonusXp > 0)
      await useGamificationStore.getState().grantXp(completion.bonusXp);

    await summaryService.upsertDailySummary({
      date,
      xpEarnedDelta: completion.bonusXp,
      streakDayOverride: completion.streakDay,
    });

    const newUnlocks = await useGamificationStore
      .getState()
      .evaluateAndUnlockAchievements(date);
    if (newUnlocks.length > 0)
      useAchievementToastStore.getState().enqueue(newUnlocks);

    await useGamificationStore.getState().syncFromDatabase();
  },

  async computeStreakDayForDate(date: string): Promise<number> {
    const prevStreak = await getPrevStreakFromHistory(date);
    const rows = await db
      .select({ allGoalsMet: dailySummary.allGoalsMet })
      .from(dailySummary)
      .where(eq(dailySummary.date, date));

    const todaySummary = rows[0];
    if (!todaySummary?.allGoalsMet)
      return 0;

    return prevStreak + 1;
  },
};
