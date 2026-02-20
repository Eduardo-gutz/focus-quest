jest.mock('@/db/client', () => ({
  db: {},
}));

import { appService, MAX_ACTIVE_APPS } from '@/services/appService';

const createMockDb = () => ({
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
});

describe('app service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return only active apps when requested', async () => {
    const rows = [{ id: 1, name: 'TikTok', isActive: true }];
    const orderBy = jest.fn().mockResolvedValue(rows);
    const where = jest.fn(() => ({ orderBy }));
    const from = jest.fn(() => ({ where, orderBy }));
    const mockDb = createMockDb();
    mockDb.select.mockImplementation(() => ({ from }));

    const result = await appService.getApps({ filter: 'active' }, mockDb as any);

    expect(result).toEqual(rows);
    expect(mockDb.select).toHaveBeenCalledTimes(1);
  });

  it('should validate required app name on add', async () => {
    const mockDb = createMockDb();

    await expect(
      appService.addApp({ name: '   ', dailyGoalMinutes: 30 }, mockDb as any),
    ).rejects.toThrow('App name is required');
  });

  it('should enforce max active apps limit on add', async () => {
    const countRows = [{ count: MAX_ACTIVE_APPS }];
    const where = jest.fn().mockResolvedValue(countRows);
    const from = jest.fn(() => ({ where }));
    const mockDb = createMockDb();
    mockDb.select.mockImplementation(() => ({ from }));

    await expect(
      appService.addApp({ name: 'Instagram', dailyGoalMinutes: 20 }, mockDb as any),
    ).rejects.toThrow(`You can only have up to ${MAX_ACTIVE_APPS} active apps`);
  });

  it('should update app payload when values are valid', async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn(() => ({ where }));
    const mockDb = createMockDb();
    mockDb.update.mockImplementation(() => ({ set }));

    await appService.updateApp(42, { name: '  YouTube  ', dailyGoalMinutes: 40 }, mockDb as any);

    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith({ name: 'YouTube', dailyGoalMinutes: 40 });
  });

  it('should enforce max active apps when re-activating an inactive app', async () => {
    const whereQueue = [
      Promise.resolve([{ isActive: false }]),
      Promise.resolve([{ count: MAX_ACTIVE_APPS }]),
    ];
    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    const mockDb = createMockDb();
    mockDb.select.mockImplementation(() => ({ from }));

    await expect(appService.toggleApp(7, true, mockDb as any)).rejects.toThrow(
      `You can only have up to ${MAX_ACTIVE_APPS} active apps`,
    );
  });
});
