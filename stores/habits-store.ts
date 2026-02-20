import AsyncStorage from '@react-native-async-storage/async-storage';
import { and, eq } from 'drizzle-orm';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { db } from '@/db/client';
import { dailySummary, monitoredApps, usageLogs } from '@/db/schema';

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
  logUsage: (input: LogUsageInput) => Promise<void>;
  refreshDailySummary: (date?: string) => Promise<DailySummary | null>;
  clearError: () => void;
}

interface HabitsStore extends HabitsStoreState, HabitsStoreActions {}

const getIsoDate = (): string => new Date().toISOString().slice(0, 10);

const initialState: HabitsStoreState = {
  activeApps: [],
  todayLogs: [],
  currentDate: getIsoDate(),
  dailySummarySnapshot: null,
  isHydrating: false,
  error: null,
};

const calculateDailySnapshot = async (date: string): Promise<DailySummary> => {
  const [apps, logs] = await Promise.all([
    db.select().from(monitoredApps).where(eq(monitoredApps.isActive, true)),
    db.select().from(usageLogs).where(eq(usageLogs.date, date)),
  ]);

  const totalMinutesUsed = logs.reduce((sum, log) => sum + log.minutesUsed, 0);
  const totalMinutesGoal = apps.reduce((sum, app) => sum + app.dailyGoalMinutes, 0);
  const allGoalsMet = apps.length > 0 && apps.every((app) => {
    const appLogs = logs.filter((log) => log.appId === app.id);
    if (appLogs.length === 0)
      return false;
    const appTotalMinutes = appLogs.reduce((sum, log) => sum + log.minutesUsed, 0);
    return appTotalMinutes <= app.dailyGoalMinutes;
  });

  return {
    date,
    totalMinutesUsed,
    totalMinutesGoal,
    allGoalsMet,
    xpEarned: 0,
    streakDay: 0,
  };
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
            db.select().from(monitoredApps).where(eq(monitoredApps.isActive, true)),
            db.select().from(usageLogs).where(eq(usageLogs.date, targetDate)),
            db.select().from(dailySummary).where(eq(dailySummary.date, targetDate)),
          ]);

          set((state) => {
            state.activeApps = apps;
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
          await db.insert(monitoredApps).values({
            name: input.name,
            packageName: input.packageName ?? null,
            iconEmoji: input.iconEmoji ?? null,
            dailyGoalMinutes: input.dailyGoalMinutes,
            isActive: true,
          });
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create monitored app';
          set((state) => {
            state.error = message;
          });
        }
      },
      updateMonitoredApp: async (appId, input) => {
        try {
          await db
            .update(monitoredApps)
            .set({
              name: input.name,
              packageName: input.packageName,
              iconEmoji: input.iconEmoji,
              dailyGoalMinutes: input.dailyGoalMinutes,
            })
            .where(eq(monitoredApps.id, appId));
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update monitored app';
          set((state) => {
            state.error = message;
          });
        }
      },
      setAppActive: async (appId, isActive) => {
        try {
          await db
            .update(monitoredApps)
            .set({ isActive })
            .where(eq(monitoredApps.id, appId));
          await get().hydrateToday(get().currentDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update app status';
          set((state) => {
            state.error = message;
          });
        }
      },
      logUsage: async (input) => {
        const targetDate = input.date ?? get().currentDate ?? getIsoDate();
        try {
          const app = await db
            .select()
            .from(monitoredApps)
            .where(and(eq(monitoredApps.id, input.appId), eq(monitoredApps.isActive, true)));

          if (!app[0])
            throw new Error('Monitored app not found');

          const appGoal = app[0].dailyGoalMinutes;

          await db.insert(usageLogs).values({
            appId: input.appId,
            date: targetDate,
            minutesUsed: input.minutesUsed,
            source: input.source ?? 'manual',
            goalMet: input.minutesUsed <= appGoal,
          });

          await get().refreshDailySummary(targetDate);
          await get().hydrateToday(targetDate);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to register usage';
          set((state) => {
            state.error = message;
          });
        }
      },
      refreshDailySummary: async (date) => {
        const targetDate = date ?? get().currentDate ?? getIsoDate();

        try {
          const snapshot = await calculateDailySnapshot(targetDate);

          await db
            .insert(dailySummary)
            .values(snapshot)
            .onConflictDoUpdate({
              target: dailySummary.date,
              set: {
                totalMinutesUsed: snapshot.totalMinutesUsed,
                totalMinutesGoal: snapshot.totalMinutesGoal,
                allGoalsMet: snapshot.allGoalsMet,
              },
            });

          set((state) => {
            state.dailySummarySnapshot = {
              ...snapshot,
              xpEarned: state.dailySummarySnapshot?.xpEarned ?? 0,
              streakDay: state.dailySummarySnapshot?.streakDay ?? 0,
            };
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
        activeApps: state.activeApps,
        todayLogs: state.todayLogs,
        currentDate: state.currentDate,
        dailySummarySnapshot: state.dailySummarySnapshot,
      }),
    },
  ),
);
