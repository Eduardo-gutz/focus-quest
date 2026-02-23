import { useColorScheme as useRNColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settings-store';

export type ColorScheme = 'light' | 'dark' | null | undefined;

/**
 * Resolves the effective color scheme from user preference (settingsStore.theme)
 * and system preference. When theme is 'system', follows the OS setting.
 */
export const useResolvedColorScheme = (): ColorScheme | null => {
  const systemScheme = useRNColorScheme();
  const theme = useSettingsStore((state) => state.theme);

  if (theme === 'system') {
    return systemScheme;
  }

  return theme;
};
