import { xpNeededForLevel } from "@/constants/gamification";

describe("xpNeededForLevel", () => {
  it("nivel 1: 100 XP", () => {
    expect(xpNeededForLevel(1)).toBe(100);
  });

  it("nivel 2: 283 XP", () => {
    expect(xpNeededForLevel(2)).toBe(283);
  });

  it("nivel 5: 1118 XP", () => {
    expect(xpNeededForLevel(5)).toBe(1118);
  });

  it("nivel 10: 3162 XP", () => {
    expect(xpNeededForLevel(10)).toBe(3162);
  });

  it("nivel 25: 12500 XP", () => {
    expect(xpNeededForLevel(25)).toBe(12500);
  });

  it("fórmula round(100 * level^1.5) para niveles 1-25", () => {
    for (let level = 1; level <= 25; level++) {
      const expected = Math.round(100 * Math.pow(level, 1.5));
      expect(xpNeededForLevel(level)).toBe(expected);
    }
  });
});
