import Slider from "@react-native-community/slider";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import {
  ONBOARDING_GOAL_DEFAULT,
  ONBOARDING_GOAL_MAX,
  ONBOARDING_GOAL_MIN
} from "@/constants/apps";
import { useTheme } from "@/hooks/use-theme";

import type { SelectedApp } from "./OnboardingAppGrid";

interface OnboardingAppGoalsProps {
  selectedApps: SelectedApp[];
  goals: Record<string, number>;
  onGoalsChange: (goals: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
}

function getAppKey(app: SelectedApp): string {
  return app.app.id === "other" && app.customName
    ? `other:${app.customName}`
    : app.app.id;
}

export function OnboardingAppGoals({
  selectedApps,
  goals,
  onGoalsChange,
  onNext,
  onBack,
}: OnboardingAppGoalsProps) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();

  const updateGoal = useCallback(
    (key: string, value: number) => {
      onGoalsChange({ ...goals, [key]: value });
    },
    [goals, onGoalsChange],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Button label="Anterior" variant="ghost" size="sm" onPress={onBack} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="heading2" style={styles.title}>
          Configura tus metas
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          ¿Cuántos minutos al día quieres usar cada app?
        </ThemedText>

        {selectedApps.map((selected) => {
          const key = getAppKey(selected);
          const displayName = selected.app.id === "other" && selected.customName
            ? selected.customName
            : selected.app.name;
          const value = goals[key] ?? ONBOARDING_GOAL_DEFAULT;
          return (
            <View
              key={key}
              style={[
                styles.goalRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.goalHeader}>
                <ThemedText style={styles.goalEmoji}>{selected.app.iconEmoji}</ThemedText>
                <ThemedText type="label" style={{ flex: 1 }}>
                  {displayName}
                </ThemedText>
                <ThemedText type="label" style={{ color: colors.primary }}>
                  {Math.round(value)} min/día
                </ThemedText>
              </View>
              <Slider
                value={value}
                onValueChange={(v) => updateGoal(key, v)}
                minimumValue={ONBOARDING_GOAL_MIN}
                maximumValue={ONBOARDING_GOAL_MAX}
                step={5}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.progressTrack}
                thumbTintColor={colors.primary}
                style={styles.slider}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label="Siguiente"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onNext}
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
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  goalRow: {
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  goalEmoji: {
    fontSize: 28,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  footer: {
    paddingTop: 16,
  },
});
