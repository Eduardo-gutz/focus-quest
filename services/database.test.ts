jest.mock('@/db/client', () => ({
  db: {},
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn(),
}));

jest.mock('@/drizzle/migrations', () => ({
  __esModule: true,
  default: {
    journal: { entries: [] },
    migrations: {},
  },
}));

import { ensureUserStatsSingleton, seed, shouldSeedOnStartup } from '@/services/database';

describe('database service', () => {
  it('should decide auto-seed based on dev mode or force flag', () => {
    expect(shouldSeedOnStartup({ isDev: true, forceSeedOnStartup: false })).toBe(true);
    expect(shouldSeedOnStartup({ isDev: false, forceSeedOnStartup: true })).toBe(true);
    expect(shouldSeedOnStartup({ isDev: false, forceSeedOnStartup: false })).toBe(false);
  });

  it('should ensure singleton row without conflicts', async () => {
    const onConflictDoNothing = jest.fn().mockResolvedValue(undefined);
    const values = jest.fn(() => ({ onConflictDoNothing }));
    const insert = jest.fn(() => ({ values }));

    await ensureUserStatsSingleton({ insert } as any);

    expect(insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledTimes(1);
    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);
  });

  it('should skip seed when monitored apps already exist', async () => {
    const from = jest.fn().mockResolvedValue([{ count: 1 }]);
    const select = jest.fn(() => ({ from }));
    const transaction = jest.fn();

    const seeded = await seed({ select, transaction } as any);

    expect(seeded).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('should seed base data once when database is empty', async () => {
    const select = jest
      .fn()
      .mockImplementationOnce(() => ({ from: jest.fn().mockResolvedValue([{ count: 0 }]) }));

    const onConflictDoNothing = jest.fn().mockResolvedValue(undefined);
    const values = jest.fn(() => ({ onConflictDoNothing }));
    const insert = jest.fn(() => ({ values }));
    const where = jest.fn().mockResolvedValue([
      { id: 1, name: 'TikTok', dailyGoalMinutes: 30 },
      { id: 2, name: 'Instagram', dailyGoalMinutes: 25 },
      { id: 3, name: 'YouTube', dailyGoalMinutes: 40 },
    ]);
    const from = jest.fn(() => ({ where }));
    const txSelect = jest.fn(() => ({ from }));
    const updateWhere = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn(() => ({ where: updateWhere }));
    const update = jest.fn(() => ({ set }));
    const tx = { insert, select: txSelect, update };
    const transaction = jest.fn(async (callback: (trx: typeof tx) => Promise<void>) => {
      await callback(tx);
    });

    const seeded = await seed({ select, transaction } as any);

    expect(seeded).toBe(true);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });
});
