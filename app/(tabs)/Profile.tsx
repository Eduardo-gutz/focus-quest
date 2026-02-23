import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { homeStyles } from "@/components/screens/Home/home-styles";
import {
  createProfileThemedStyles,
  profileStyles,
} from "@/components/screens/Profile";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/hooks/use-theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, radius, shadow } = useTheme();
  const themedStyles = useMemo(
    () => createProfileThemedStyles(colors, radius, shadow),
    [colors, radius, shadow],
  );
  const {
    levelEmoji,
    currentLevel,
    levelTitle,
    levelProgress,
    currentStreak,
    longestStreak,
    totalDaysTracked,
    totalGoalsMet,
    unlockedCount,
    totalAchievements,
    chartData,
    isHydrating,
    refresh,
  } = useProfile();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const maxXp = Math.max(...chartData.map((d) => d.xpEarned), 1);

  return (
    <View
      style={[
        profileStyles.container,
        themedStyles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={profileStyles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isHydrating}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[profileStyles.card, themedStyles.card]}>
          <View style={profileStyles.avatarRow}>
            <ThemedText style={profileStyles.avatarEmoji}>{levelEmoji}</ThemedText>
            <ThemedText style={[profileStyles.avatarLevel, themedStyles.primaryText]}>
              Nivel {currentLevel}
            </ThemedText>
            <ThemedText style={[profileStyles.avatarTitle, themedStyles.mutedText]}>
              {levelTitle}
            </ThemedText>
          </View>

          <View style={[homeStyles.xpTrack, themedStyles.progressTrack]}>
            <View
              style={[
                homeStyles.xpFill,
                { backgroundColor: colors.primary, width: `${Math.round(levelProgress.progressRatio * 100)}%` },
              ]}
            />
          </View>
          <View style={homeStyles.xpLevelsRow}>
            <ThemedText style={[homeStyles.xpLevelLabel, themedStyles.secondaryText]}>
              Nivel {currentLevel}
            </ThemedText>
            <ThemedText style={[homeStyles.xpLevelLabel, themedStyles.mutedText]}>
              {levelProgress.xpToNextLevel} XP para subir
            </ThemedText>
          </View>
        </View>

        <View style={[profileStyles.card, themedStyles.card]}>
          <ThemedText style={[profileStyles.sectionTitle, themedStyles.secondaryText]}>
            Estadísticas
          </ThemedText>
          <View style={profileStyles.statsGrid}>
            <View style={[profileStyles.statCard, themedStyles.statCard]}>
              <ThemedText style={[profileStyles.statValue, themedStyles.primaryText]}>
                {currentStreak}
              </ThemedText>
              <ThemedText style={[profileStyles.statLabel, themedStyles.mutedText]}>
                Racha actual
              </ThemedText>
            </View>
            <View style={[profileStyles.statCard, themedStyles.statCard]}>
              <ThemedText style={[profileStyles.statValue, themedStyles.primaryText]}>
                {longestStreak}
              </ThemedText>
              <ThemedText style={[profileStyles.statLabel, themedStyles.mutedText]}>
                Racha máx
              </ThemedText>
            </View>
            <View style={[profileStyles.statCard, themedStyles.statCard]}>
              <ThemedText style={[profileStyles.statValue, themedStyles.primaryText]}>
                {totalDaysTracked}
              </ThemedText>
              <ThemedText style={[profileStyles.statLabel, themedStyles.mutedText]}>
                Días trackeados
              </ThemedText>
            </View>
            <View style={[profileStyles.statCard, themedStyles.statCard]}>
              <ThemedText style={[profileStyles.statValue, themedStyles.primaryText]}>
                {totalGoalsMet}
              </ThemedText>
              <ThemedText style={[profileStyles.statLabel, themedStyles.mutedText]}>
                Metas cumplidas
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[profileStyles.card, themedStyles.card]}>
          <ThemedText style={[profileStyles.sectionTitle, themedStyles.secondaryText]}>
            XP semanal
          </ThemedText>
          <View style={profileStyles.chartGrid}>
            {chartData.map((item) => {
              const heightPercent = Math.max(
                Math.round((item.xpEarned / maxXp) * 100),
                item.xpEarned > 0 ? 8 : 0,
              );
              const barStyle = item.allGoalsMet
                ? themedStyles.chartBarSuccess
                : themedStyles.chartBarPrimary;
              return (
                <View key={item.date} style={profileStyles.chartItem}>
                  <View style={[profileStyles.chartTrack, themedStyles.progressTrack]}>
                    <View
                      style={[
                        profileStyles.chartBar,
                        barStyle,
                        { height: `${heightPercent}%` as const },
                      ]}
                    />
                  </View>
                  <ThemedText style={[profileStyles.chartLabel, themedStyles.mutedText]}>
                    {item.dayLabel}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        <View style={profileStyles.footerRow}>
          <ThemedText style={[profileStyles.footerBadges, themedStyles.secondaryText]}>
            {unlockedCount} / {totalAchievements} logros
          </ThemedText>
          <Pressable
            onPress={openSettings}
            style={({ pressed }) => [
              profileStyles.settingsButton,
              themedStyles.settingsButton,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <IconSymbol name="gearshape.fill" size={18} color={colors.text} />
            <ThemedText style={[profileStyles.settingsButtonText, themedStyles.settingsButtonText]}>
              Settings
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
