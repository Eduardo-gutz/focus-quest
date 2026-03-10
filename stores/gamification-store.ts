import AsyncStorage from '@react-native-async-storage/async-storage';
import { desc, eq, lte } from 'drizzle-orm';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Platform } from 'react-native';
import { hasUsageStatsPermission } from 'usage-stats';

import { XP_ACHIEVEMENT_UNLOCK, xpNeededForLevel as xpNeededForLevelFormula } from '@/constants/gamification';
import { db } from '@/db/client';
import { achievements, dailySummary, monitoredApps, usageLogs, userStats } from '@/db/schema';
import { getLocalIsoDate } from '@/services/dateUtils';
import { streakService } from '@/services/streakService';

export interface PendingLevelUp {
  level: number;
  xpGained: number;
  previousLevel: number;
}

interface GamificationStoreState {
  currentXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysTracked: number;
  totalGoalsMet: number;
  unlockedAchievementIds: string[];
  lastXpGain: number;
  pendingLevelUp: PendingLevelUp | null;
  isHydrating: boolean;
  error: string | null;
}

interface GamificationStoreActions {
  hydrate: () => Promise<void>;
  syncFromDatabase: () => Promise<void>;
  grantXp: (amount: number) => Promise<void>;
  evaluateAndUnlockAchievements: (referenceDate?: string) => Promise<string[]>;
  clearPendingLevelUp: () => void;
  clearError: () => void;
}

interface GamificationStore extends GamificationStoreState, GamificationStoreActions {}

const levelFromXp = (xp: number): number => {
  let level = 1;
  while (xp >= xpNeededForLevelFormula(level))
    level += 1;
  return Math.max(1, level);
};

const initialState: GamificationStoreState = {
  currentXp: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  totalDaysTracked: 0,
  totalGoalsMet: 0,
  unlockedAchievementIds: [],
  lastXpGain: 0,
  pendingLevelUp: null,
  isHydrating: false,
  error: null,
};

const ensureStatsRow = async (): Promise<void> => {
  await db
    .insert(userStats)
    .values({
      id: 1,
      currentXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysTracked: 0,
      totalGoalsMet: 0,
      lastActiveDate: null,
    })
    .onConflictDoNothing();
};

const getStatsSnapshot = async (): Promise<typeof userStats.$inferSelect> => {
  const rows = await db.select().from(userStats).where(eq(userStats.id, 1));
  if (rows[0])
    return rows[0];

  await ensureStatsRow();
  const createdRows = await db.select().from(userStats).where(eq(userStats.id, 1));
  return createdRows[0];
};

const hasAnyUsageLog = async (): Promise<boolean> => {
  const rows = await db.select({ id: usageLogs.id }).from(usageLogs).limit(1);
  return rows.length > 0;
};

const hasPerfectWeek = async (referenceDate: string): Promise<boolean> => {
  const rows = await db
    .select({ allGoalsMet: dailySummary.allGoalsMet })
    .from(dailySummary)
    .where(lte(dailySummary.date, referenceDate))
    .orderBy(desc(dailySummary.date))
    .limit(7);

  return rows.length === 7 && rows.every((row) => row.allGoalsMet);
};

const hasComeback = async (referenceDate: string): Promise<boolean> => {
  const rows = await db
    .select({ allGoalsMet: dailySummary.allGoalsMet })
    .from(dailySummary)
    .where(lte(dailySummary.date, referenceDate))
    .orderBy(dailySummary.date);

  const failedIndex = rows.findIndex((row) => !row.allGoalsMet);
  if (failedIndex === -1)
    return false;

  return rows.slice(failedIndex + 1).some((row) => row.allGoalsMet);
};

const collectAchievementCandidates = async (
  referenceDate: string,
  stats: typeof userStats.$inferSelect,
): Promise<string[]> => {
  const hasAutoTracking = Platform.OS === 'android' && hasUsageStatsPermission();
  const unlocked: string[] = [];
  const activeApps = await db
    .select({ id: monitoredApps.id })
    .from(monitoredApps)
    .where(eq(monitoredApps.isActive, true));
  const usageForDay = await db.select().from(usageLogs).where(eq(usageLogs.date, referenceDate));

  const logsForUsageAchievements = hasAutoTracking
    ? usageForDay.filter((log) => log.source === 'auto')
    : usageForDay;

  if (await hasAnyUsageLog())
    unlocked.push('first_log');
  if (stats.currentStreak >= 3)
    unlocked.push('streak_3');
  if (stats.currentStreak >= 7)
    unlocked.push('streak_7');
  if (stats.currentStreak >= 14)
    unlocked.push('streak_14');
  if (stats.currentStreak >= 30)
    unlocked.push('streak_30');
  if (stats.currentLevel >= 5)
    unlocked.push('level_5');
  if (stats.currentLevel >= 10)
    unlocked.push('level_10');
  if (activeApps.length >= 3)
    unlocked.push('apps_3');
  if (activeApps.length >= 5)
    unlocked.push('apps_5');
  if (stats.currentXp >= 1000)
    unlocked.push('xp_1000');
  if (stats.currentXp >= 5000)
    unlocked.push('xp_5000');
  if (hasAutoTracking)
    unlocked.push('auto_tracker');
  if (logsForUsageAchievements.some((log) => log.minutesUsed === 0))
    unlocked.push('zero_day');
  if (await hasPerfectWeek(referenceDate))
    unlocked.push('perfect_week');
  if (await hasComeback(referenceDate))
    unlocked.push('comeback');

  if (logsForUsageAchievements.length > 0) {
    const appsById = new Map(
      (
        await db
          .select({ id: monitoredApps.id, goal: monitoredApps.dailyGoalMinutes })
          .from(monitoredApps)
          .where(eq(monitoredApps.isActive, true))
      ).map((app) => [app.id, app.goal]),
    );

    const reduction = logsForUsageAchievements.some((log) => {
      const goal = appsById.get(log.appId);
      if (!goal)
        return false;
      return log.minutesUsed <= Math.floor(goal / 2);
    });

    if (reduction)
      unlocked.push('reduction_50');
  }

  return unlocked;
};

export const useGamificationStore = create<GamificationStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      hydrate: async () => {
        set((state) => {
          state.isHydrating = true;
          state.error = null;
        });

        try {
          await streakService.checkAndUpdateStreak(getLocalIsoDate());

          const [stats, unlockedRows] = await Promise.all([
            getStatsSnapshot(),
            db.select().from(achievements).where(eq(achievements.unlocked, true)),
          ]);

          set((state) => {
            state.currentXp = stats.currentXp;
            state.currentLevel = stats.currentLevel;
            state.currentStreak = stats.currentStreak;
            state.longestStreak = stats.longestStreak;
            state.totalDaysTracked = stats.totalDaysTracked;
            state.totalGoalsMet = stats.totalGoalsMet;
            state.unlockedAchievementIds = unlockedRows.map((item) => item.id);
            state.isHydrating = false;
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to hydrate gamification store';
          set((state) => {
            state.isHydrating = false;
            state.error = message;
          });
        }
      },
      syncFromDatabase: async () => {
        await get().hydrate();
      },
      grantXp: async (amount) => {
        if (amount <= 0)
          return;

        try {
          const stats = await getStatsSnapshot();
          const prevLevel = stats.currentLevel;
          const nextXp = stats.currentXp + amount;
          const nextLevel = levelFromXp(nextXp);

          await db
            .update(userStats)
            .set({
              currentXp: nextXp,
              currentLevel: nextLevel,
            })
            .where(eq(userStats.id, 1));

          set((state) => {
            state.currentXp = nextXp;
            state.currentLevel = nextLevel;
            state.lastXpGain = amount;
            if (nextLevel > prevLevel) {
              state.pendingLevelUp = {
                level: nextLevel,
                xpGained: amount,
                previousLevel: prevLevel,
              };
            }
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to grant XP';
          set((state) => {
            state.error = message;
          });
        }
      },
      evaluateAndUnlockAchievements: async (referenceDate) => {
        const targetDate = referenceDate ?? getLocalIsoDate();

        try {
          const stats = await getStatsSnapshot();
          const existingRows = await db.select().from(achievements).where(eq(achievements.unlocked, true));
          const existingUnlocked = new Set(existingRows.map((row) => row.id));
          const candidates = await collectAchievementCandidates(targetDate, stats);
          const newUnlocks = candidates.filter((id) => !existingUnlocked.has(id));

          if (newUnlocks.length > 0) {
            const unlockedAt = new Date().toISOString();
            await Promise.all(
              newUnlocks.map((id) =>
                db
                  .insert(achievements)
                  .values({ id, unlocked: true, unlockedAt })
                  .onConflictDoUpdate({
                    target: achievements.id,
                    set: { unlocked: true, unlockedAt },
                  }),
              ),
            );
          }

          const xpFromUnlocks = newUnlocks.length * XP_ACHIEVEMENT_UNLOCK;
          if (xpFromUnlocks > 0)
            await get().grantXp(xpFromUnlocks);

          const refreshedStats = await getStatsSnapshot();
          const refreshedUnlocked = await db.select().from(achievements).where(eq(achievements.unlocked, true));
          set((state) => {
            state.currentXp = refreshedStats.currentXp;
            state.currentLevel = refreshedStats.currentLevel;
            state.currentStreak = refreshedStats.currentStreak;
            state.longestStreak = refreshedStats.longestStreak;
            state.totalDaysTracked = refreshedStats.totalDaysTracked;
            state.totalGoalsMet = refreshedStats.totalGoalsMet;
            state.unlockedAchievementIds = refreshedUnlocked.map((row) => row.id);
          });

          return newUnlocks;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to evaluate achievements';
          set((state) => {
            state.error = message;
          });
          return [];
        }
      },
      clearPendingLevelUp: () => {
        set((state) => {
          state.pendingLevelUp = null;
        });
      },
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'focusquest-gamification-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentXp: state.currentXp,
        currentLevel: state.currentLevel,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        unlockedAchievementIds: state.unlockedAchievementIds,
      }),
    },
  ),
);
