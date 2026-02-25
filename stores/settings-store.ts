import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type AppTheme = 'system' | 'light' | 'dark';

interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  achievementsEnabled: boolean;
  nudgingEnabled: boolean;
}

export interface ReminderTime {
  hour: number;
  minute: number;
}

interface SettingsStoreState {
  theme: AppTheme;
  notifications: NotificationPreferences;
  reminderTime: ReminderTime;
  hasCompletedOnboarding: boolean;
}

interface SettingsStoreActions {
  setTheme: (theme: AppTheme) => void;
  setNotifications: (partialPreferences: Partial<NotificationPreferences>) => void;
  setReminderTime: (hour: number, minute: number) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  resetSettings: () => void;
}

interface SettingsStore extends SettingsStoreState, SettingsStoreActions {}

const initialState: SettingsStoreState = {
  theme: 'system',
  notifications: {
    dailyReminderEnabled: true,
    achievementsEnabled: true,
    nudgingEnabled: true,
  },
  reminderTime: { hour: 21, minute: 0 },
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
      setReminderTime: (hour, minute) => {
        set((state) => {
          state.reminderTime = { hour, minute };
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
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<SettingsStoreState>;
        if (version < 2 && !state.reminderTime) {
          state.reminderTime = { hour: 21, minute: 0 };
        }
        if (version < 3 && state.notifications && typeof state.notifications === 'object' && !('nudgingEnabled' in state.notifications)) {
          state.notifications = { ...(state.notifications as NotificationPreferences), nudgingEnabled: true };
        }
        return { ...initialState, ...state } as SettingsStoreState;
      },
    },
  ),
);
