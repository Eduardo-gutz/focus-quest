import { resetDatabase } from '@/services/database';
import { useGamificationStore } from '@/stores/gamification-store';
import { useHabitsStore } from '@/stores/habits-store';
import { useSettingsStore } from '@/stores/settings-store';

/**
 * Reset all app data: SQLite database and all Zustand stores.
 * Resets to initial state as if the app was freshly installed.
 */
export const resetAllData = async (): Promise<void> => {
  await resetDatabase();
  useSettingsStore.getState().resetSettings();
  await useGamificationStore.getState().hydrate();
  await useHabitsStore.getState().hydrateToday();
};
