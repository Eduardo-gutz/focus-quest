const mockDb = {
  select: jest.fn(),
  update: jest.fn(),
};

jest.mock('@/db/client', () => ({
  db: mockDb,
}));

import { streakService } from '@/services/streakService';

describe('streakService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no hace nada cuando lastActiveDate es null', async () => {
    const where = jest.fn().mockResolvedValue([{ lastActiveDate: null, currentStreak: 5 }]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await streakService.checkAndUpdateStreak('2026-02-23');

    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('no hace nada cuando lastActiveDate es el mismo día que today', async () => {
    const where = jest.fn().mockResolvedValue([{ lastActiveDate: '2026-02-23', currentStreak: 5 }]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await streakService.checkAndUpdateStreak('2026-02-23');

    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('no hace reset cuando lastActiveDate fue ayer (racha continua)', async () => {
    const where = jest.fn().mockResolvedValue([{ lastActiveDate: '2026-02-22', currentStreak: 3 }]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await streakService.checkAndUpdateStreak('2026-02-23');

    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('resetea currentStreak a 0 cuando hubo 2+ días sin registro (racha rota)', async () => {
    const whereSelect = jest.fn().mockResolvedValue([{ lastActiveDate: '2026-02-21', currentStreak: 5 }]);
    const fromSelect = jest.fn(() => ({ where: whereSelect }));
    mockDb.select.mockImplementation(() => ({ from: fromSelect }));

    const whereUpdate = jest.fn().mockResolvedValue(undefined);
    const setUpdate = jest.fn(() => ({ where: whereUpdate }));
    mockDb.update.mockImplementation(() => ({ set: setUpdate }));

    await streakService.checkAndUpdateStreak('2026-02-23');

    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(setUpdate).toHaveBeenCalledWith({ currentStreak: 0 });
  });

  it('no hace nada cuando no hay fila en user_stats', async () => {
    const where = jest.fn().mockResolvedValue([]);
    const from = jest.fn(() => ({ where }));
    mockDb.select.mockImplementation(() => ({ from }));

    await streakService.checkAndUpdateStreak('2026-02-23');

    expect(mockDb.update).not.toHaveBeenCalled();
  });
});
