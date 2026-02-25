import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useSettingsStore } from "@/stores/settings-store";
import { requestUsageStatsPermission } from "usage-stats";

interface OnboardingPermissionStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function OnboardingPermissionStep({
  onContinue,
  onBack,
}: OnboardingPermissionStepProps) {
  const insets = useSafeAreaInsets();
  const { colors, radius, shadow, spacing, typography } = useTheme();
  const setPermissionModalShown = useSettingsStore(
    (s) => s.setPermissionModalShown,
  );

  const handleGrantPermission = () => {
    requestUsageStatsPermission();
    setPermissionModalShown(true);
    onContinue();
  };

  const handleNotNow = () => {
    setPermissionModalShown(true);
    onContinue();
  };

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

      <View style={[styles.content, { paddingHorizontal: spacing.xl }]}>
        <View
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
              typography.heading3,
              {
                color: colors.primary,
                textAlign: "center",
                marginBottom: spacing.sm,
              },
            ]}
          >
            Activa el tracking automático
          </ThemedText>
          <ThemedText
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: spacing.lg,
              },
            ]}
          >
            Para medir el tiempo de uso de tus apps sin abrir FocusQuest,
            necesitamos el permiso de acceso a estadísticas de uso. Tus datos se
            mantienen en tu dispositivo y no se comparten.
          </ThemedText>
          <View style={styles.buttonsRow}>
            <Button
              label="Dar permiso"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleGrantPermission}
            />
            <Button
              label="Ahora no"
              variant="ghost"
              size="lg"
              fullWidth
              onPress={handleNotNow}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
  },
  buttonsRow: {
    gap: 12,
  },
});
