import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const ProgressBar = ({ value, max = 100, color, height = 8, style }: ProgressBarProps) => {
  const { colors, radius } = useTheme();
  const safeMax = max <= 0 ? 1 : max;
  const percentage = clamp((value / safeMax) * 100, 0, 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeMax, now: clamp(value, 0, safeMax) }}
      style={[
        styles.track,
        {
          backgroundColor: colors.progressTrack,
          borderRadius: radius.pill,
          height,
        },
        style,
      ]}>
      <View
        style={{
          backgroundColor: color ?? colors.primary,
          borderRadius: radius.pill,
          height: '100%',
          width: `${percentage}%`,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
});
