jest.mock("@/hooks/use-apps", () => ({
  useApps: jest.fn(),
}));
jest.mock("@/stores", () => ({
  useHabitsStore: jest.fn(),
}));
jest.mock("@/db/client", () => ({
  db: {},
}));

import {
  calculateAppDetailStats,
  type HistoryDayItem,
  normalizeHistoryDays,
} from "@/hooks/use-app-detail";

describe("app detail metrics helpers", () => {
  it("normaliza 7 días incluyendo días sin registro", () => {
    const dates = [
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
      "2026-02-22",
      "2026-02-23",
    ];
    const logs = [
      { date: "2026-02-17", minutesUsed: 25 },
      { date: "2026-02-19", minutesUsed: 50 },
      { date: "2026-02-23", minutesUsed: 30 },
    ];

    const result = normalizeHistoryDays(dates, logs, 30);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(expect.objectContaining({ statusMark: "✓", minutesUsed: 25 }));
    expect(result[1]).toEqual(expect.objectContaining({ statusMark: "—", minutesUsed: 0 }));
    expect(result[2]).toEqual(expect.objectContaining({ statusMark: "✗", minutesUsed: 50 }));
    expect(result[6]).toEqual(expect.objectContaining({ statusMark: "✓", minutesUsed: 30 }));
  });

  it("calcula stats de cumplimiento, promedio y mejor racha", () => {
    const historyDays: HistoryDayItem[] = [
      { date: "2026-02-17", dayLabel: "lun", minutesUsed: 20, hasLog: true, isGoalMet: true, statusMark: "✓", progressRatio: 0.6 },
      { date: "2026-02-18", dayLabel: "mar", minutesUsed: 25, hasLog: true, isGoalMet: true, statusMark: "✓", progressRatio: 0.7 },
      { date: "2026-02-19", dayLabel: "mie", minutesUsed: 45, hasLog: true, isGoalMet: false, statusMark: "✗", progressRatio: 1 },
      { date: "2026-02-20", dayLabel: "jue", minutesUsed: 0, hasLog: false, isGoalMet: null, statusMark: "—", progressRatio: 0 },
      { date: "2026-02-21", dayLabel: "vie", minutesUsed: 15, hasLog: true, isGoalMet: true, statusMark: "✓", progressRatio: 0.5 },
      { date: "2026-02-22", dayLabel: "sab", minutesUsed: 30, hasLog: true, isGoalMet: true, statusMark: "✓", progressRatio: 1 },
      { date: "2026-02-23", dayLabel: "dom", minutesUsed: 10, hasLog: true, isGoalMet: true, statusMark: "✓", progressRatio: 0.3 },
    ];

    const stats = calculateAppDetailStats(historyDays);

    expect(stats.completionRate).toBe(71);
    expect(stats.averageMinutes).toBe(21);
    expect(stats.bestStreak).toBe(3);
  });
});
