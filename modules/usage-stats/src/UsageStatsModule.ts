import { NativeModule, requireOptionalNativeModule } from 'expo';

import type { UsageStatsEntry, UsageStatsModuleEvents } from './UsageStats.types';

declare class UsageStatsModule extends NativeModule<UsageStatsModuleEvents> {
  getUsageStats: (startTime: number, endTime: number) => UsageStatsEntry[];
  hasUsageStatsPermission: () => boolean;
  requestUsageStatsPermission: () => void;
}

export default requireOptionalNativeModule<UsageStatsModule>('UsageStats');
