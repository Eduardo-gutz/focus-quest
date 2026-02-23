import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DashboardHeader,
  DashboardProgressRing,
  DashboardStatsRow,
  DashboardTodayList,
  DashboardXpBar,
  createHomeThemedStyles,
  homeStyles,
} from "@/components/screens/Home";
import { ThemedText } from "@/components/themed-text";
import { useDashboard } from "@/hooks/use-dashboard";
import { useTheme } from "@/hooks/use-theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, radius, shadow } = useTheme();
  const themedStyles = useMemo(
    () => createHomeThemedStyles(colors, radius, shadow),
    [colors, radius, shadow],
  );
  const {
    greeting,
    completionPercentage,
    metGoalsCount,
    totalGoalsCount,
    currentStreak,
    currentLevel,
    levelTitle,
    xpToday,
    levelProgress,
    topApps,
    isHydrating,
    error,
    refresh,
  } = useDashboard();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openLogUsage = useCallback(() => {
    router.push("/log-usage");
  }, [router]);

  return (
    <View style={[homeStyles.container, themedStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View entering={FadeIn.duration(320)} style={homeStyles.container}>
        <ScrollView
          contentContainerStyle={homeStyles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isHydrating}
              onRefresh={() => {
                void refresh();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <DashboardHeader
            greeting={greeting}
            currentLevel={currentLevel}
            levelTitle={levelTitle}
            themedStyles={themedStyles}
          />

          <DashboardProgressRing
            completionPercentage={completionPercentage}
            metGoalsCount={metGoalsCount}
            totalGoalsCount={totalGoalsCount}
            colors={colors}
            themedStyles={themedStyles}
          />

          <DashboardStatsRow
            currentStreak={currentStreak}
            currentLevel={currentLevel}
            xpToday={xpToday}
            themedStyles={themedStyles}
          />

          <DashboardXpBar levelProgress={levelProgress} themedStyles={themedStyles} />

          <DashboardTodayList apps={topApps} themedStyles={themedStyles} />

          {error ? (
            <View style={[homeStyles.errorCard, themedStyles.errorCard]}>
              <ThemedText style={[homeStyles.errorText, themedStyles.errorText]}>
                {error}
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>

      <Pressable
        onPress={openLogUsage}
        style={({ pressed }) => [
          homeStyles.fab,
          themedStyles.fab,
          pressed ? homeStyles.opacityPressed85 : null,
        ]}
      >
        <ThemedText style={[homeStyles.fabText, themedStyles.fabText]}>+</ThemedText>
      </Pressable>
    </View>
  );
}
