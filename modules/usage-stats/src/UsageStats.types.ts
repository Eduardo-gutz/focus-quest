/**
 * Entry returned by getUsageStats.
 * totalTimeInForeground is in milliseconds.
 */
export type UsageStatsEntry = {
  packageName: string;
  totalTimeInForeground: number;
};

export type UsageStatsModuleEvents = {};
