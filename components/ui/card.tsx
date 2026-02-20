import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface CardProps extends Omit<ViewProps, 'style'> {
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ padded = true, style, children, ...rest }: CardProps) => {
  const { colors, radius, shadow, spacing } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: padded ? spacing.md : 0,
          ...shadow.card,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
