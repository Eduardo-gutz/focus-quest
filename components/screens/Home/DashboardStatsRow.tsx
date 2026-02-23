import { View } from "react-native";

import { homeStyles, type HomeThemedStyles } from "@/components/screens/Home/home-styles";
import { ThemedText } from "@/components/themed-text";

interface DashboardStatsRowProps {
  currentStreak: number;
  currentLevel: number;
  xpToday: number;
  themedStyles: HomeThemedStyles;
}

export function DashboardStatsRow({
  currentStreak,
  currentLevel,
  xpToday,
  themedStyles,
}: DashboardStatsRowProps) {
  return (
    <View style={homeStyles.statsRow}>
      <View style={[homeStyles.statCard, themedStyles.statCard]}>
        <View style={[homeStyles.statAccentBar, themedStyles.statAccentBarStreak]} />
        <ThemedText style={homeStyles.statEmoji}>🔥</ThemedText>
        <ThemedText style={homeStyles.statValue}>{currentStreak}</ThemedText>
        <ThemedText style={[homeStyles.statLabel, themedStyles.mutedText]}>Racha</ThemedText>
      </View>

      <View style={[homeStyles.statCard, themedStyles.statCard]}>
        <View style={[homeStyles.statAccentBar, themedStyles.statAccentBarLevel]} />
        <ThemedText style={homeStyles.statEmoji}>⭐</ThemedText>
        <ThemedText style={homeStyles.statValue}>{currentLevel}</ThemedText>
        <ThemedText style={[homeStyles.statLabel, themedStyles.mutedText]}>Nivel</ThemedText>
      </View>

      <View style={[homeStyles.statCard, themedStyles.statCard]}>
        <View style={[homeStyles.statAccentBar, themedStyles.statAccentBarXp]} />
        <ThemedText style={homeStyles.statEmoji}>💫</ThemedText>
        <ThemedText style={homeStyles.statValue}>+{xpToday}</ThemedText>
        <ThemedText style={[homeStyles.statLabel, themedStyles.mutedText]}>XP hoy</ThemedText>
      </View>
    </View>
  );
}
