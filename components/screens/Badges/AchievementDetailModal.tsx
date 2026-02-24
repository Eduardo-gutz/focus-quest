import { Modal, Pressable } from "react-native";

import {
  badgesStyles,
  type BadgesThemedStyles,
} from "@/components/screens/Badges/badges-styles";
import { ThemedText } from "@/components/themed-text";
import type { AchievementDefinition } from "@/constants/gamification";
import { XP_ACHIEVEMENT_UNLOCK } from "@/constants/gamification";

interface AchievementDetailModalProps {
  visible: boolean;
  achievement: AchievementDefinition | null;
  isUnlocked: boolean;
  themedStyles: BadgesThemedStyles;
  onClose: () => void;
}

export function AchievementDetailModal({
  visible,
  achievement,
  isUnlocked,
  themedStyles,
  onClose,
}: AchievementDetailModalProps) {
  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={badgesStyles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[badgesStyles.modalContent, themedStyles.modalContent]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText style={badgesStyles.modalEmoji}>
            {isUnlocked ? achievement.emoji : "🔒"}
          </ThemedText>
          <ThemedText style={[badgesStyles.modalTitle, themedStyles.modalTitle]}>
            {achievement.name}
          </ThemedText>
          <ThemedText
            style={[badgesStyles.modalDescription, themedStyles.modalDescription]}
          >
            {achievement.description}
          </ThemedText>
          <ThemedText
            style={[badgesStyles.modalCondition, themedStyles.modalCondition]}
          >
            {achievement.hint}
          </ThemedText>
          {isUnlocked && (
            <ThemedText style={[badgesStyles.modalXp, themedStyles.modalXp]}>
              +{XP_ACHIEVEMENT_UNLOCK} XP ganados
            </ThemedText>
          )}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              badgesStyles.modalCloseButton,
              themedStyles.modalCloseButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <ThemedText
              style={[
                badgesStyles.modalCloseButtonText,
                themedStyles.modalCloseButtonText,
              ]}
            >
              Cerrar
            </ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
