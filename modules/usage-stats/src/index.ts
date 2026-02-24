import { Platform } from 'react-native';

import UsageStatsModule from './UsageStatsModule';
import type { UsageStatsEntry } from './UsageStats.types';

export type { UsageStatsEntry } from './UsageStats.types';

/**
 * Get app usage statistics for the given time range.
 * @param startTime - Unix timestamp in milliseconds (start of range)
 * @param endTime - Unix timestamp in milliseconds (end of range)
 * @returns Array of { packageName, totalTimeInForeground } (totalTimeInForeground in ms)
 * @platform android
 */
export function getUsageStats(startTime: number, endTime: number): UsageStatsEntry[] {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return [];
  }
  return UsageStatsModule.getUsageStats(startTime, endTime);
}

/**
 * Check if the app has been granted Usage Access permission.
 * User must grant this manually in Settings > Apps > Special access > Usage access.
 * @returns true if permission is granted
 * @platform android
 */
export function hasUsageStatsPermission(): boolean {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return false;
  }
  return UsageStatsModule.hasUsageStatsPermission();
}

/**
 * Open the Usage Access settings screen so the user can grant permission.
 * @platform android
 */
export function requestUsageStatsPermission(): void {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return;
  }
  UsageStatsModule.requestUsageStatsPermission();
}
