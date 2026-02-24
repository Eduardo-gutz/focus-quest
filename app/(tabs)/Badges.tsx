import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AchievementDetailModal,
  BadgeCard,
  badgesStyles,
  createBadgesThemedStyles,
} from "@/components/screens/Badges";
import { ThemedText } from "@/components/themed-text";
import { useBadges } from "@/hooks/use-badges";
import type { AchievementWithStatus } from "@/hooks/use-badges";
import { useTheme } from "@/hooks/use-theme";

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, radius, shadow } = useTheme();
  const themedStyles = useMemo(
    () => createBadgesThemedStyles(colors, radius, shadow),
    [colors, radius, shadow],
  );
  const {
    achievementsWithStatus,
    unlockedCount,
    totalAchievements,
    isHydrating,
    refresh,
  } = useBadges();

  const [selectedAchievementId, setSelectedAchievementId] = useState<
    string | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const selectedItem = useMemo(
    () =>
      achievementsWithStatus.find(
        (a) => a.achievement.id === selectedAchievementId,
      ) ?? null,
    [achievementsWithStatus, selectedAchievementId],
  );

  const progressRatio =
    totalAchievements > 0 ? unlockedCount / totalAchievements : 0;

  const renderItem = useCallback(
    ({ item, index }: { item: AchievementWithStatus; index: number }) => (
      <BadgeCard
        achievement={item.achievement}
        isUnlocked={item.isUnlocked}
        unlockedAt={item.unlockedAt}
        isNew={item.isNew}
        index={index}
        themedStyles={themedStyles}
        onPress={() => setSelectedAchievementId(item.achievement.id)}
      />
    ),
    [themedStyles],
  );

  const keyExtractor = useCallback(
    (item: AchievementWithStatus) => item.achievement.id,
    [],
  );

  return (
    <View
      style={[
        badgesStyles.container,
        themedStyles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <FlatList
        data={achievementsWithStatus}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={badgesStyles.columnWrapper}
        contentContainerStyle={badgesStyles.contentContainer}
        ListHeaderComponent={
          <View style={badgesStyles.header}>
            <ThemedText
              style={[badgesStyles.headerTitle, themedStyles.headerTitle]}
            >
              Logros
            </ThemedText>
            <View style={badgesStyles.headerProgressRow}>
              <ThemedText
                style={[
                  badgesStyles.headerProgressLabel,
                  themedStyles.headerTitle,
                ]}
              >
                {unlockedCount} / {totalAchievements} desbloqueados
              </ThemedText>
              <View
                style={[
                  badgesStyles.headerProgressTrack,
                  themedStyles.headerProgressTrack,
                ]}
              >
                <View
                  style={[
                    badgesStyles.headerProgressFill,
                    themedStyles.headerProgressFill,
                    {
                      width: `${Math.round(progressRatio * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isHydrating}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
      />

      <AchievementDetailModal
        visible={selectedAchievementId !== null}
        achievement={selectedItem?.achievement ?? null}
        isUnlocked={selectedItem?.isUnlocked ?? false}
        themedStyles={themedStyles}
        onClose={() => setSelectedAchievementId(null)}
      />
    </View>
  );
}
