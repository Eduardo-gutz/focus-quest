import { and, eq } from "drizzle-orm";

import { monitoredApps, usageLogs } from "@/db/schema";

export const USAGE_MIN_MINUTES = 0;
export const USAGE_MAX_MINUTES = 999;
export const XP_REGISTER_USAGE = 10;
export const XP_GOAL_MET = 25;
export const XP_FIRST_LOG_OF_DAY = 5;

interface UpsertUsageInput {
  appId: number;
  minutesUsed: number;
  date: string;
  source?: "manual" | "auto";
}

interface UpsertUsageResult {
  action: "created" | "updated";
  dailyGoalMinutes: number;
  goalMet: boolean;
  minutesUsed: number;
}

interface UsageServiceDatabaseLike {
  select: (...args: unknown[]) => {
    from: (...innerArgs: unknown[]) => {
      where: (...whereArgs: unknown[]) => Promise<unknown[]>;
    };
  };
  insert: (...args: unknown[]) => {
    values: (...innerArgs: unknown[]) => Promise<unknown>;
  };
  update: (...args: unknown[]) => {
    set: (...innerArgs: unknown[]) => {
      where: (...whereArgs: unknown[]) => Promise<unknown>;
    };
  };
}

interface AppLookupRow {
  id: number;
  dailyGoalMinutes: number;
  isActive: boolean;
}

interface ExistingUsageRow {
  id: number;
}

interface CalculateUsageXpPreviewInput {
  minutesUsed: number;
  dailyGoalMinutes: number;
  isFirstLogOfDay: boolean;
  isUpdate: boolean;
}

const validateMinutes = (minutesUsed: number): void => {
  if (!Number.isInteger(minutesUsed))
    throw new Error("Los minutos deben ser un número entero.");
  if (minutesUsed < USAGE_MIN_MINUTES || minutesUsed > USAGE_MAX_MINUTES)
    throw new Error(`Los minutos deben estar entre ${USAGE_MIN_MINUTES} y ${USAGE_MAX_MINUTES}.`);
};

export const calculateUsageXpPreview = ({
  minutesUsed,
  dailyGoalMinutes,
  isFirstLogOfDay,
  isUpdate,
}: CalculateUsageXpPreviewInput): number => {
  if (isUpdate)
    return 0;

  let xp = XP_REGISTER_USAGE;
  if (minutesUsed <= dailyGoalMinutes)
    xp += XP_GOAL_MET;
  if (isFirstLogOfDay)
    xp += XP_FIRST_LOG_OF_DAY;

  return xp;
};

export const usageService = {
  async upsertUsage(
    input: UpsertUsageInput,
    database: UsageServiceDatabaseLike,
  ): Promise<UpsertUsageResult> {
    validateMinutes(input.minutesUsed);

    const appRows = (await database
      .select({
        id: monitoredApps.id,
        dailyGoalMinutes: monitoredApps.dailyGoalMinutes,
        isActive: monitoredApps.isActive,
      })
      .from(monitoredApps)
      .where(eq(monitoredApps.id, input.appId))) as AppLookupRow[];

    const app = appRows[0];
    if (!app || !app.isActive)
      throw new Error("La app seleccionada no está activa.");

    const goalMet = input.minutesUsed <= app.dailyGoalMinutes;
    const source = input.source ?? "manual";

    const existingRows = (await database
      .select({ id: usageLogs.id })
      .from(usageLogs)
      .where(and(eq(usageLogs.appId, input.appId), eq(usageLogs.date, input.date)))) as ExistingUsageRow[];

    const existing = existingRows[0];
    if (existing) {
      await database
        .update(usageLogs)
        .set({
          minutesUsed: input.minutesUsed,
          source,
          goalMet,
        })
        .where(eq(usageLogs.id, existing.id));

      return {
        action: "updated",
        dailyGoalMinutes: app.dailyGoalMinutes,
        goalMet,
        minutesUsed: input.minutesUsed,
      };
    }

    await database.insert(usageLogs).values({
      appId: input.appId,
      date: input.date,
      minutesUsed: input.minutesUsed,
      source,
      goalMet,
    });

    return {
      action: "created",
      dailyGoalMinutes: app.dailyGoalMinutes,
      goalMet,
      minutesUsed: input.minutesUsed,
    };
  },
};

