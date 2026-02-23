import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { LogUsageSection, createThemedStyles } from "@/components/screens/Apps";
import { ThemedText } from "@/components/themed-text";
import { useApps } from "@/hooks/use-apps";
import { useTheme } from "@/hooks/use-theme";

export default function LogUsageModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId?: string }>();
  const initialAppId = Number.parseInt(params.appId ?? "", 10);
  const { colors, radius, shadow, spacing } = useTheme();
  const themedStyles = useMemo(
    () => createThemedStyles(colors, radius, shadow, spacing),
    [colors, radius, shadow, spacing],
  );
  const { activeApps, todayLogs, isMutating, logUsage } = useApps();
  const existingLogAppIds = useMemo(
    () => [...new Set(todayLogs.map((log) => log.appId))],
    [todayLogs],
  );

  const dismiss = () => router.back();

  if (activeApps.length === 0) {
    return (
      <View style={styles.overlayRoot}>
        <Pressable style={[styles.backdrop, { backgroundColor: `${colors.text}55` }]} onPress={dismiss} />
        <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, ...shadow.card }]}>
          <View style={[styles.handle, { backgroundColor: `${colors.primary}33` }]} />
          <ThemedText type="defaultSemiBold">No hay apps activas para registrar uso.</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlayRoot}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: `${colors.text}55` }]}
        onPress={dismiss}
      />

      <View
        style={[
          styles.sheetCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            ...shadow.card,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: `${colors.primary}33` }]} />
        <LogUsageSection
          apps={activeApps}
          todayLogsCount={todayLogs.length}
          existingLogAppIds={existingLogAppIds}
          isMutating={isMutating}
          placeholderTextColor={colors.textMuted}
          primaryTextColor={colors.onPrimary}
          themedStyles={themedStyles}
          initialAppId={Number.isFinite(initialAppId) ? initialAppId : undefined}
          onSubmit={async ({ appId, minutesUsed }) => {
            await logUsage({ appId, minutesUsed, source: "manual" });
          }}
          onSubmitted={dismiss}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetCard: {
    borderWidth: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 26,
    gap: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 54,
    height: 6,
    borderRadius: 999,
    alignSelf: "center",
  },
});

