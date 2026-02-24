import { create } from 'zustand';

import {
  ACHIEVEMENT_CATALOG,
  XP_ACHIEVEMENT_UNLOCK,
} from '@/constants/gamification';

export interface AchievementToastItem {
  id: string;
  achievementId: string;
  emoji: string;
  name: string;
  xpAmount: number;
}

interface AchievementToastStoreState {
  queue: AchievementToastItem[];
}

interface AchievementToastStoreActions {
  enqueue: (achievementIds: string[]) => void;
  dequeue: () => void;
  getCurrentItem: () => AchievementToastItem | null;
}

interface AchievementToastStore
  extends AchievementToastStoreState,
    AchievementToastStoreActions {}

const catalogById = new Map(
  ACHIEVEMENT_CATALOG.map((a) => [a.id, a]),
);

const toToastItem = (
  achievementId: string,
  index: number,
): AchievementToastItem | null => {
  const def = catalogById.get(achievementId);
  if (!def)
    return null;

  return {
    id: `toast-${achievementId}-${Date.now()}-${index}`,
    achievementId: def.id,
    emoji: def.emoji,
    name: def.name,
    xpAmount: XP_ACHIEVEMENT_UNLOCK,
  };
};

export const useAchievementToastStore = create<AchievementToastStore>()(
  (set, get) => ({
    queue: [],

    enqueue: (achievementIds) => {
      if (achievementIds.length === 0)
        return;

      const items = achievementIds
        .map((id, i) => toToastItem(id, i))
        .filter((item): item is AchievementToastItem => item !== null);

      if (items.length === 0)
        return;

      set((state) => ({
        queue: [...state.queue, ...items],
      }));
    },

    dequeue: () => {
      set((state) => ({
        queue: state.queue.slice(1),
      }));
    },

    getCurrentItem: () => {
      const { queue } = get();
      return queue[0] ?? null;
    },
  }),
);
