import { View } from "react-native";

import { appsStyles, type ThemedStyles } from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import type { HistoryDayItem } from "@/hooks/use-app-detail";

interface AppDetailHistorySectionProps {
  historyDays: HistoryDayItem[];
  themedStyles: ThemedStyles;
}

export function AppDetailHistorySection({
  historyDays,
  themedStyles,
}: AppDetailHistorySectionProps) {
  const maxMinutes = Math.max(...historyDays.map((item) => item.minutesUsed), 1);

  return (
    <View style={[appsStyles.detailCard, themedStyles.appCard]}>
      <ThemedText type="defaultSemiBold">Historial 7 días</ThemedText>

      <View style={appsStyles.detailHistoryGrid}>
        {historyDays.map((item) => {
          const heightPercent = Math.max(Math.round((item.minutesUsed / maxMinutes) * 100), item.hasLog ? 8 : 0);
          const barStyle = item.isGoalMet === false
            ? themedStyles.progressFillRed
            : themedStyles.progressFillGreen;
          const statusStyle =
            item.isGoalMet === null
              ? themedStyles.textMuted
              : item.isGoalMet
                ? themedStyles.textSuccess
                : themedStyles.textError;

          return (
            <View key={item.date} style={appsStyles.detailHistoryItem}>
              <View style={[appsStyles.detailHistoryTrack, themedStyles.progressTrack]}>
                <View
                  style={[
                    appsStyles.detailHistoryBar,
                    barStyle,
                    { height: `${heightPercent}%` as const },
                  ]}
                />
              </View>
              <ThemedText style={[appsStyles.detailHistoryStatus, statusStyle]}>
                {item.statusMark}
              </ThemedText>
              <ThemedText style={[appsStyles.detailHistoryLabel, themedStyles.textSecondary]}>
                {item.dayLabel}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
