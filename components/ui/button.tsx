import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT_BY_SIZE = {
  sm: 36,
  md: 44,
  lg: 52,
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) => {
  const { colors, radius, spacing, typography } = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const backgroundColor = isPrimary ? colors.primary : isSecondary ? colors.surface : 'transparent';
  const borderColor = isPrimary ? colors.primary : isSecondary ? colors.border : 'transparent';
  const textColor = isPrimary ? colors.onPrimary : isGhost ? colors.primary : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius.md,
          height: HEIGHT_BY_SIZE[size],
          minHeight: HEIGHT_BY_SIZE[size],
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
          width: fullWidth ? '100%' : undefined,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
      {...rest}>
      <View style={styles.content}>
        <Text
          style={[
            typography.label,
            {
              color: textColor,
              textAlign: 'center',
            },
          ]}>
          {loading ? 'Cargando...' : label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
