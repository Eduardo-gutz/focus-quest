import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const HEIGHT_BY_SIZE = {
  sm: 22,
  md: 28,
};

export const Badge = ({ label, tone = 'neutral', size = 'md', style }: BadgeProps) => {
  const { colors, radius, spacing, typography } = useTheme();

  const colorByTone = {
    neutral: { background: colors.surfaceElevated, text: colors.textSecondary, border: colors.border },
    primary: { background: `${colors.primary}20`, text: colors.primary, border: `${colors.primary}30` },
    success: { background: `${colors.success}20`, text: colors.success, border: `${colors.success}30` },
    warning: {
      background: `${colors.warning}20`,
      text: colors.warningForeground,
      border: `${colors.warning}40`,
    },
    error: { background: `${colors.error}20`, text: colors.error, border: `${colors.error}30` },
  }[tone];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colorByTone.background,
          borderColor: colorByTone.border,
          borderRadius: radius.pill,
          minHeight: HEIGHT_BY_SIZE[size],
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        },
        style,
      ]}>
      <Text
        style={[
          typography.label,
          {
            color: colorByTone.text,
            fontSize: size === 'sm' ? 12 : 14,
            lineHeight: size === 'sm' ? 16 : 20,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    justifyContent: 'center',
  },
});
