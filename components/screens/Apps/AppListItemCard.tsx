import { useRef } from "react";
import { Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import type { ListItem } from "@/components/screens/Apps/ListSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface AppListItemCardProps {
  item: ListItem;
  usedMinutes: number;
  themedStyles: ThemedStyles;
  renderRightActions: (item: ListItem) => React.ReactNode;
  onSwipeableWillOpen?: (
    itemId: number,
    swipeable: Swipeable | null,
  ) => void;
  onSwipeableClose?: (itemId: number) => void;
  onCardPress?: (itemId: number) => void;
}

export function AppListItemCard({
  item,
  usedMinutes,
  themedStyles,
  renderRightActions,
  onSwipeableWillOpen,
  onSwipeableClose,
  onCardPress,
}: AppListItemCardProps) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const goalMinutes = item.dailyGoalMinutes;
  const progressRatio =
    goalMinutes > 0 ? Math.min(usedMinutes / goalMinutes, 1) : 0;
  const progressWidth = `${Math.round(progressRatio * 100)}%` as const;
  const isGoalMet = usedMinutes <= goalMinutes;
  const statusMark = isGoalMet ? "✓" : "✗";

  return (
    <Swipeable
      ref={swipeableRef}
      onSwipeableWillOpen={() => {
        onSwipeableWillOpen?.(item.id, swipeableRef.current);
      }}
      onSwipeableClose={() => {
        onSwipeableClose?.(item.id);
      }}
      renderRightActions={() => renderRightActions(item)}
    >
      <Pressable
        onPress={() => {
          onCardPress?.(item.id);
        }}
      >
        <ThemedView style={[appsStyles.appCard, themedStyles.appCard]}>
          <View style={appsStyles.appTopRow}>
            <View
              style={[appsStyles.appEmojiBubble, themedStyles.appEmojiBubble]}
            >
              <ThemedText style={appsStyles.emojiText}>
                {item.iconEmoji || "📱"}
              </ThemedText>
            </View>

            <View style={appsStyles.appInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText
                style={[appsStyles.usageText, themedStyles.textSecondary]}
              >
                {usedMinutes} / {goalMinutes} min
              </ThemedText>
            </View>

            <ThemedText
              style={[
                appsStyles.statusMark,
                isGoalMet ? themedStyles.textSuccess : themedStyles.textError,
              ]}
            >
              {statusMark}
            </ThemedText>
          </View>

          <View style={[appsStyles.progressTrack, themedStyles.progressTrack]}>
            <View
              style={[
                appsStyles.progressFill,
                isGoalMet
                  ? themedStyles.progressFillGood
                  : themedStyles.progressFillOver,
                { width: progressWidth },
              ]}
            />
          </View>
        </ThemedView>
      </Pressable>
    </Swipeable>
  );
}
