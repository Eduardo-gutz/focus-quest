import { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import {
  profileStyles,
  type ProfileThemedStyles,
} from "@/components/screens/Profile/profile-styles";
import type { ProfileChartDay } from "@/hooks/use-profile";
import type { ThemeTokens } from "@/hooks/use-theme";

interface ProfileWeeklyChartProps {
  chartData: ProfileChartDay[];
  colors: ThemeTokens["colors"];
  themedStyles?: ProfileThemedStyles;
}

export function ProfileWeeklyChart({
  chartData,
  colors,
}: ProfileWeeklyChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32;

  const { barData, maxValue } = useMemo(() => {
    const maxMinutes = Math.max(
      ...chartData.map((d) => d.minutesUsed),
      1,
    );
    const bars = chartData.map((item) => {
      let frontColor: string;
      if (item.hasRecord) {
        frontColor = item.allGoalsMet ? colors.success : colors.error;
      } else {
        frontColor = colors.progressTrack;
      }
      const value = item.hasRecord ? item.minutesUsed : 1;
      return {
        value: Math.max(value, 1),
        label: item.dayLabel,
        frontColor,
      };
    });
    return { barData: bars, maxValue: Math.max(maxMinutes, 60) };
  }, [chartData, colors.success, colors.error, colors.progressTrack]);

  if (barData.length === 0) return null;

  return (
    <View style={[profileStyles.chartWrapper, { minHeight: 140 }]}>
      <BarChart
        data={barData}
        barWidth={22}
        barBorderRadius={6}
        maxValue={maxValue}
        width={chartWidth}
        noOfSections={5}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        isAnimated
        animationDuration={400}
        spacing={14}
      />
    </View>
  );
}
