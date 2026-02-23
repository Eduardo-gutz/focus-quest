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
      Promise.resolve([{ id: 9 }]),
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
});

