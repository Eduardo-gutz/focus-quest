import {
  calculateDashboardCompletion,
  calculateLevelProgress,
  getGreetingByHour,
  getLevelTitle,
  xpNeededForLevel,
} from "@/services/dashboard-metrics";

describe("dashboard metrics helpers", () => {
  it("calcula porcentaje de metas cumplidas considerando apps sin registro como no cumplidas", () => {
    const activeApps = [
      { id: 1, dailyGoalMinutes: 30 },
      { id: 2, dailyGoalMinutes: 40 },
      { id: 3, dailyGoalMinutes: 50 },
    ];
    const logs = [
      { appId: 1, date: "2026-02-23", minutesUsed: 25 },
      { appId: 2, date: "2026-02-23", minutesUsed: 45 },
      { appId: 1, date: "2026-02-23", minutesUsed: 2 },
      { appId: 3, date: "2026-02-22", minutesUsed: 20 },
    ];

    const result = calculateDashboardCompletion(activeApps, logs, "2026-02-23");

    expect(result.metGoalsCount).toBe(1);
    expect(result.totalGoalsCount).toBe(3);
    expect(result.completionPercentage).toBe(33);
  });

  it("retorna 0 cuando no hay apps activas", () => {
    const result = calculateDashboardCompletion([], [], "2026-02-23");

    expect(result).toEqual({
      completionPercentage: 0,
      metGoalsCount: 0,
      totalGoalsCount: 0,
    });
  });

  it("genera saludo por franja horaria", () => {
    expect(getGreetingByHour(8, "Edu")).toBe("Buenos días, Edu");
    expect(getGreetingByHour(15, "Edu")).toBe("Buenas tardes, Edu");
    expect(getGreetingByHour(22, "Edu")).toBe("Buenas noches, Edu");
  });

  it("usa fallback de nombre y nivel cuando faltan datos", () => {
    expect(getGreetingByHour(9)).toBe("Buenos días, FocusQuester");
    expect(getLevelTitle(0)).toBe("Aprendiz");
  });

  it("calcula el progreso de XP hacia el siguiente nivel", () => {
    const currentXp = 160;
    const currentLevel = 2;

    const result = calculateLevelProgress(currentXp, currentLevel);
    const expectedPrevThreshold = xpNeededForLevel(1);
    const expectedNextThreshold = xpNeededForLevel(2);

    expect(result.previousLevelThreshold).toBe(expectedPrevThreshold);
    expect(result.nextLevelThreshold).toBe(expectedNextThreshold);
    expect(result.xpToNextLevel).toBe(expectedNextThreshold - currentXp);
    expect(result.progressRatio).toBeGreaterThan(0);
    expect(result.progressRatio).toBeLessThan(1);
  });
});
