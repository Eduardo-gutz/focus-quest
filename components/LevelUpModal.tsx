import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import {
  getAchievementsUnlockedAtLevel,
  getLevelTitle,
} from '@/constants/gamification';
import { useTheme } from '@/hooks/use-theme';
import { useGamificationStore } from '@/stores/gamification-store';

import { ConfettiOverlay } from './ConfettiOverlay';

export function LevelUpModal() {
  const pendingLevelUp = useGamificationStore((s) => s.pendingLevelUp);
  const clearPendingLevelUp = useGamificationStore((s) => s.clearPendingLevelUp);
  const { colors, radius, shadow, spacing, typography } = useTheme();

  if (!pendingLevelUp)
    return null;

  const { level, xpGained } = pendingLevelUp;
  const levelTitle = getLevelTitle(level);
  const rewards = getAchievementsUnlockedAtLevel(level);

  return (
    <View style={[styles.overlay, { backgroundColor: `${colors.text}55` }]}>
      <ConfettiOverlay />
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.xl,
            ...shadow.card,
          },
        ]}
      >
        <ThemedText
          style={[
            typography.heading2,
            { color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
          ]}
        >
          ¡Nivel {level}!
        </ThemedText>
        <ThemedText
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
          ]}
        >
          {levelTitle}
        </ThemedText>
        <ThemedText
          style={[
            typography.label,
            { color: colors.success, textAlign: 'center', marginBottom: spacing.lg },
          ]}
        >
          +{xpGained} XP
        </ThemedText>
        {rewards.length > 0 && (
          <View style={[styles.rewardsSection, { marginBottom: spacing.lg }]}>
            <ThemedText
              style={[
                typography.caption,
                { color: colors.textMuted, marginBottom: spacing.sm },
              ]}
            >
              Logros desbloqueados
            </ThemedText>
            {rewards.map((r) => (
              <View
                key={r.id}
                style={[
                  styles.rewardRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.sm,
                    padding: spacing.sm,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <ThemedText style={{ fontSize: 20 }}>{r.emoji}</ThemedText>
                <ThemedText style={[typography.label, { marginLeft: spacing.sm }]}>
                  {r.name}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
        <Button
          label="¡Continuar!"
          variant="primary"
          size="lg"
          fullWidth
          onPress={clearPendingLevelUp}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '85%',
    maxWidth: 340,
    borderWidth: 1,
  },
  rewardsSection: {
    width: '100%',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
