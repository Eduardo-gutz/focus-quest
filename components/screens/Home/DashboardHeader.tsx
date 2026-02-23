import { View } from "react-native";

import { homeStyles, type HomeThemedStyles } from "@/components/screens/Home/home-styles";
import { ThemedText } from "@/components/themed-text";

interface DashboardHeaderProps {
  greeting: string;
  currentLevel: number;
  levelTitle: string;
  themedStyles: HomeThemedStyles;
}

export function DashboardHeader({
  greeting,
  currentLevel,
  levelTitle,
  themedStyles,
}: DashboardHeaderProps) {
  return (
    <View style={[homeStyles.card, themedStyles.card]}>
      <View style={homeStyles.headerTopRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={[homeStyles.subtitleText, themedStyles.mutedText]}>
            {levelTitle}
          </ThemedText>
          <ThemedText style={homeStyles.headerGreeting}>{greeting}</ThemedText>
        </View>
        <View style={[homeStyles.headerLevelBadge, themedStyles.headerLevelBadge]}>
          <ThemedText style={[homeStyles.headerLevelBadgeText, themedStyles.primaryText]}>
            ✦
          </ThemedText>
          <ThemedText style={[homeStyles.headerLevelBadgeText, themedStyles.primaryText]}>
            Nv {currentLevel}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
