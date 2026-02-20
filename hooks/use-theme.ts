import { Colors, Radius, Shadows, Spacing, ThemeName, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ThemeTokens {
  name: ThemeName;
  colors: (typeof Colors)[ThemeName];
  spacing: typeof Spacing;
  typography: typeof Typography;
  radius: typeof Radius;
  shadow: (typeof Shadows)[ThemeName];
}

export const useTheme = (): ThemeTokens => {
  const scheme = useColorScheme() ?? 'light';
  const name: ThemeName = scheme in Colors ? (scheme as ThemeName) : 'light';

  return {
    name,
    colors: Colors[name],
    spacing: Spacing,
    typography: Typography,
    radius: Radius,
    shadow: Shadows[name],
  };
};
