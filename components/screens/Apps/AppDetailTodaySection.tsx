import { View } from "react-native";

import { appsStyles, type ThemedStyles } from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";

interface AppDetailTodaySectionProps {
  usedMinutes: number;
  dailyGoalMinutes: number;
  themedStyles: ThemedStyles;
}

export function AppDetailTodaySection({
  usedMinutes,
  dailyGoalMinutes,
  themedStyles,
}: AppDetailTodaySectionProps) {
  const progressRatio =
    dailyGoalMinutes > 0 ? Math.min(usedMinutes / dailyGoalMinutes, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const progressFillStyle =
    progressPercent < 60
      ? themedStyles.progressFillGreen
      : progressPercent < 85
        ? themedStyles.progressFillYellow
        : progressPercent < 100
          ? themedStyles.progressFillOrange
          : themedStyles.progressFillRed;

  return (
    <View style={[appsStyles.detailCard, themedStyles.appCard]}>
      <ThemedText type="defaultSemiBold">Hoy</ThemedText>
      <ThemedText style={[appsStyles.detailTodayText, themedStyles.textSecondary]}>
        {usedMinutes} / {dailyGoalMinutes} min
      </ThemedText>
      <View style={[appsStyles.detailProgressTrackLarge, themedStyles.progressTrack]}>
        <View
          style={[
            appsStyles.detailProgressFillLarge,
            progressFillStyle,
            { width: `${progressPercent}%` as const },
          ]}
        />
      </View>
    </View>
  );
}
