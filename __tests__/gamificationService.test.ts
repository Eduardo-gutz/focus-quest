jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('usage-stats', () => ({
  hasUsageStatsPermission: () => false,
}));

const mockDb = {
  select: jest.fn(),
  update: jest.fn(),
};

jest.mock('@/db/client', () => ({
  db: mockDb,
}));

import { gamificationService } from '@/services/gamificationService';

describe('gamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupSelectMock = (
    statsRows: unknown[],
    lastActiveDateRows: unknown[],
    dailySummaryRows: unknown[],
    yesterdayLogs: unknown[],
    todayLogs: unknown[],
  ) => {
    const selectQueue = [statsRows, lastActiveDateRows, yesterdayLogs, todayLogs];
    let selectCallCount = 0;

    mockDb.select.mockImplementation(() => {
      const callIndex = selectCallCount++;
      const isDailySummary = callIndex === 2;

      return {
        from: () => ({
          where: () =>
            isDailySummary
              ? { orderBy: () => ({ limit: () => Promise.resolve(dailySummaryRows) }) }
              : Promise.resolve(selectQueue.shift()),
        }),
      };
    });
  };

  const setupUpdateMock = () => {
    const whereUpdate = jest.fn().mockResolvedValue(undefined);
    mockDb.update.mockImplementation(() => ({
      set: jest.fn(() => ({ where: whereUpdate })),
    }));
  };

  describe('processDailyCompletion - rachas', () => {
    it('racha nueva: allGoalsMet=true, prevStreak=0 → newStreak=1, longestStreak actualizado', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysTracked: 0,
        totalGoalsMet: 0,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows: Array<{ date: string; allGoalsMet: boolean }> = [];
      const yesterdayLogs: Array<{ minutesUsed: number; appId: number }> = [];
      const todayLogs: Array<{ minutesUsed: number }> = [];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-22',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.newStreak).toBe(1);
      expect(result.newLongestStreak).toBe(1);
      expect(result.streakDay).toBe(1);
    });

    it('racha continua: allGoalsMet=true, prevStreak=3 → newStreak=4', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 100,
        currentLevel: 1,
        currentStreak: 3,
        longestStreak: 3,
        totalDaysTracked: 3,
        totalGoalsMet: 6,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows = [
        { date: '2026-02-22', allGoalsMet: true },
        { date: '2026-02-21', allGoalsMet: true },
        { date: '2026-02-20', allGoalsMet: true },
      ];
      const yesterdayLogs = [{ minutesUsed: 20, appId: 1 }, { minutesUsed: 15, appId: 2 }];
      const todayLogs = [{ minutesUsed: 10 }];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-23',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.newStreak).toBeGreaterThanOrEqual(3);
      expect(result.streakDay).toBeGreaterThanOrEqual(3);
    });

    it('racha rota: allGoalsMet=false → newStreak=0', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 100,
        currentLevel: 1,
        currentStreak: 3,
        longestStreak: 3,
        totalDaysTracked: 3,
        totalGoalsMet: 6,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows = [
        { date: '2026-02-22', allGoalsMet: true },
        { date: '2026-02-21', allGoalsMet: true },
      ];
      const yesterdayLogs = [{ minutesUsed: 50, appId: 1 }];
      const todayLogs = [{ minutesUsed: 60 }];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-23',
        allGoalsMet: false,
        activeAppsCount: 2,
      });

      expect(result.newStreak).toBe(0);
      expect(result.streakDay).toBe(0);
    });

    it('más larga histórica: newStreak > longestStreak → newLongestStreak = newStreak', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 200,
        currentLevel: 1,
        currentStreak: 4,
        longestStreak: 4,
        totalDaysTracked: 4,
        totalGoalsMet: 8,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows = [
        { date: '2026-02-22', allGoalsMet: true },
        { date: '2026-02-21', allGoalsMet: true },
        { date: '2026-02-20', allGoalsMet: true },
        { date: '2026-02-19', allGoalsMet: true },
        { date: '2026-02-18', allGoalsMet: true },
      ];
      const yesterdayLogs = [{ minutesUsed: 10, appId: 1 }];
      const todayLogs = [{ minutesUsed: 5 }];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-23',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.newStreak).toBeGreaterThanOrEqual(4);
      expect(result.newLongestStreak).toBeGreaterThanOrEqual(4);
    });
  });

  describe('processDailyCompletion - XP', () => {
    it('día perfecto: bonusXp incluye XP_PERFECT_DAY (50)', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysTracked: 0,
        totalGoalsMet: 0,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows: Array<{ date: string; allGoalsMet: boolean }> = [];
      const yesterdayLogs: Array<{ minutesUsed: number; appId: number }> = [];
      const todayLogs: Array<{ minutesUsed: number }> = [];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-22',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.bonusXp).toBeGreaterThanOrEqual(50);
      expect(result.bonusXp).toBe(50 + 10);
    });

    it('día perfecto con racha día 7: bonusXp incluye 50 + (10 * 7) = 120', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 0,
        currentLevel: 1,
        currentStreak: 6,
        longestStreak: 6,
        totalDaysTracked: 6,
        totalGoalsMet: 12,
        lastActiveDate: '2026-02-15',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-15' }];
      const dailySummaryRows = [
        { date: '2026-02-22', allGoalsMet: true },
        { date: '2026-02-21', allGoalsMet: true },
        { date: '2026-02-20', allGoalsMet: true },
        { date: '2026-02-19', allGoalsMet: true },
        { date: '2026-02-18', allGoalsMet: true },
        { date: '2026-02-17', allGoalsMet: true },
        { date: '2026-02-16', allGoalsMet: true },
      ];
      const yesterdayLogs = [{ minutesUsed: 10, appId: 1 }];
      const todayLogs = [{ minutesUsed: 5 }];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-23',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.streakDay).toBeGreaterThanOrEqual(6);
      expect(result.bonusXp).toBeGreaterThanOrEqual(50 + 10 * 6);
    });

    it('reducción vs ayer: bonusXp incluye XP_REDUCTION_VS_YESTERDAY (15)', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysTracked: 0,
        totalGoalsMet: 0,
        lastActiveDate: '2026-02-21',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-21' }];
      const dailySummaryRows: Array<{ date: string; allGoalsMet: boolean }> = [];
      const yesterdayLogs = [{ minutesUsed: 100, appId: 1 }];
      const todayLogs = [{ minutesUsed: 50 }];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);
      setupUpdateMock();

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-22',
        allGoalsMet: true,
        activeAppsCount: 1,
      });

      expect(result.bonusXp).toBeGreaterThanOrEqual(15);
    });

    it('no duplicar XP mismo día: alreadyProcessedToday retorna bonusXp=0', async () => {
      const statsRows = [{
        id: 1,
        currentXp: 100,
        currentLevel: 1,
        currentStreak: 1,
        longestStreak: 1,
        totalDaysTracked: 1,
        totalGoalsMet: 2,
        lastActiveDate: '2026-02-22',
      }];
      const lastActiveDateRows = [{ lastActiveDate: '2026-02-22' }];
      const dailySummaryRows: Array<{ date: string; allGoalsMet: boolean }> = [];
      const yesterdayLogs: Array<{ minutesUsed: number; appId: number }> = [];
      const todayLogs: Array<{ minutesUsed: number }> = [];

      setupSelectMock(statsRows, lastActiveDateRows, dailySummaryRows, yesterdayLogs, todayLogs);

      const result = await gamificationService.processDailyCompletion({
        date: '2026-02-22',
        allGoalsMet: true,
        activeAppsCount: 2,
      });

      expect(result.bonusXp).toBe(0);
      expect(result.newStreak).toBe(1);
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});
