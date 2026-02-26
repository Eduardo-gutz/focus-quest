export const NUDGING_THRESHOLDS = [
  { pct: 80, key: '80' as const },
  { pct: 100, key: '100' as const },
  { pct: 150, key: '150' as const },
] as const;

export type ThresholdKey = (typeof NUDGING_THRESHOLDS)[number]['key'];

export function getNudgingMessage(
  appName: string,
  threshold: ThresholdKey,
  minutesUsed: number,
  dailyGoalMinutes: number,
): string {
  switch (threshold) {
    case '80': {
      const remaining = Math.max(0, dailyGoalMinutes - minutesUsed);
      return `Te quedan ${remaining} min en ${appName}`;
    }
    case '100':
      return `Superaste tu meta en ${appName}`;
    case '150':
      return `Llevas ${minutesUsed} min en ${appName}. Tu racha está en riesgo`;
    default:
      return `Uso de ${appName}: ${minutesUsed} min`;
  }
}
