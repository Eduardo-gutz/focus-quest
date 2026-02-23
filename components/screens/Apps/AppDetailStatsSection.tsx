import { View } from "react-native";

import { appsStyles, type ThemedStyles } from "@/components/screens/Apps/apps-styles";
import type { AppDetailStats } from "@/hooks/use-app-detail";
import { ThemedText } from "@/components/themed-text";

interface AppDetailStatsSectionProps {
  stats: AppDetailStats;
  themedStyles: ThemedStyles;
}

export function AppDetailStatsSection({
  stats,
  themedStyles,
}: AppDetailStatsSectionProps) {
  return (
    <View style={[appsStyles.detailCard, themedStyles.appCard]}>
      <ThemedText type="defaultSemiBold">Stats</ThemedText>
      <View style={appsStyles.detailStatsGrid}>
        <View style={[appsStyles.detailStatCard, themedStyles.statusCardNeutral]}>
          <ThemedText style={[appsStyles.detailStatValue, themedStyles.textPrimary]}>
            {stats.completionRate}%
          </ThemedText>
          <ThemedText style={[appsStyles.detailStatLabel, themedStyles.textSecondary]}>
            Cumplimiento
          </ThemedText>
        </View>
        <View style={[appsStyles.detailStatCard, themedStyles.statusCardNeutral]}>
          <ThemedText style={[appsStyles.detailStatValue, themedStyles.textPrimary]}>
            {stats.averageMinutes} min
          </ThemedText>
          <ThemedText style={[appsStyles.detailStatLabel, themedStyles.textSecondary]}>
            Promedio
          </ThemedText>
        </View>
        <View style={[appsStyles.detailStatCard, themedStyles.statusCardNeutral]}>
          <ThemedText style={[appsStyles.detailStatValue, themedStyles.textPrimary]}>
            {stats.bestStreak}
          </ThemedText>
          <ThemedText style={[appsStyles.detailStatLabel, themedStyles.textSecondary]}>
            Mejor racha
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
