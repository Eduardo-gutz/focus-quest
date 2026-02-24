import { useState } from "react";
import { Pressable, View } from "react-native";

import type { AchievementDefinition } from "@/constants/gamification";
import { ThemedText } from "@/components/themed-text";
import { profileStyles } from "@/components/screens/Profile/profile-styles";
import type { ProfileThemedStyles } from "@/components/screens/Profile/profile-styles";

const INITIAL_COUNT = 5;

interface ProfileAchievementsListProps {
  achievements: AchievementDefinition[];
  unlockedIds: Set<string>;
  themedStyles: ProfileThemedStyles;
}

export function ProfileAchievementsList({
  achievements,
  unlockedIds,
  themedStyles,
}: ProfileAchievementsListProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleCount = expanded ? achievements.length : INITIAL_COUNT;
  const visibleAchievements = achievements.slice(0, visibleCount);
  const hasMore = achievements.length > INITIAL_COUNT;

  return (
    <View style={profileStyles.achievementsList}>
      {visibleAchievements.map((achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        return (
          <View
            key={achievement.id}
            style={[
              profileStyles.achievementItem,
              themedStyles.achievementItem,
              !isUnlocked && profileStyles.achievementItemLocked,
            ]}
          >
            <ThemedText style={profileStyles.achievementEmoji}>
              {isUnlocked ? achievement.emoji : "🔒"}
            </ThemedText>
            <View style={profileStyles.achievementContent}>
              <ThemedText
                style={[
                  profileStyles.achievementName,
                  themedStyles.primaryText,
                  !isUnlocked && themedStyles.mutedText,
                ]}
              >
                {achievement.name}
              </ThemedText>
              <ThemedText
                style={[
                  profileStyles.achievementDesc,
                  themedStyles.mutedText,
                ]}
                numberOfLines={1}
              >
                {achievement.description}
              </ThemedText>
            </View>
          </View>
        );
      })}
      {hasMore && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={({ pressed }) => [
            profileStyles.achievementVerMas,
            themedStyles.achievementVerMas,
            pressed && { opacity: 0.85 },
          ]}
        >
          <ThemedText style={[profileStyles.achievementVerMasText, themedStyles.primaryText]}>
            {expanded ? "Ver menos" : "Ver más"}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}
