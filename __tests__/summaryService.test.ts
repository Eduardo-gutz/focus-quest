jest.mock('@/db/client', () => ({
  db: {},
}));

import { summaryService } from '@/services/summaryService';

const createSelectMock = (whereQueue: Array<Promise<unknown>>) => {
  const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
  const from = jest.fn(() => ({ where }));
  const select = jest.fn(() => ({ from }));

  return { select, where, from };
};

describe('summaryService', () => {
  it('calcula día perfecto con allGoalsMet=true', async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([
        { id: 1, dailyGoalMinutes: 30, isActive: true },
        { id: 2, dailyGoalMinutes: 40, isActive: true },
      ]),
      Promise.resolve([
        { appId: 1, minutesUsed: 25, date: '2026-02-23' },
        { appId: 2, minutesUsed: 35, date: '2026-02-23' },
      ]),
    ];
    const { select } = createSelectMock(whereQueue);
    const database = {
      select,
      insert: jest.fn(),
    };

    const result = await summaryService.calculateDailySummary('2026-02-23', database as never);

    expect(result.totalMinutesUsed).toBe(60);
    expect(result.totalMinutesGoal).toBe(70);
    expect(result.allGoalsMet).toBe(true);
  });

  it('calcula día parcial cuando falta registro de una app activa (default logrado)', async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([
        { id: 1, dailyGoalMinutes: 30, isActive: true },
        { id: 2, dailyGoalMinutes: 40, isActive: true },
      ]),
      Promise.resolve([
        { appId: 1, minutesUsed: 20, date: '2026-02-23' },
      ]),
    ];
    const { select } = createSelectMock(whereQueue);
    const database = {
      select,
      insert: jest.fn(),
    };

    const result = await summaryService.calculateDailySummary('2026-02-23', database as never);

    expect(result.totalMinutesUsed).toBe(20);
    expect(result.totalMinutesGoal).toBe(70);
    expect(result.allGoalsMet).toBe(true);
  });

  it('calcula día fallido cuando una app excede su meta', async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([
        { id: 1, dailyGoalMinutes: 30, isActive: true },
        { id: 2, dailyGoalMinutes: 40, isActive: true },
      ]),
      Promise.resolve([
        { appId: 1, minutesUsed: 31, date: '2026-02-23' },
        { appId: 2, minutesUsed: 35, date: '2026-02-23' },
      ]),
    ];
    const { select } = createSelectMock(whereQueue);
    const database = {
      select,
      insert: jest.fn(),
    };

    const result = await summaryService.calculateDailySummary('2026-02-23', database as never);

    expect(result.totalMinutesUsed).toBe(66);
    expect(result.totalMinutesGoal).toBe(70);
    expect(result.allGoalsMet).toBe(false);
  });

  it('calcula sin registros con totalMinutesUsed=0 y allGoalsMet=true (default logrado)', async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([{ id: 1, dailyGoalMinutes: 30, isActive: true }]),
      Promise.resolve([]),
    ];
    const { select } = createSelectMock(whereQueue);
    const database = {
      select,
      insert: jest.fn(),
    };

    const result = await summaryService.calculateDailySummary('2026-02-23', database as never);

    expect(result.totalMinutesUsed).toBe(0);
    expect(result.totalMinutesGoal).toBe(30);
    expect(result.allGoalsMet).toBe(true);
  });

  it('acumula xpEarned al hacer upsert del mismo día', async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([{ id: 1, dailyGoalMinutes: 30, isActive: true }]),
      Promise.resolve([{ appId: 1, minutesUsed: 20, date: '2026-02-23' }]),
      Promise.resolve([{ date: '2026-02-23', xpEarned: 20, streakDay: 2 }]),
    ];
    const { select } = createSelectMock(whereQueue);
    const onConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
    const values = jest.fn(() => ({ onConflictDoUpdate }));
    const insert = jest.fn(() => ({ values }));
    const database = {
      select,
      insert,
    };

    const result = await summaryService.upsertDailySummary(
      { date: '2026-02-23', xpEarnedDelta: 15 },
      database as never,
    );

    expect(result.xpEarned).toBe(35);
    expect(result.streakDay).toBe(2);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-02-23',
        totalMinutesUsed: 20,
        totalMinutesGoal: 30,
        allGoalsMet: true,
        xpEarned: 35,
      }),
    );
    expect(onConflictDoUpdate).toHaveBeenCalledTimes(1);
  });
});
