import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import {
  homeStyles,
  type HomeThemedStyles,
} from "@/components/screens/Home/home-styles";
import { ThemedText } from "@/components/themed-text";
import { type ThemeTokens } from "@/hooks/use-theme";

interface DashboardProgressRingProps {
  completionPercentage: number;
  metGoalsCount: number;
  totalGoalsCount: number;
  colors: ThemeTokens["colors"];
  themedStyles: HomeThemedStyles;
}

export function DashboardProgressRing({
  completionPercentage,
  metGoalsCount,
  totalGoalsCount,
  colors,
  themedStyles,
}: DashboardProgressRingProps) {
  const completedValue = Math.max(0, Math.min(100, completionPercentage));
  const remainingValue = Math.max(0, 100 - completedValue);
  const hasGoals = totalGoalsCount > 0;

  return (
    <View style={[homeStyles.card, homeStyles.ringCard, themedStyles.card]}>
      <PieChart
        data={[
          { value: completedValue || 0.0001, color: colors.primary },
          { value: remainingValue || 0.0001, color: colors.progressTrack },
        ]}
        donut
        radius={92}
        innerRadius={70}
        isAnimated
        animationDuration={650}
        showText={false}
        strokeWidth={0}
        centerLabelComponent={() => (
          <View style={{ alignItems: "center" }}>
            <ThemedText style={homeStyles.ringLabelPrimary}>
              {completedValue}%
            </ThemedText>
            <ThemedText
              style={[homeStyles.ringLabelSecondary, themedStyles.mutedText]}
            >
              {hasGoals
                ? `${metGoalsCount} / ${totalGoalsCount} metas`
                : "Sin apps activas"}
            </ThemedText>
          </View>
        )}
      />

      {hasGoals ? (
        <View style={homeStyles.ringCardFooter}>
          <View style={homeStyles.ringFooterItem}>
            <ThemedText style={[homeStyles.ringFooterValue, themedStyles.successText]}>
              {metGoalsCount}
            </ThemedText>
            <ThemedText style={[homeStyles.ringFooterLabel, themedStyles.mutedText]}>
              CUMPLIDAS
            </ThemedText>
          </View>
          <View style={{ width: 1, height: 28, backgroundColor: colors.border }} />
          <View style={homeStyles.ringFooterItem}>
            <ThemedText style={[homeStyles.ringFooterValue, themedStyles.secondaryText]}>
              {totalGoalsCount - metGoalsCount}
            </ThemedText>
            <ThemedText style={[homeStyles.ringFooterLabel, themedStyles.mutedText]}>
              PENDIENTES
            </ThemedText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
