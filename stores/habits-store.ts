import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { db } from '@/db/client';
import { dailySummary, monitoredApps, usageLogs } from '@/db/schema';
import { appService } from '@/services/appService';
import { gamificationService } from '@/services/gamificationService';
import { summaryService } from '@/services/summaryService';
import { calculateUsageXpPreview, usageService } from '@/services/usageService';
import { useAchievementToastStore } from '@/stores/achievement-toast-store';
import { useGamificationStore } from '@/stores/gamification-store';

interface CreateMonitoredAppInput {
  name: string;
  packageName?: string | null;
  iconEmoji?: string | null;
  dailyGoalMinutes: number;
}

interface UpdateMonitoredAppInput {
  name?: string;
  packageName?: string | null;
  iconEmoji?: string | null;
  dailyGoalMinutes?: number;
}

interface LogUsageInput {
  appId: number;
  minutesUsed: number;
  source?: 'manual' | 'auto';
  date?: string;
}

type MonitoredApp = typeof monitoredApps.$inferSelect;
type UsageLog = typeof usageLogs.$inferSelect;
type DailySummary = typeof dailySummary.$inferSelect;

interface HabitsStoreState {
  apps: MonitoredApp[];
  activeApps: MonitoredApp[];
  todayLogs: UsageLog[];
  currentDate: string;
  dailySummarySnapshot: DailySummary | null;
  isHydrating: boolean;
  error: string | null;
}

interface HabitsStoreActions {
  hydrateToday: (date?: string) => Promise<void>;
  addMonitoredApp: (input: CreateMonitoredAppInput) => Promise<void>;
  updateMonitoredApp: (appId: number, input: UpdateMonitoredAppInput) => Promise<void>;
  setAppActive: (appId: number, isActive: boolean) => Promise<void>;
  deleteMonitoredApp: (appId: number) => Promise<void>;
  logUsage: (input: LogUsageInput) => Promise<void>;
  refreshDailySummary: (date?: string, xpEarnedDelta?: number) => Promise<DailySummary | null>;
  clearError: () => void;
}

interface HabitsStore extends HabitsStoreState, HabitsStoreActions {}

const getIsoDate = (): string => new Date().toISOString().slice(0, 10);

const initialState: HabitsStoreState = {
  apps: [],
  activeApps: [],
  todayLogs: [],
  currentDate: getIsoDate(),
  dailySummarySnapshot: null,
  isHydrating: false,
  error: null,
};

export const useHabitsStore = create<HabitsStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      hydrateToday: async (date) => {
        const targetDate = date ?? getIsoDate();
        set((state) => {
          state.isHydrating = true;
          state.error = null;
        });

        try {
          const [apps, logs, summary] = await Promise.all([
            appService.getApps(),
            db.select().from(usageLogs).where(eq(usageLogs.date, targetDate)),
            db.select().from(dailySummary).where(eq(dailySummary.date, targetDate)),
          ]);

          set((state) => {
            state.apps = apps;
            state.activeApps = apps.filter((app) => app.isActive);
            state.todayLogs = logs;
            state.dailySummarySnapshot = summary[0] ?? null;
            state.currentDate = targetDate;
            state.isHydrating = false;
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to hydrate habits store';
          set((state) => {
            state.isHydrating = false;
            state.error = message;
          });
        }
      },
      addMonitoredApp: async (input) => {
        try {
          await appService.addApp(input);
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create monitored app';
          set((state) => {
            state.error = message;
          });
          throw error instanceof Error ? error : new Error(message);
        }
      },
      updateMonitoredApp: async (appId, input) => {
        try {
          await appService.updateApp(appId, input);
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update monitored app';
          set((state) => {
            state.error = message;
          });
          throw error instanceof Error ? error : new Error(message);
        }
      },
      setAppActive: async (appId, isActive) => {
        try {
          await appService.toggleApp(appId, isActive);
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update app status';
          set((state) => {
            state.error = message;
          });
          throw error instanceof Error ? error : new Error(message);
        }
      },
      deleteMonitoredApp: async (appId) => {
        try {
          await appService.deleteApp(appId);
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete monitored app';
          set((state) => {
            state.error = message;
          });
          throw error instanceof Error ? error : new Error(message);
        }
      },
      logUsage: async (input) => {
        const targetDate = input.date ?? get().currentDate ?? getIsoDate();
        try {
          const isFirstLogOfDay = get().todayLogs.filter((log) => log.date === targetDate).length === 0;
          const upsertResult = await usageService.upsertUsage({
            appId: input.appId,
            minutesUsed: input.minutesUsed,
            source: input.source,
            date: targetDate,
          }, db as never);

          const usageXp = calculateUsageXpPreview({
            minutesUsed: upsertResult.minutesUsed,
            dailyGoalMinutes: upsertResult.dailyGoalMinutes,
            isFirstLogOfDay,
            isUpdate: upsertResult.action === 'updated',
          });

          if (usageXp > 0)
            await useGamificationStore.getState().grantXp(usageXp);

          const snapshot = await summaryService.calculateDailySummary(targetDate);
          let bonusXp = 0;
          let streakDayOverride: number | undefined;
          let didProcessCompletion = false;

          if (snapshot.isCompleteDay && get().activeApps.length > 0) {
            const completion = await gamificationService.processDailyCompletion({
              date: targetDate,
              allGoalsMet: snapshot.allGoalsMet,
              activeAppsCount: get().activeApps.length,
            });
            bonusXp = completion.bonusXp;
            didProcessCompletion = bonusXp > 0 || completion.streakDay > 0;
            if (didProcessCompletion)
              streakDayOverride = completion.streakDay;
          }

          if (bonusXp > 0)
            await useGamificationStore.getState().grantXp(bonusXp);

          const totalXpDelta = usageXp + bonusXp;
          const summary = await summaryService.upsertDailySummary({
            date: targetDate,
            xpEarnedDelta: totalXpDelta,
            streakDayOverride: didProcessCompletion ? streakDayOverride : undefined,
          });

          set((state) => {
            state.dailySummarySnapshot = summary;
          });

          const newUnlocks = await useGamificationStore
            .getState()
            .evaluateAndUnlockAchievements(targetDate);
          if (newUnlocks.length > 0)
            useAchievementToastStore.getState().enqueue(newUnlocks);
          await useGamificationStore.getState().syncFromDatabase();

          await get().hydrateToday(targetDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to register usage';
          set((state) => {
            state.error = message;
          });
          throw error instanceof Error ? error : new Error(message);
        }
      },
      refreshDailySummary: async (date, xpEarnedDelta = 0) => {
        const targetDate = date ?? get().currentDate ?? getIsoDate();

        try {
          const snapshot = await summaryService.upsertDailySummary({
            date: targetDate,
            xpEarnedDelta,
          });

          set((state) => {
            state.dailySummarySnapshot = snapshot;
          });

          return snapshot;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to refresh daily summary';
          set((state) => {
            state.error = message;
          });
          return null;
        }
      },
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'focusquest-habits-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        apps: state.apps,
        activeApps: state.activeApps,
        todayLogs: state.todayLogs,
        currentDate: state.currentDate,
        dailySummarySnapshot: state.dailySummarySnapshot,
      }),
    },
  ),
);
