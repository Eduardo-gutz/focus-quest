jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

import { useSettingsStore } from '@/stores/settings-store';

describe('settings store', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  it('should expose default state', () => {
    const state = useSettingsStore.getState();

    expect(state.theme).toBe('system');
    expect(state.notifications.dailyReminderEnabled).toBe(true);
    expect(state.reminderTime).toEqual({ hour: 21, minute: 0 });
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.permission_modal_shown).toBe(false);
  });

  it('should update and reset preferences', () => {
    const state = useSettingsStore.getState();

    state.setTheme('dark');
    state.setNotifications({ achievementsEnabled: false });
    state.setReminderTime(8, 30);
    state.setOnboardingCompleted(true);
    state.setPermissionModalShown(true);

    const updated = useSettingsStore.getState();
    expect(updated.theme).toBe('dark');
    expect(updated.notifications.achievementsEnabled).toBe(false);
    expect(updated.reminderTime).toEqual({ hour: 8, minute: 30 });
    expect(updated.hasCompletedOnboarding).toBe(true);
    expect(updated.permission_modal_shown).toBe(true);

    updated.resetSettings();
    const reset = useSettingsStore.getState();
    expect(reset.theme).toBe('system');
    expect(reset.notifications.achievementsEnabled).toBe(true);
    expect(reset.reminderTime).toEqual({ hour: 21, minute: 0 });
    expect(reset.hasCompletedOnboarding).toBe(false);
    expect(reset.permission_modal_shown).toBe(false);
  });
});
