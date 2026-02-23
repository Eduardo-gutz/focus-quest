const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
};

const mockAppService = {
  getApps: jest.fn(),
  addApp: jest.fn(),
  updateApp: jest.fn(),
  toggleApp: jest.fn(),
  deleteApp: jest.fn(),
};

const mockUpsertUsage = jest.fn();
const mockCalculateUsageXpPreview = jest.fn();
const mockUpsertDailySummary = jest.fn();
const mockGrantXp = jest.fn();
const mockEvaluateAndUnlockAchievements = jest.fn();
const mockSyncFromDatabase = jest.fn();

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

jest.mock('@/services/appService', () => ({
  appService: mockAppService,
}));

jest.mock('@/services/usageService', () => ({
  usageService: {
    upsertUsage: mockUpsertUsage,
  },
  calculateUsageXpPreview: mockCalculateUsageXpPreview,
}));

jest.mock('@/services/summaryService', () => ({
  summaryService: {
    upsertDailySummary: mockUpsertDailySummary,
  },
}));

jest.mock('@/stores/gamification-store', () => ({
  useGamificationStore: {
    getState: () => ({
      grantXp: mockGrantXp,
      evaluateAndUnlockAchievements: mockEvaluateAndUnlockAchievements,
      syncFromDatabase: mockSyncFromDatabase,
    }),
  },
}));

import { useHabitsStore } from '@/stores/habits-store';

describe('habits store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useHabitsStore.setState({
      apps: [],
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
      Promise.resolve(logsRows),
      Promise.resolve(summaryRows),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));
    mockAppService.getApps.mockResolvedValue(appsRows);

    await useHabitsStore.getState().hydrateToday('2026-02-19');
    const state = useHabitsStore.getState();

    expect(mockAppService.getApps).toHaveBeenCalledTimes(1);
    expect(mockDb.select).toHaveBeenCalledTimes(2);
    expect(state.apps).toHaveLength(1);
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

  it('should delegate app creation to appService and refresh state', async () => {
    mockAppService.addApp.mockResolvedValue(undefined);
    mockAppService.getApps.mockResolvedValue([]);
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await useHabitsStore.getState().addMonitoredApp({
      name: 'Instagram',
      iconEmoji: ':camera:',
      dailyGoalMinutes: 20,
    });

    expect(mockAppService.addApp).toHaveBeenCalledWith({
      name: 'Instagram',
      iconEmoji: ':camera:',
      dailyGoalMinutes: 20,
    });
    expect(mockAppService.getApps).toHaveBeenCalledTimes(1);
  });

  it('should delegate app updates to appService', async () => {
    mockAppService.updateApp.mockResolvedValue(undefined);
    mockAppService.getApps.mockResolvedValue([]);
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await useHabitsStore.getState().updateMonitoredApp(1, { dailyGoalMinutes: 35 });

    expect(mockAppService.updateApp).toHaveBeenCalledWith(1, { dailyGoalMinutes: 35 });
  });

  it('should delegate app activation toggle to appService', async () => {
    mockAppService.toggleApp.mockResolvedValue(undefined);
    mockAppService.getApps.mockResolvedValue([]);
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await useHabitsStore.getState().setAppActive(2, false);

    expect(mockAppService.toggleApp).toHaveBeenCalledWith(2, false);
  });

  it('should update daily summary through summaryService after logUsage', async () => {
    const logsRows = [{ id: 1, appId: 1, date: '2026-02-19', minutesUsed: 20, source: 'manual', goalMet: true, createdAt: '2026-02-19' }];
    const summaryRows = [{ date: '2026-02-19', totalMinutesUsed: 20, totalMinutesGoal: 30, allGoalsMet: true, xpEarned: 40, streakDay: 1 }];
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve(logsRows),
      Promise.resolve(summaryRows),
    ];
    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));
    mockAppService.getApps.mockResolvedValue([{ id: 1, name: 'TikTok', packageName: null, iconEmoji: null, dailyGoalMinutes: 30, isActive: true, createdAt: '2026-02-19' }]);
    mockUpsertUsage.mockResolvedValue({ action: 'created', dailyGoalMinutes: 30, goalMet: true, minutesUsed: 20 });
    mockCalculateUsageXpPreview.mockReturnValue(40);
    mockUpsertDailySummary.mockResolvedValue(summaryRows[0]);
    mockGrantXp.mockResolvedValue(undefined);
    mockEvaluateAndUnlockAchievements.mockResolvedValue([]);
    mockSyncFromDatabase.mockResolvedValue(undefined);

    await useHabitsStore.getState().logUsage({ appId: 1, minutesUsed: 20, source: 'manual' });

    expect(mockUpsertUsage).toHaveBeenCalledTimes(1);
    expect(mockUpsertDailySummary).toHaveBeenCalledWith({ date: '2026-02-19', xpEarnedDelta: 40 });
    expect(mockGrantXp).toHaveBeenCalledWith(40);
    expect(useHabitsStore.getState().dailySummarySnapshot?.xpEarned).toBe(40);
  });
});
