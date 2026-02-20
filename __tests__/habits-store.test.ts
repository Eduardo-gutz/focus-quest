const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

jest.mock('@/db/client', () => ({
  db: mockDb,
}));

import { useHabitsStore } from '@/stores/habits-store';

describe('habits store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useHabitsStore.setState({
      activeApps: [],
      todayLogs: [],
      currentDate: '2026-02-19',
      dailySummarySnapshot: null,
      isHydrating: false,
      error: null,
    });
  });

  it('should hydrate active apps and daily logs', async () => {
    const appsRows = [{ id: 1, name: 'TikTok', packageName: null, iconEmoji: null, dailyGoalMinutes: 30, isActive: true, createdAt: '2026-02-19' }];
    const logsRows = [{ id: 1, appId: 1, date: '2026-02-19', minutesUsed: 15, source: 'manual', goalMet: true, createdAt: '2026-02-19' }];
    const summaryRows = [{ date: '2026-02-19', totalMinutesUsed: 15, totalMinutesGoal: 30, allGoalsMet: true, xpEarned: 25, streakDay: 1 }];
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve(appsRows),
      Promise.resolve(logsRows),
      Promise.resolve(summaryRows),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await useHabitsStore.getState().hydrateToday('2026-02-19');
    const state = useHabitsStore.getState();

    expect(mockDb.select).toHaveBeenCalledTimes(3);
    expect(state.activeApps).toHaveLength(1);
    expect(state.todayLogs).toHaveLength(1);
    expect(state.dailySummarySnapshot?.allGoalsMet).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should clear error state', () => {
    useHabitsStore.setState((state) => ({ ...state, error: 'boom' }));
    useHabitsStore.getState().clearError();
    expect(useHabitsStore.getState().error).toBeNull();
  });
});
