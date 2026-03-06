import { useEffect } from "react";

import { getMsUntilNextLocalMidnight } from "@/services/dateUtils";
import { syncUsageFromUsageStats } from "@/services/syncService";
import { useGamificationStore } from "@/stores/gamification-store";
import { useHabitsStore } from "@/stores/habits-store";

/**
 * Programa un timer que se dispara en la próxima medianoche local.
 * Al cruzar el día (incluso con la app abierta) fuerza:
 *  1. Sync de uso de Android
 *  2. Hidratación del store de hábitos con la nueva fecha
 *  3. Hidratación del store de gamificación (chequeo de racha)
 *
 * Se re-registra automáticamente tras cada rollover para cubrir días consecutivos.
 */
export function useDayRollover(isDatabaseReady: boolean) {
  const hydrateToday = useHabitsStore((s) => s.hydrateToday);
  const hydrateGamification = useGamificationStore((s) => s.hydrate);

  useEffect(() => {
    if (!isDatabaseReady) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextRollover = () => {
      const msUntilMidnight = getMsUntilNextLocalMidnight();

      timeoutId = setTimeout(async () => {
        await syncUsageFromUsageStats();
        await hydrateToday();
        await hydrateGamification();
        scheduleNextRollover();
      }, msUntilMidnight);
    };

    scheduleNextRollover();

    return () => clearTimeout(timeoutId);
  }, [isDatabaseReady, hydrateToday, hydrateGamification]);
}
