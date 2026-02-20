import { Platform } from 'react-native';

const PRIMARY = '#4361EE';
const ACCENT = '#4CC9F0';
const SUCCESS = '#06D6A0';
const WARNING = '#FFD166';
const ERROR = '#EF476F';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#334155',
    textMuted: '#64748B',
    background: '#F4F6FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    tint: PRIMARY,
    icon: '#6B7280',
    tabIconDefault: '#94A3B8',
    tabIconSelected: PRIMARY,
    border: '#E5E7EB',
    borderStrong: '#CBD5E1',
    primary: PRIMARY,
    accent: ACCENT,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    onPrimary: '#FFFFFF',
    warningForeground: '#8A5D00',
    link: PRIMARY,
    progressTrack: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    background: '#0F172A',
    surface: '#111C33',
    surfaceElevated: '#1A2742',
    tint: PRIMARY,
    icon: '#AAB7CF',
    tabIconDefault: '#8193B2',
    tabIconSelected: PRIMARY,
    border: '#22314D',
    borderStrong: '#334155',
    primary: PRIMARY,
    accent: ACCENT,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    onPrimary: '#FFFFFF',
    warningForeground: '#FFE2A0',
    link: ACCENT,
    progressTrack: '#2C3A57',
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
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      elevation: 1,
    },
  },
};
