import { View } from "react-native";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface HeroSectionProps {
  activeAppsCount: number;
  maxActiveApps: number;
  activeStatusText: string;
  themedStyles: ThemedStyles;
}

export function HeroSection({
  activeAppsCount,
  maxActiveApps,
  activeStatusText,
  themedStyles,
}: HeroSectionProps) {
  return (
    <ThemedView style={[appsStyles.heroCard, themedStyles.heroCard]}>
      <View style={appsStyles.heroTopRow}>
        <View style={appsStyles.heroTitleWrap}>
          <ThemedText type="heading4">Tus apps de enfoque</ThemedText>
          <ThemedText style={[appsStyles.heroSubtitle, themedStyles.textMuted]}>
            Define el tiempo máximo diario y mantén solo lo que suma.
          </ThemedText>
        </View>
        <View style={[appsStyles.badgePill, themedStyles.badgePill]}>
          <ThemedText
            style={[appsStyles.badgePillText, themedStyles.textOnPrimary]}
          >
            S0
          </ThemedText>
        </View>
      </View>

      <View style={appsStyles.kpiGrid}>
        <ThemedView style={[appsStyles.kpiCard, themedStyles.kpiCard]}>
          <ThemedText style={[appsStyles.kpiLabel, themedStyles.textMuted]}>
            Activas
          </ThemedText>
          <ThemedText type="heading4">{activeAppsCount}</ThemedText>
        </ThemedView>
        <ThemedView style={[appsStyles.kpiCard, themedStyles.kpiCard]}>
          <ThemedText style={[appsStyles.kpiLabel, themedStyles.textMuted]}>
            Límite
          </ThemedText>
          <ThemedText type="heading4">{maxActiveApps}</ThemedText>
        </ThemedView>
        <ThemedView style={[appsStyles.kpiCard, themedStyles.kpiCard]}>
          <ThemedText style={[appsStyles.kpiLabel, themedStyles.textMuted]}>
            Estado
          </ThemedText>
          <ThemedText
            style={[appsStyles.kpiValueCompact, themedStyles.textSecondary]}
          >
            {activeStatusText}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}
