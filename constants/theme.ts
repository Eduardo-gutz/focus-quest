import { Platform } from 'react-native';

const PRIMARY = '#F97316';   // Naranja cálido — energético, motivador
const ACCENT = '#E879F9';    // Magenta — gamificación, logros especiales
const SUCCESS = '#22C55E';
const WARNING = '#FBBF24';
const ERROR = '#F87171';

export const Colors = {
  light: {
    text: '#111111',
    textSecondary: '#3C3C43',
    textMuted: '#8E8E93',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceElevated: '#F8F8FA',
    tint: PRIMARY,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: PRIMARY,
    border: '#E5E5EA',
    borderStrong: '#C7C7CC',
    primary: PRIMARY,
    accent: ACCENT,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    onPrimary: '#FFFFFF',
    warningForeground: '#7A4500',
    link: PRIMARY,
    progressTrack: '#E5E5EA',
  },
  dark: {
    text: '#F5F5F7',
    textSecondary: '#AEAEB2',
    textMuted: '#636366',
    background: '#131315',
    surface: '#1E1E21',
    surfaceElevated: '#28282C',
    tint: PRIMARY,
    icon: '#8E8E93',
    tabIconDefault: '#48484A',
    tabIconSelected: PRIMARY,
    border: '#2C2C30',
    borderStrong: '#3A3A3E',
    primary: PRIMARY,
    accent: ACCENT,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    onPrimary: '#FFFFFF',
    warningForeground: '#FFD580',
    link: PRIMARY,
    progressTrack: '#252528',
  },
};

export type ThemeName = keyof typeof Colors;

const fallbackFonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'monospace',
};

const platformFonts = Platform.select({
  ios: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: 'ui-monospace',
  },
  default: {
    ...fallbackFonts,
  },
  web: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Fonts = platformFonts ?? fallbackFonts;

export const Typography = {
  heading1: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontFamily: Fonts.bold,
  },
  heading2: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    fontFamily: Fonts.semibold,
  },
  heading3: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontFamily: Fonts.semibold,
  },
  heading4: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.semibold,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
    fontFamily: Fonts.medium,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const Shadows = {
  light: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};
