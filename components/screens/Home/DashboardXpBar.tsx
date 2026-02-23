import { View } from "react-native";

import { homeStyles, type HomeThemedStyles } from "@/components/screens/Home/home-styles";
import { type DashboardLevelProgress } from "@/services/dashboard-metrics";
import { ThemedText } from "@/components/themed-text";

interface DashboardXpBarProps {
  levelProgress: DashboardLevelProgress;
  themedStyles: HomeThemedStyles;
}

export function DashboardXpBar({ levelProgress, themedStyles }: DashboardXpBarProps) {
  const width = `${Math.round(levelProgress.progressRatio * 100)}%` as const;

  return (
    <View style={[homeStyles.card, themedStyles.card]}>
      <View style={homeStyles.xpTopRow}>
        <ThemedText style={[homeStyles.xpLabel, themedStyles.mutedText]}>
          Progreso de nivel
        </ThemedText>
        <ThemedText style={[homeStyles.xpValue, themedStyles.primaryText]}>
          {levelProgress.xpToNextLevel} XP
        </ThemedText>
      </View>

      <View style={[homeStyles.xpTrack, themedStyles.xpTrack]}>
        <View style={[homeStyles.xpFill, themedStyles.xpFill, { width }]} />
      </View>

      <View style={homeStyles.xpLevelsRow}>
        <ThemedText style={[homeStyles.xpLevelLabel, themedStyles.secondaryText]}>
          Nivel {levelProgress.currentLevel}
        </ThemedText>
        <ThemedText style={[homeStyles.xpLevelLabel, themedStyles.mutedText]}>
          para subir al {levelProgress.currentLevel + 1}
        </ThemedText>
      </View>
    </View>
  );
}
