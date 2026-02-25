import { and, eq } from 'drizzle-orm';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { db } from '@/db/client';
import { monitoredApps, notificationsSent, usageLogs } from '@/db/schema';
import { useSettingsStore } from '@/stores/settings-store';

const ANDROID_CHANNEL_ID = 'focusquest-reminders';

const NUDGING_THRESHOLDS = [
  { pct: 80, key: '80' as const },
  { pct: 100, key: '100' as const },
  { pct: 150, key: '150' as const },
] as const;

type ThresholdKey = (typeof NUDGING_THRESHOLDS)[number]['key'];

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
    });
  }
}

function getNudgingMessage(
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

export async function checkAndSendNudgingNotifications(date: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const { nudgingEnabled } = useSettingsStore.getState().notifications;
  if (!nudgingEnabled) return;

  await ensureAndroidChannel();

  const appsWithLogs = (await db
    .select({
      appId: usageLogs.appId,
      minutesUsed: usageLogs.minutesUsed,
      name: monitoredApps.name,
      dailyGoalMinutes: monitoredApps.dailyGoalMinutes,
    })
    .from(usageLogs)
    .innerJoin(monitoredApps, eq(usageLogs.appId, monitoredApps.id))
    .where(eq(usageLogs.date, date))) as {
    appId: number;
    minutesUsed: number;
    name: string;
    dailyGoalMinutes: number;
  }[]	;

  for (const row of appsWithLogs) {
    const { appId, minutesUsed, name, dailyGoalMinutes } = row;
    const pct = dailyGoalMinutes > 0 ? (minutesUsed / dailyGoalMinutes) * 100 : 0;

    for (const { pct: thresholdPct, key } of NUDGING_THRESHOLDS) {
      if (pct < thresholdPct) continue;

      const alreadySent = (await db
        .select()
        .from(notificationsSent)
        .where(
          and(
            eq(notificationsSent.appId, appId),
            eq(notificationsSent.date, date),
            eq(notificationsSent.threshold, key),
          ),
        )) as { id: number }[];

      if (alreadySent.length > 0) continue;

      const body = getNudgingMessage(name, key, minutesUsed, dailyGoalMinutes);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FocusQuest',
          body,
          data: { screen: 'log-usage' },
        },
        trigger: { channelId: ANDROID_CHANNEL_ID },
      });

      await db.insert(notificationsSent).values({
        appId,
        date,
        threshold: key,
      });
    }
  }
}
