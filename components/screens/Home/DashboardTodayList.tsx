import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import {
  homeStyles,
  type HomeThemedStyles,
} from "@/components/screens/Home/home-styles";
import { ThemedText } from "@/components/themed-text";
import { type DashboardTopApp } from "@/hooks/use-dashboard";

interface DashboardTodayListProps {
  apps: DashboardTopApp[];
  themedStyles: HomeThemedStyles;
}

export function DashboardTodayList({
  apps,
  themedStyles,
}: DashboardTodayListProps) {
  const router = useRouter();

  return (
    <View style={[homeStyles.card, themedStyles.card]}>
      <View style={homeStyles.sectionTitleRow}>
        <ThemedText style={homeStyles.sectionTitle}>Hoy</ThemedText>
        <Pressable onPress={() => router.push("/(tabs)/Apps")}>
          <ThemedText style={[homeStyles.sectionLinkText, themedStyles.primaryText]}>
            Ver todo →
          </ThemedText>
        </Pressable>
      </View>

      {apps.length === 0 ? (
        <View style={[homeStyles.emptyAppsWrap, themedStyles.emptyAppsWrap]}>
          <ThemedText type="defaultSemiBold">
            Aún no hay apps activas
          </ThemedText>
          <ThemedText style={[{ fontSize: 13 }, themedStyles.secondaryText]}>
            Agrega una app para empezar a medir tu foco.
          </ThemedText>
        </View>
      ) : (
        <View style={homeStyles.appsList}>
          {apps.map((app) => {
            const progressPct = Math.round(app.progressRatio * 100);
            const progressWidth = `${Math.min(progressPct, 100)}%` as const;

            const progressStyle =
              app.progressRatio < 0.75
                ? themedStyles.appProgressFillPrimary
                : app.progressRatio < 1
                  ? themedStyles.appProgressFillWarn
                  : themedStyles.appProgressFillBad;

            const accentStyle =
              app.progressRatio >= 1
                ? themedStyles.appRowOverGoal
                : app.isGoalMet
                  ? themedStyles.appRowGoalMet
                  : themedStyles.appRowActive;

            return (
              <View
                key={app.id}
                style={[homeStyles.appRow, themedStyles.appRow, accentStyle]}
              >
                <View style={[homeStyles.appEmojiWrap, themedStyles.appEmojiWrap]}>
                  <ThemedText style={homeStyles.appEmojiText}>
                    {app.iconEmoji}
                  </ThemedText>
                </View>
                <View style={homeStyles.appInfo}>
                  <ThemedText style={homeStyles.appName}>{app.name}</ThemedText>
                  <ThemedText
                    style={[homeStyles.appMinutes, themedStyles.secondaryText]}
                  >
                    {app.usedMinutes} / {app.goalMinutes} min
                  </ThemedText>
                  <View
                    style={[
                      homeStyles.appProgressTrack,
                      themedStyles.appProgressTrack,
                    ]}
                  >
                    <View
                      style={[
                        homeStyles.appProgressFill,
                        progressStyle,
                        { width: progressWidth },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText
                  style={[
                    homeStyles.appStatus,
                    app.isGoalMet
                      ? themedStyles.successText
                      : themedStyles.errorText,
                  ]}
                >
                  {app.statusMark}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
