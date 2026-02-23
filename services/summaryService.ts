import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { dailySummary, monitoredApps, usageLogs } from '@/db/schema';

type DailySummaryRow = typeof dailySummary.$inferSelect;

export interface DailySummaryWithCompletion extends DailySummaryRow {
  isCompleteDay: boolean;
}

interface SummaryServiceDatabaseLike {
  select: typeof db.select;
  insert: typeof db.insert;
}

interface UpsertDailySummaryInput {
  date: string;
  xpEarnedDelta?: number;
  streakDayOverride?: number;
}

const calculateDailySummary = async (
  date: string,
  database: SummaryServiceDatabaseLike,
): Promise<DailySummaryWithCompletion> => {
  const [apps, logs] = await Promise.all([
    database.select().from(monitoredApps).where(eq(monitoredApps.isActive, true)),
    database.select().from(usageLogs).where(eq(usageLogs.date, date)),
  ]);

  const totalMinutesUsed = logs.reduce((sum, log) => sum + log.minutesUsed, 0);
  const totalMinutesGoal = apps.reduce((sum, app) => sum + app.dailyGoalMinutes, 0);
  const isCompleteDay = apps.length > 0 && apps.every((app) =>
    logs.some((log) => log.appId === app.id),
  );
  const allGoalsMet = isCompleteDay && apps.every((app) => {
    const appLogs = logs.filter((log) => log.appId === app.id);
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
    isCompleteDay,
  };
};

export const summaryService = {
  async calculateDailySummary(
    date: string,
    database: SummaryServiceDatabaseLike = db,
  ): Promise<DailySummaryWithCompletion> {
    return calculateDailySummary(date, database);
  },

  async upsertDailySummary(
    input: UpsertDailySummaryInput,
    database: SummaryServiceDatabaseLike = db,
  ): Promise<DailySummaryRow> {
    const xpEarnedDelta = input.xpEarnedDelta ?? 0;
    const streakDayOverride = input.streakDayOverride;
    const snapshot = await calculateDailySummary(input.date, database);
    const currentRows = await database
      .select()
      .from(dailySummary)
      .where(eq(dailySummary.date, input.date));

    const current = currentRows[0];
    const nextXpEarned = (current?.xpEarned ?? 0) + xpEarnedDelta;
    const nextStreakDay = streakDayOverride ?? current?.streakDay ?? snapshot.streakDay;

    await database
      .insert(dailySummary)
      .values({
        date: snapshot.date,
        totalMinutesUsed: snapshot.totalMinutesUsed,
        totalMinutesGoal: snapshot.totalMinutesGoal,
        allGoalsMet: snapshot.allGoalsMet,
        xpEarned: nextXpEarned,
        streakDay: nextStreakDay,
      })
      .onConflictDoUpdate({
        target: dailySummary.date,
        set: {
          totalMinutesUsed: snapshot.totalMinutesUsed,
          totalMinutesGoal: snapshot.totalMinutesGoal,
          allGoalsMet: snapshot.allGoalsMet,
          xpEarned: nextXpEarned,
          streakDay: nextStreakDay,
        },
      });

    return {
      ...snapshot,
      xpEarned: nextXpEarned,
      streakDay: nextStreakDay,
    };
  },
};
