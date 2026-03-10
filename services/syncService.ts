import { and, eq, isNotNull } from 'drizzle-orm';
import { Platform } from 'react-native';

import { db } from '@/db/client';
import { monitoredApps } from '@/db/schema';
import { gamificationService } from '@/services/gamificationService';
import { getLocalIsoDate, getStartOfLocalDayMs } from '@/services/dateUtils';
import { checkAndSendNudgingNotifications } from '@/services/nudgingService';
import { summaryService } from '@/services/summaryService';
import { usageService } from '@/services/usageService';
import { getUsageStats, hasUsageStatsPermission } from 'usage-stats';

export async function syncUsageFromUsageStats(date?: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  if (!hasUsageStatsPermission()) return;

  const today = date ?? getLocalIsoDate();
  const startOfDay = getStartOfLocalDayMs(today);
  const endTime = Date.now();

  const entries = getUsageStats(startOfDay, endTime);
  if (entries.length === 0) {
    await summaryService.upsertDailySummary({ date: today }, db);
    await checkAndSendNudgingNotifications(today);
    await gamificationService.processStreakAfterSync(today);
    return;
  }

  const entriesByPackage = new Map(entries.map((e) => [e.packageName, e]));

  const appsWithPackage = await db
    .select()
    .from(monitoredApps)
    .where(and(eq(monitoredApps.isActive, true), isNotNull(monitoredApps.packageName)));

  for (const app of appsWithPackage) {
    const packageName = app.packageName;
    if (!packageName) continue;

    const entry = entriesByPackage.get(packageName);
    if (!entry) continue;

    const minutesUsed = Math.round(entry.totalTimeInForeground / 60_000);

    try {
      await usageService.upsertUsage(
        {
          appId: app.id,
          date: today,
          minutesUsed,
          source: 'auto',
        },
        db as Parameters<typeof usageService.upsertUsage>[1],
      );
    } catch {
      // Skip app if upsert fails (e.g. app deactivated between query and upsert)
    }
  }

  await summaryService.upsertDailySummary({ date: today }, db);
  await checkAndSendNudgingNotifications(today);
  await gamificationService.processStreakAfterSync(today);
}
