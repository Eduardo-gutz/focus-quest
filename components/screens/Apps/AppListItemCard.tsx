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
  onSwipeableWillOpen?: (itemId: number, swipeable: Swipeable | null) => void;
  onSwipeableClose?: (itemId: number) => void;
  onCardPress?: (itemId: number) => void;
  onLogUsagePress?: (itemId: number) => void;
}

export function AppListItemCard({
  item,
  usedMinutes,
  themedStyles,
  renderRightActions,
  onSwipeableWillOpen,
  onSwipeableClose,
  onCardPress,
  onLogUsagePress,
}: AppListItemCardProps) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const goalMinutes = item.dailyGoalMinutes;
  const progressRatio = goalMinutes > 0 ? Math.min(usedMinutes / goalMinutes, 1) : 0;
  const progressPercentage = progressRatio * 100;
  const progressWidth = `${Math.round(progressPercentage)}%` as const;
  const isGoalMet = usedMinutes <= goalMinutes;
  const statusMark = isGoalMet ? "✓" : "✗";

  const progressFillStyle =
    progressPercentage < 60
      ? themedStyles.progressFillGreen
      : progressPercentage < 85
        ? themedStyles.progressFillYellow
        : progressPercentage < 100
          ? themedStyles.progressFillOrange
          : themedStyles.progressFillRed;

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
        style={({ pressed }) => [pressed ? appsStyles.opacityPressed90 : null]}
      >
        <ThemedView style={[appsStyles.appCard, themedStyles.appCard]}>
          <View style={appsStyles.appTopRow}>
            <View style={[appsStyles.appEmojiBubble, themedStyles.appEmojiBubble]}>
              <ThemedText style={appsStyles.emojiText}>
                {item.iconEmoji || "📱"}
              </ThemedText>
            </View>

            <View style={appsStyles.appInfo}>
              <ThemedText style={appsStyles.appName}>{item.name}</ThemedText>
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
                progressFillStyle,
                { width: progressWidth },
              ]}
            />
          </View>

          {item.isActive ? (
            <Pressable
              onPress={() => {
                onLogUsagePress?.(item.id);
              }}
              style={({ pressed }) => [
                appsStyles.appQuickAction,
                themedStyles.appQuickAction,
                pressed ? appsStyles.opacityPressed90 : null,
              ]}
            >
              <ThemedText
                style={[appsStyles.appQuickActionText, themedStyles.textPrimary]}
              >
                + Registrar tiempo
              </ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>
      </Pressable>
    </Swipeable>
  );
}
