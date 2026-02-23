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
  ProfileAchievementsList,
  profileStyles,
  ProfileWeeklyChart,
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
    controlPercentage,
    unlockedCount,
    unlockedAchievementIds,
    totalAchievements,
    achievementsList,
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
              {levelProgress.xpInCurrentLevel} / {levelProgress.xpRangeInCurrentLevel} XP
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
                {currentStreak} 🔥
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
          <View style={[profileStyles.controlRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <ThemedText style={[profileStyles.controlLabel, themedStyles.mutedText]}>
              Tiempo bajo control
            </ThemedText>
            <ThemedText style={[profileStyles.controlValue, themedStyles.primaryText]}>
              {controlPercentage}%
            </ThemedText>
          </View>
        </View>

        <View style={[profileStyles.card, themedStyles.card]}>
          <ThemedText style={[profileStyles.sectionTitle, themedStyles.secondaryText]}>
            Tiempo en apps (min)
          </ThemedText>
          <ProfileWeeklyChart
            chartData={chartData}
            colors={colors}
            themedStyles={themedStyles}
          />
        </View>

        <View style={[profileStyles.card, themedStyles.card]}>
          <ThemedText style={[profileStyles.sectionTitle, themedStyles.secondaryText]}>
            Logros ({unlockedCount} / {totalAchievements} desbloqueados)
          </ThemedText>
          <ProfileAchievementsList
            achievements={achievementsList}
            unlockedIds={new Set(unlockedAchievementIds)}
            themedStyles={themedStyles}
          />
        </View>

        <View style={profileStyles.footerRow}>
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
