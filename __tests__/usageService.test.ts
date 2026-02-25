import { calculateUsageXpPreview, usageService } from "@/services/usageService";

describe("usageService", () => {
  it("calcula preview de XP para creación con meta cumplida y primer registro", () => {
    const xp = calculateUsageXpPreview({
      minutesUsed: 20,
      dailyGoalMinutes: 30,
      isFirstLogOfDay: true,
      isUpdate: false,
    });

    expect(xp).toBe(40);
  });

  it("calcula preview de XP 0 para update", () => {
    const xp = calculateUsageXpPreview({
      minutesUsed: 40,
      dailyGoalMinutes: 30,
      isFirstLogOfDay: false,
      isUpdate: true,
    });

    expect(xp).toBe(0);
  });

  it("calcula solo registro sin meta cumplida: +10 XP", () => {
    const xp = calculateUsageXpPreview({
      minutesUsed: 50,
      dailyGoalMinutes: 30,
      isFirstLogOfDay: false,
      isUpdate: false,
    });

    expect(xp).toBe(10);
  });

  it("calcula registro + meta cumplida sin primer log: +10 + 25 = 35 XP", () => {
    const xp = calculateUsageXpPreview({
      minutesUsed: 20,
      dailyGoalMinutes: 30,
      isFirstLogOfDay: false,
      isUpdate: false,
    });

    expect(xp).toBe(35);
  });

  it("crea registro cuando no existe log del día", async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([{ id: 1, dailyGoalMinutes: 30, isActive: true }]),
      Promise.resolve([]),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    const insertValues = jest.fn().mockResolvedValue(undefined);
    const database = {
      select: jest.fn(() => ({ from })),
      insert: jest.fn(() => ({ values: insertValues })),
      update: jest.fn(),
    };

    const result = await usageService.upsertUsage(
      { appId: 1, minutesUsed: 25, date: "2026-02-21", source: "manual" },
      database as never,
    );

    expect(result.action).toBe("created");
    expect(result.goalMet).toBe(true);
    expect(database.insert).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledTimes(1);
  });

  it("actualiza registro cuando ya existe log del día", async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([{ id: 1, dailyGoalMinutes: 30, isActive: true }]),
      Promise.resolve([{ id: 9, source: "manual" }]),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    const updateWhere = jest.fn().mockResolvedValue(undefined);
    const database = {
      select: jest.fn(() => ({ from })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: updateWhere,
        })),
      })),
    };

    const result = await usageService.upsertUsage(
      { appId: 1, minutesUsed: 55, date: "2026-02-21", source: "manual" },
      database as never,
    );

    expect(result.action).toBe("updated");
    expect(result.goalMet).toBe(false);
    expect(database.update).toHaveBeenCalledTimes(1);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it("no sobrescribe registro manual cuando sync auto intenta actualizar", async () => {
    const whereQueue: Array<Promise<unknown>> = [
      Promise.resolve([{ id: 1, dailyGoalMinutes: 30, isActive: true }]),
      Promise.resolve([{ id: 9, source: "manual" }]),
    ];

    const where = jest.fn(() => whereQueue.shift() ?? Promise.resolve([]));
    const from = jest.fn(() => ({ where }));
    const updateWhere = jest.fn().mockResolvedValue(undefined);
    const database = {
      select: jest.fn(() => ({ from })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: updateWhere,
        })),
      })),
    };

    const result = await usageService.upsertUsage(
      { appId: 1, minutesUsed: 45, date: "2026-02-21", source: "auto" },
      database as never,
    );

    expect(result.action).toBe("updated");
    expect(database.update).not.toHaveBeenCalled();
    expect(database.insert).not.toHaveBeenCalled();
  });

  it("obtiene historial por rango de fechas ordenado", async () => {
    const expectedRows = [
      {
        id: 11,
        appId: 1,
        date: "2026-02-17",
        minutesUsed: 20,
        source: "manual",
        goalMet: true,
        createdAt: "2026-02-17T11:00:00Z",
      },
      {
        id: 12,
        appId: 1,
        date: "2026-02-18",
        minutesUsed: 50,
        source: "manual",
        goalMet: false,
        createdAt: "2026-02-18T11:00:00Z",
      },
    ];
    const orderBy = jest.fn().mockResolvedValue(expectedRows);
    const where = jest.fn(() => ({ orderBy }));
    const from = jest.fn(() => ({ where }));
    const database = {
      select: jest.fn(() => ({ from })),
      insert: jest.fn(),
      update: jest.fn(),
    };

    const result = await usageService.getUsageHistoryRange(
      {
        appId: 1,
        startDate: "2026-02-17",
        endDate: "2026-02-23",
      },
      database as never,
    );

    expect(result).toEqual(expectedRows);
    expect(database.select).toHaveBeenCalledTimes(1);
    expect(orderBy).toHaveBeenCalledTimes(1);
  });
});

