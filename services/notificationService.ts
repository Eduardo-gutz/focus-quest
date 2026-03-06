import { eq } from 'drizzle-orm';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { db } from '@/db/client';
import { usageLogs, userStats } from '@/db/schema';
import { getLocalIsoDate } from '@/services/dateUtils';
import { useSettingsStore } from '@/stores/settings-store';

const NOTIFICATION_IDS = {
  dailyReminder: 'daily-reminder',
  streakAtRisk: 'streak-at-risk',
  weeklyMotivational: 'weekly-motivational',
} as const;

const ANDROID_CHANNEL_ID = 'focusquest-reminders';

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

export async function requestPermissions(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasUserLoggedToday(date: string): Promise<boolean> {
  const rows = await db
    .select({ id: usageLogs.id })
    .from(usageLogs)
    .where(eq(usageLogs.date, date))
    .limit(1);
  return rows.length > 0;
}

export async function getCurrentStreak(): Promise<number> {
  const rows = await db
    .select({ currentStreak: userStats.currentStreak })
    .from(userStats)
    .where(eq(userStats.id, 1));
  return rows[0]?.currentStreak ?? 0;
}

export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.dailyReminder,
    content: {
      title: 'FocusQuest',
      body: 'No olvides registrar tu uso de hoy para mantener tu racha.',
      data: { screen: 'log-usage' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

async function scheduleStreakAtRisk(streakDays: number): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.streakAtRisk,
    content: {
      title: 'FocusQuest',
      body: `Tu racha de ${streakDays} días depende de ti hoy!`,
      data: { screen: 'log-usage' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

async function scheduleWeeklyMotivational(): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.weeklyMotivational,
    content: {
      title: 'FocusQuest',
      body: '¡Nueva semana! Es el momento perfecto para retomar tus metas.',
      data: { screen: 'log-usage' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2,
      hour: 8,
      minute: 0,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function rescheduleAll(): Promise<void> {
  const today = getLocalIsoDate();
  const settings = useSettingsStore.getState();
  const { notifications, reminderTime } = settings;
  const dailyReminderEnabled = notifications.dailyReminderEnabled;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelAllScheduled();

  const [hasLoggedToday, currentStreak] = await Promise.all([
    hasUserLoggedToday(today),
    getCurrentStreak(),
  ]);

  if (dailyReminderEnabled && !hasLoggedToday) {
    await scheduleDailyReminder(reminderTime.hour, reminderTime.minute);
  }

  if (currentStreak > 0 && !hasLoggedToday) {
    await scheduleStreakAtRisk(currentStreak);
  }

  await scheduleWeeklyMotivational();
}
