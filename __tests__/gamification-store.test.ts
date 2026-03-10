import { db } from '@/db/client';
import { useGamificationStore } from '@/stores/gamification-store';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('usage-stats', () => ({
  hasUsageStatsPermission: () => false,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

jest.mock('@/db/client', () => {
  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };
  return { db: mockDb };
});


const mockDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
};

jest.mock('@/services/streakService', () => ({
  streakService: { checkAndUpdateStreak: jest.fn(() => Promise.resolve()) },
}));


describe('gamification store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGamificationStore.setState({
      currentXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysTracked: 0,
      totalGoalsMet: 0,
      unlockedAchievementIds: [],
      lastXpGain: 0,
      pendingLevelUp: null,
      isHydrating: false,
      error: null,
    });
  });

  it('should hydrate from user_stats and unlocked achievements', async () => {
    const whereQueue: Promise<unknown>[] = [
      Promise.resolve([
        {
          id: 1,
          currentXp: 120,
          currentLevel: 2,
          currentStreak: 3,
          longestStreak: 4,
          totalDaysTracked: 3,
          totalGoalsMet: 2,
          lastActiveDate: '2026-02-19',
        },
      ]),
      Promise.resolve([{ id: 'streak_3', unlocked: true, unlockedAt: '2026-02-19T08:00:00Z' }]),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await useGamificationStore.getState().hydrate();
    const state = useGamificationStore.getState();

    expect(state.currentXp).toBe(120);
    expect(state.currentLevel).toBe(2);
    expect(state.currentStreak).toBe(3);
    expect(state.unlockedAchievementIds).toContain('streak_3');
  });

  it('should grant xp and update level', async () => {
    const statsRow = {
      id: 1,
      currentXp: 90,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysTracked: 0,
      totalGoalsMet: 0,
      lastActiveDate: null,
    };

    const whereSelect = jest.fn().mockResolvedValue([statsRow]);
    const fromSelect = jest.fn(() => ({ where: whereSelect }));
    mockDb.select.mockImplementation(() => ({ from: fromSelect }));

    const whereUpdate = jest.fn().mockResolvedValue(undefined);
    const setUpdate = jest.fn(() => ({ where: whereUpdate }));
    mockDb.update.mockImplementation(() => ({ set: setUpdate }));

    await useGamificationStore.getState().grantXp(20);
    const state = useGamificationStore.getState();

    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(state.currentXp).toBe(110);
    expect(state.currentLevel).toBe(2);
    expect(state.lastXpGain).toBe(20);
    expect(state.pendingLevelUp).toEqual({
      level: 2,
      xpGained: 20,
      previousLevel: 1,
    });
  });

  it('should clear pendingLevelUp', () => {
    useGamificationStore.setState({
      pendingLevelUp: { level: 2, xpGained: 20, previousLevel: 1 },
    });
    useGamificationStore.getState().clearPendingLevelUp();
    expect(useGamificationStore.getState().pendingLevelUp).toBeNull();
  });
});
