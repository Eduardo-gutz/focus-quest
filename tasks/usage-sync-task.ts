import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { init } from '@/services/database';
import { syncUsageFromUsageStats } from '@/services/syncService';

export const USAGE_SYNC_TASK = 'usage-sync';

TaskManager.defineTask(USAGE_SYNC_TASK, async () => {
  if (Platform.OS !== 'android')
    return BackgroundTask.BackgroundTaskResult.Success;
  try {
    await init();
    await syncUsageFromUsageStats();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerUsageSyncTask(): Promise<void> {
  await BackgroundTask.registerTaskAsync(USAGE_SYNC_TASK, {
    minimumInterval: 60 * 15,
  });
}

export async function unregisterUsageSyncTask(): Promise<void> {
  await BackgroundTask.unregisterTaskAsync(USAGE_SYNC_TASK);
}
