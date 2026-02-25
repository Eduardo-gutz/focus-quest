import { asc, eq, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { monitoredApps } from '@/db/schema';

export const APP_NAME_MAX_LENGTH = 30;
export const APP_GOAL_MIN_MINUTES = 5;
export const APP_GOAL_MAX_MINUTES = 480;
export const MAX_ACTIVE_APPS = 10;

export type MonitoredApp = typeof monitoredApps.$inferSelect;

export interface AddAppInput {
  name: string;
  packageName?: string | null;
  iconEmoji?: string | null;
  dailyGoalMinutes: number;
}

export interface UpdateAppInput {
  name?: string;
  packageName?: string | null;
  iconEmoji?: string | null;
  dailyGoalMinutes?: number;
}

export interface GetAppsOptions {
  filter?: 'all' | 'active';
}

interface AppServiceDatabaseLike {
  select: typeof db.select;
  insert: typeof db.insert;
  update: typeof db.update;
  delete: typeof db.delete;
  transaction: typeof db.transaction;
}

const normalizeName = (name: string): string => name.trim();

const validateName = (name: string): void => {
  if (name.length === 0)
    throw new Error('App name is required');
  if (name.length > APP_NAME_MAX_LENGTH)
    throw new Error(`App name must be ${APP_NAME_MAX_LENGTH} characters or less`);
};

const validateDailyGoalMinutes = (value: number): void => {
  if (!Number.isInteger(value))
    throw new Error('Daily goal must be an integer');
  if (value < APP_GOAL_MIN_MINUTES || value > APP_GOAL_MAX_MINUTES) {
    throw new Error(
      `Daily goal must be between ${APP_GOAL_MIN_MINUTES} and ${APP_GOAL_MAX_MINUTES} minutes`,
    );
  }
};

const countActiveApps = async (database: AppServiceDatabaseLike): Promise<number> => {
  const result = await database
    .select({ count: sql<number>`count(*)` })
    .from(monitoredApps)
    .where(eq(monitoredApps.isActive, true));

  return Number(result[0]?.count ?? 0);
};

const ensureCanActivateMoreApps = async (database: AppServiceDatabaseLike): Promise<void> => {
  const activeAppsCount = await countActiveApps(database);
  if (activeAppsCount >= MAX_ACTIVE_APPS)
    throw new Error(`You can only have up to ${MAX_ACTIVE_APPS} active apps`);
};

export const appService = {
  async getApps(options: GetAppsOptions = {}, database: AppServiceDatabaseLike = db): Promise<MonitoredApp[]> {
    const filter = options.filter ?? 'all';
    if (filter === 'active') {
      return database
        .select()
        .from(monitoredApps)
        .where(eq(monitoredApps.isActive, true))
        .orderBy(asc(monitoredApps.createdAt));
    }

    return database
      .select()
      .from(monitoredApps)
      .orderBy(asc(monitoredApps.createdAt));
  },

  async addApp(input: AddAppInput, database: AppServiceDatabaseLike = db): Promise<void> {
    const name = normalizeName(input.name);
    validateName(name);
    validateDailyGoalMinutes(input.dailyGoalMinutes);
    await ensureCanActivateMoreApps(database);

    await database.insert(monitoredApps).values({
      name,
      packageName: input.packageName ?? null,
      iconEmoji: input.iconEmoji ?? null,
      dailyGoalMinutes: input.dailyGoalMinutes,
      isActive: true,
    });
  },

  async updateApp(appId: number, input: UpdateAppInput, database: AppServiceDatabaseLike = db): Promise<void> {
    const payload: UpdateAppInput = {};

    if (input.name !== undefined) {
      const normalizedName = normalizeName(input.name);
      validateName(normalizedName);
      payload.name = normalizedName;
    }

    if (input.dailyGoalMinutes !== undefined) {
      validateDailyGoalMinutes(input.dailyGoalMinutes);
      payload.dailyGoalMinutes = input.dailyGoalMinutes;
    }

    if (input.packageName !== undefined)
      payload.packageName = input.packageName;
    if (input.iconEmoji !== undefined)
      payload.iconEmoji = input.iconEmoji;

    if (Object.keys(payload).length === 0)
      return;

    await database
      .update(monitoredApps)
      .set(payload)
      .where(eq(monitoredApps.id, appId));
  },

  async toggleApp(appId: number, isActive: boolean, database: AppServiceDatabaseLike = db): Promise<void> {
    const appRows = await database
      .select({ isActive: monitoredApps.isActive })
      .from(monitoredApps)
      .where(eq(monitoredApps.id, appId));

    const appRow = appRows[0];
    if (!appRow)
      throw new Error('Monitored app not found');

    if (isActive && !appRow.isActive)
      await ensureCanActivateMoreApps(database);

    await database
      .update(monitoredApps)
      .set({ isActive })
      .where(eq(monitoredApps.id, appId));
  },

  async deleteApp(appId: number, database: AppServiceDatabaseLike = db): Promise<void> {
    const appRows = await database
      .select({ id: monitoredApps.id })
      .from(monitoredApps)
      .where(eq(monitoredApps.id, appId));

    if (!appRows[0])
      throw new Error('Monitored app not found');

    await database
      .delete(monitoredApps)
      .where(eq(monitoredApps.id, appId));
  },

  /**
   * Reemplaza todas las apps con la selección del onboarding.
   * Borra las existentes y añade las nuevas en transacción atómica.
   */
  async replaceAppsForOnboarding(
    apps: AddAppInput[],
    database: AppServiceDatabaseLike = db,
  ): Promise<void> {
    for (const input of apps) {
      validateName(normalizeName(input.name));
      validateDailyGoalMinutes(input.dailyGoalMinutes);
    }

    await database.transaction(async (tx) => {
      const allIds = await tx.select({ id: monitoredApps.id }).from(monitoredApps);
      for (const row of allIds) {
        await tx.delete(monitoredApps).where(eq(monitoredApps.id, row.id));
      }
      for (const input of apps) {
        const name = normalizeName(input.name);
        await tx.insert(monitoredApps).values({
          name,
          packageName: input.packageName ?? null,
          iconEmoji: input.iconEmoji ?? null,
          dailyGoalMinutes: input.dailyGoalMinutes,
          isActive: true,
        });
      }
    });
  },
};
