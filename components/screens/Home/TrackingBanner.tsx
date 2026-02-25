import { Platform, Pressable, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useSettingsStore } from "@/stores/settings-store";
import { requestUsageStatsPermission } from "usage-stats";

export function TrackingBanner() {
  const { colors, radius, shadow, spacing, typography } = useTheme();
  const setPermissionBannerRejected = useSettingsStore(
    (s) => s.setPermissionBannerRejected,
  );

  if (Platform.OS !== "android") {
    return null;
  }

  const handleActivate = () => {
    requestUsageStatsPermission();
  };

  const handleDismiss = () => {
    setPermissionBannerRejected(true);
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          ...shadow.card,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
          <ThemedText style={styles.icon}>📊</ThemedText>
        </View>
        <View style={styles.textWrap}>
          <ThemedText
            style={[typography.label, { color: colors.text }]}
            numberOfLines={1}
          >
            Activa el tracking automático
          </ThemedText>
        </View>
        <Button
          label="Activar"
          variant="primary"
          size="sm"
          onPress={handleActivate}
        />
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Descartar banner"
        >
          <ThemedText style={[typography.caption, { color: colors.textMuted }]}>
            ✕
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    minHeight: 48,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  closeButton: {
    padding: 4,
  },
});
