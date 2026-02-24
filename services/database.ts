import { eq, inArray, sql } from 'drizzle-orm';
import { migrate as runMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { ACHIEVEMENT_IDS } from '@/constants/gamification';
import { db } from '@/db/client';
import {
  achievements,
  dailySummary,
  monitoredApps,
  usageLogs,
  userStats,
} from '@/db/schema';
import migrations from '@/drizzle/migrations';

interface InitDatabaseOptions {
  forceSeedOnStartup?: boolean;
  isDev?: boolean;
}

interface DatabaseLike {
  insert: typeof db.insert;
  select: typeof db.select;
  transaction: typeof db.transaction;
}

interface InsertOnlyDatabase {
  insert: typeof db.insert;
}


function getIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function migrate(database: typeof db = db): Promise<void> {
  await runMigrations(database, migrations);
}

export async function ensureUserStatsSingleton(database: InsertOnlyDatabase = db): Promise<void> {
  await database
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
}

export async function seed(database: DatabaseLike = db): Promise<boolean> {
  const alreadySeeded = await database
    .select({ count: sql<number>`count(*)` })
    .from(monitoredApps);

  if (alreadySeeded[0]?.count > 0)
    return false;

  await database.transaction(async (tx) => {
    await tx.insert(monitoredApps).values([
      { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', iconEmoji: ':music:', dailyGoalMinutes: 30 },
      { name: 'Instagram', packageName: 'com.instagram.android', iconEmoji: ':camera:', dailyGoalMinutes: 25 },
      { name: 'YouTube', packageName: 'com.google.android.youtube', iconEmoji: ':play:', dailyGoalMinutes: 40 },
    ]);

    await ensureUserStatsSingleton(tx);

    const appRows = await tx
      .select({ id: monitoredApps.id, name: monitoredApps.name, dailyGoalMinutes: monitoredApps.dailyGoalMinutes })
      .from(monitoredApps)
      .where(inArray(monitoredApps.name, ['TikTok', 'Instagram', 'YouTube']));

    const today = getIsoDate();

    // await tx.insert(usageLogs).values(
    //   appRows.map((app) => ({
    //     appId: app.id,
    //     date: today,
    //     minutesUsed: Math.max(5, app.dailyGoalMinutes - 5),
    //     source: 'manual',
    //     goalMet: true,
    //   })),
    // );

    await tx.insert(dailySummary).values({
      date: today,
      totalMinutesUsed: appRows.reduce((sum, app) => sum + Math.max(5, app.dailyGoalMinutes - 5), 0),
      totalMinutesGoal: appRows.reduce((sum, app) => sum + app.dailyGoalMinutes, 0),
      allGoalsMet: true,
      xpEarned: 50,
      streakDay: 1,
    });

    await tx.insert(achievements).values(
      ACHIEVEMENT_IDS.map((id) => ({
        id,
        unlocked: false,
        unlockedAt: null,
      })),
    ).onConflictDoNothing();

    await tx
      .update(userStats)
      .set({
        currentXp: 50,
        currentStreak: 1,
        longestStreak: 1,
        totalDaysTracked: 1,
        totalGoalsMet: appRows.length,
        lastActiveDate: today,
      })
      .where(eq(userStats.id, 1));
  });

  return true;
}

export function shouldSeedOnStartup(options: InitDatabaseOptions = {}): boolean {
  const isDev = options.isDev ?? __DEV__;
  const forceSeedOnStartup = options.forceSeedOnStartup ?? process.env.EXPO_PUBLIC_DB_FORCE_SEED === '1';

  return isDev || forceSeedOnStartup;
}

export async function init(options: InitDatabaseOptions = {}): Promise<void> {
  await migrate();
  await ensureUserStatsSingleton();

  if (shouldSeedOnStartup(options))
    await seed();
}

/**
 * Delete all data from the database and reset to initial state.
 */
export async function resetDatabase(database: typeof db = db): Promise<void> {
  await database.delete(usageLogs);
  await database.delete(dailySummary);
  await database.delete(achievements);
  await database.delete(monitoredApps);
  await ensureUserStatsSingleton(database);
  await database
    .update(userStats)
    .set({
      currentXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysTracked: 0,
      totalGoalsMet: 0,
      lastActiveDate: null,
    })
    .where(eq(userStats.id, 1));
}
