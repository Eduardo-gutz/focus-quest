import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { userStats } from '@/db/schema';

/**
 * Calcula la diferencia en días entre dos fechas ISO (YYYY-MM-DD).
 * Retorna días desde dateA hasta dateB (dateB - dateA).
 */
const daysBetween = (dateA: string, dateB: string): number => {
  const a = new Date(`${dateA}T12:00:00`).getTime();
  const b = new Date(`${dateB}T12:00:00`).getTime();
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
};

/**
 * Verifica si se perdió la racha por días sin registro y actualiza user_stats.
 * Se debe llamar al abrir la app para detectar si hubo días sin registro desde lastActiveDate.
 * Si lastActiveDate + 1 < today, hubo al menos un día sin registro → reset currentStreak a 0.
 */
export const streakService = {
  async checkAndUpdateStreak(today: string): Promise<void> {
    const rows = await db
      .select({ lastActiveDate: userStats.lastActiveDate, currentStreak: userStats.currentStreak })
      .from(userStats)
      .where(eq(userStats.id, 1));

    const row = rows[0];
    if (!row?.lastActiveDate || row.lastActiveDate === today)
      return;

    const diffDays = daysBetween(row.lastActiveDate, today);
    if (diffDays <= 1)
      return;

    await db
      .update(userStats)
      .set({ currentStreak: 0 })
      .where(eq(userStats.id, 1));
  },
};
