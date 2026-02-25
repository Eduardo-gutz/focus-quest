import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

import type { SelectedApp } from "./OnboardingAppGrid";

interface OnboardingCompleteProps {
  selectedApps: SelectedApp[];
  goals: Record<string, number>;
  onStart: () => void;
  onBack: () => void;
}

function getAppKey(app: SelectedApp): string {
  return app.app.id === "other" && app.customName
    ? `other:${app.customName}`
    : app.app.id;
}

export function OnboardingComplete({
  selectedApps,
  goals,
  onStart,
  onBack,
}: OnboardingCompleteProps) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, typography } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 12 }),
      withSpring(1),
    );
    const t = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <Button label="Anterior" variant="ghost" size="sm" onPress={onBack} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.checkmarkWrap, { backgroundColor: `${colors.primary}22` }, checkAnimatedStyle]}
        >
          <ThemedText style={[styles.checkmark, { color: colors.success }]}>
            ✓
          </ThemedText>
        </Animated.View>

        <ThemedText
          type="heading1"
          style={[styles.title, { color: colors.primary }]}
        >
          ¡Estás listo!
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Resumen de tus apps configuradas
        </ThemedText>

        {showConfetti ? (
          <View style={styles.confettiRow}>
            {["🎉", "✨", "🌟", "💫", "⭐"].map((emoji, i) => (
              <Animated.Text
                key={i}
                entering={FadeInDown.delay(100 + i * 80).duration(400)}
                style={[styles.confettiEmoji, { top: -i * 4 }]}
              >
                {emoji}
              </Animated.Text>
            ))}
          </View>
        ) : null}

        <View style={styles.summaryList}>
          {selectedApps.map((selected, index) => {
            const key = getAppKey(selected);
            const displayName =
              selected.app.id === "other" && selected.customName
                ? selected.customName
                : selected.app.name;
            const goal = goals[key] ?? 30;
            return (
              <Animated.View
                key={key}
                entering={FadeInDown.delay(200 + index * 60).duration(350)}
                style={[
                  styles.summaryRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                <ThemedText style={styles.summaryEmoji}>
                  {selected.app.iconEmoji}
                </ThemedText>
                <ThemedText type="label" style={{ flex: 1 }}>
                  {displayName}
                </ThemedText>
                <ThemedText
                  type="label"
                  style={{ color: colors.primary }}
                >
                  {Math.round(goal)} min/día
                </ThemedText>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <Button
          label="¡Empezar!"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: "center",
  },
  checkmarkWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(249, 115, 22, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 44,
    fontWeight: "700",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  confettiRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  confettiEmoji: {
    fontSize: 28,
  },
  summaryList: {
    width: "100%",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  summaryEmoji: {
    fontSize: 24,
  },
  footer: {
    paddingTop: 16,
  },
});
