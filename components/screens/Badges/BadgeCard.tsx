import { Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  badgesStyles,
  type BadgesThemedStyles,
} from "@/components/screens/Badges/badges-styles";
import { ThemedText } from "@/components/themed-text";
import type { AchievementDefinition } from "@/constants/gamification";
import { formatUnlockedDate } from "@/hooks/use-badges";

interface BadgeCardProps {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt: string | null;
  isNew: boolean;
  index: number;
  themedStyles: BadgesThemedStyles;
  onPress: () => void;
}

export function BadgeCard({
  achievement,
  isUnlocked,
  unlockedAt,
  isNew,
  index,
  themedStyles,
  onPress,
}: BadgeCardProps) {
  const entering = FadeInDown.delay(index * 50).duration(300);

  return (
    <Animated.View entering={entering} style={{ flex: 1, minWidth: 0 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          badgesStyles.badgeCard,
          themedStyles.badgeCard,
          !isUnlocked && badgesStyles.badgeCardLocked,
          !isUnlocked && themedStyles.badgeCardLocked,
          pressed && { opacity: 0.9 },
        ]}
      >
        {isNew && (
          <View style={[badgesStyles.newBadge, themedStyles.newBadge]}>
            <ThemedText style={[badgesStyles.newBadgeText, themedStyles.newBadgeText]}>
              ¡Nuevo!
            </ThemedText>
          </View>
        )}
        <ThemedText
          style={[
            badgesStyles.badgeEmoji,
            !isUnlocked && badgesStyles.badgeEmojiLocked,
          ]}
        >
          {isUnlocked ? achievement.emoji : "🔒"}
        </ThemedText>
        <ThemedText
          style={[badgesStyles.badgeName, themedStyles.badgeName]}
          numberOfLines={2}
        >
          {achievement.name}
        </ThemedText>
        {isUnlocked && unlockedAt ? (
          <ThemedText
            style={[badgesStyles.badgeDate, themedStyles.badgeDate]}
            numberOfLines={1}
          >
            {formatUnlockedDate(unlockedAt)}
          </ThemedText>
        ) : (
          <ThemedText
            style={[badgesStyles.badgeHint, themedStyles.badgeHint]}
            numberOfLines={2}
          >
            {achievement.hint}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}
