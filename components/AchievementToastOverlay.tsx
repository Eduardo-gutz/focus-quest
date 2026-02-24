import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAchievementToastStore } from '@/stores/achievement-toast-store';

const AUTO_DISMISS_MS = 3000;
const SWIPE_UP_THRESHOLD = -40;

export function AchievementToastOverlay() {
  const insets = useSafeAreaInsets();
  const { colors, radius, shadow, spacing, typography } = useTheme();
  const currentItem = useAchievementToastStore((s) =>
    s.queue.length > 0 ? s.queue[0] : null,
  );
  const dequeue = useAchievementToastStore((s) => s.dequeue);

  const handleDismiss = useCallback(() => {
    dequeue();
  }, [dequeue]);

  useEffect(() => {
    if (!currentItem)
      return;

    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [currentItem, handleDismiss]);

  const panGesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .onEnd((e) => {
      'worklet';
      if (e.translationY < SWIPE_UP_THRESHOLD || e.velocityY < -300)
        runOnJS(handleDismiss)();
    });

  if (!currentItem)
    return null;

  return (
    <View
      style={[
        styles.container,
        {
          top: 0,
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.md,
        },
      ]}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={panGesture}>
          <Animated.View
            key={currentItem.id}
            entering={SlideInUp.duration(300)}
            exiting={SlideOutUp.duration(250)}
            style={[
              styles.toast,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                ...shadow.card,
              },
            ]}
          >
            <View style={styles.content}>
              <ThemedText style={[styles.emoji, { fontSize: 40 }]}>
                {currentItem.emoji}
              </ThemedText>
              <View style={[styles.textColumn, { marginLeft: spacing.md }]}>
                <ThemedText
                  style={[typography.label, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {currentItem.name}
                </ThemedText>
                <ThemedText
                  style={[typography.caption, { color: colors.success }]}
                >
                  +{currentItem.xpAmount} XP
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9998,
  },
  toast: {
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    lineHeight: 40,
  },
  textColumn: {
    flex: 1,
  },
});
