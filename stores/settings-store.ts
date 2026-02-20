import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type AppTheme = 'system' | 'light' | 'dark';

interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  achievementsEnabled: boolean;
}

interface SettingsStoreState {
  theme: AppTheme;
  notifications: NotificationPreferences;
  hasCompletedOnboarding: boolean;
}

interface SettingsStoreActions {
  setTheme: (theme: AppTheme) => void;
  setNotifications: (partialPreferences: Partial<NotificationPreferences>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  resetSettings: () => void;
}

interface SettingsStore extends SettingsStoreState, SettingsStoreActions {}

const initialState: SettingsStoreState = {
  theme: 'system',
  notifications: {
    dailyReminderEnabled: true,
    achievementsEnabled: true,
  },
  hasCompletedOnboarding: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      ...initialState,
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },
      setNotifications: (partialPreferences) => {
        set((state) => {
          state.notifications = {
            ...state.notifications,
            ...partialPreferences,
          };
        });
      },
      setOnboardingCompleted: (completed) => {
        set((state) => {
          state.hasCompletedOnboarding = completed;
        });
      },
      resetSettings: () => {
        set(() => initialState);
      },
    })),
    {
      name: 'focusquest-settings-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
