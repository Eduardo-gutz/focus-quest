import { useCallback, useEffect, useState } from "react";

import {
  ACHIEVEMENT_CATALOG,
  TOTAL_ACHIEVEMENTS,
  type AchievementDefinition,
} from "@/constants/gamification";
import { db } from "@/db/client";
import { achievements } from "@/db/schema";
import { useGamificationStore } from "@/stores";
import { eq } from "drizzle-orm";

/** Horas para considerar un logro "recién desbloqueado" (badge ¡Nuevo!) */
const NEW_ACHIEVEMENT_HOURS = 48;

export interface AchievementWithStatus {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt: string | null;
  isNew: boolean;
}

export const formatUnlockedDate = (iso: string): string =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export const useBadges = () => {
  const unlockedAchievementIds = useGamificationStore(
    (state) => state.unlockedAchievementIds,
  );
  const isHydrating = useGamificationStore((state) => state.isHydrating);
  const hydrate = useGamificationStore((state) => state.hydrate);

  const [achievementsWithStatus, setAchievementsWithStatus] = useState<
    AchievementWithStatus[]
  >([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const loadAchievementsWithStatus = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const rows = await db
        .select({ id: achievements.id, unlockedAt: achievements.unlockedAt })
        .from(achievements)
        .where(eq(achievements.unlocked, true));

      const unlockedMap = new Map<string, string | null>();
      for (const row of rows) {
        unlockedMap.set(row.id, row.unlockedAt);
      }

      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - NEW_ACHIEVEMENT_HOURS);
      const cutoffIso = cutoff.toISOString();

      const unlocked: AchievementWithStatus[] = [];
      const locked: AchievementWithStatus[] = [];

      for (const achievement of ACHIEVEMENT_CATALOG) {
        const unlockedAt = unlockedMap.get(achievement.id) ?? null;
        const isUnlocked = !!unlockedAt;
        const isNew = isUnlocked && !!unlockedAt && unlockedAt >= cutoffIso;

        const item: AchievementWithStatus = {
          achievement,
          isUnlocked,
          unlockedAt,
          isNew,
        };

        if (isUnlocked) {
          unlocked.push(item);
        } else {
          locked.push(item);
        }
      }

      unlocked.sort((a, b) => {
        const aAt = a.unlockedAt ?? "";
        const bAt = b.unlockedAt ?? "";
        return bAt.localeCompare(aAt);
      });

      setAchievementsWithStatus([...unlocked, ...locked]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void loadAchievementsWithStatus();
  }, [loadAchievementsWithStatus, unlockedAchievementIds]);

  const refresh = useCallback(async () => {
    await hydrate();
    await loadAchievementsWithStatus();
  }, [hydrate, loadAchievementsWithStatus]);

  return {
    achievementsWithStatus,
    unlockedCount: unlockedAchievementIds.length,
    totalAchievements: TOTAL_ACHIEVEMENTS,
    isHydrating: isHydrating || isLoadingList,
    refresh,
  };
};
