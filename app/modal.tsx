import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AddSection, createThemedStyles } from "@/components/screens/Apps";
import { useApps } from "@/hooks/use-apps";
import { useTheme } from "@/hooks/use-theme";

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    appId?: string;
    name?: string;
    iconEmoji?: string;
    dailyGoalMinutes?: string;
  }>();
  const { colors, radius, shadow, spacing } = useTheme();
  const themedStyles = useMemo(
    () => createThemedStyles(colors, radius, shadow, spacing),
    [colors, radius, shadow, spacing],
  );
  const { activeAppsCount, maxActiveApps, isMutating, addApp, updateApp } = useApps();
  const isEditMode = params.mode === "edit";
  const editAppId = Number.parseInt(params.appId ?? "", 10);
  const initialGoal = Number.parseInt(params.dailyGoalMinutes ?? "", 10);
  const initialValues = isEditMode
    ? {
        name: params.name ?? "",
        iconEmoji: params.iconEmoji ?? "",
        dailyGoalMinutes: Number.isFinite(initialGoal) ? initialGoal : 30,
      }
    : undefined;

  const dismiss = () => router.back();

  return (
    <View style={styles.overlayRoot}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: `${colors.text}55` }]}
        onPress={dismiss}
      />

      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            ...shadow.card,
          },
        ]}
      >
        <View style={styles.modalHeader}>
          <View
            style={[
              styles.modalPill,
              { backgroundColor: `${colors.primary}22` },
            ]}
          >
            <View
              style={[
                styles.modalPillDot,
                { backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Pressable
            onPress={dismiss}
            style={[
              styles.closeButton,
              { backgroundColor: `${colors.borderStrong}80` },
            ]}
          >
            <View
              style={[
                styles.closeIconBar,
                {
                  backgroundColor: colors.textMuted,
                  transform: [{ rotate: "45deg" }],
                },
              ]}
            />
            <View
              style={[
                styles.closeIconBar,
                {
                  backgroundColor: colors.textMuted,
                  transform: [{ rotate: "-45deg" }],
                },
              ]}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AddSection
            activeAppsCount={activeAppsCount}
            maxActiveApps={maxActiveApps}
            isMutating={isMutating}
            placeholderTextColor={colors.textMuted}
            primaryTextColor={colors.onPrimary}
            themedStyles={themedStyles}
            mode={isEditMode ? "edit" : "create"}
            editAppId={Number.isFinite(editAppId) ? editAppId : undefined}
            initialValues={initialValues}
            onAddApp={addApp}
            onUpdateApp={updateApp}
            onAdded={dismiss}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderWidth: 1,
    width: "100%",
    alignSelf: "center",
    maxHeight: "88%",
    minHeight: 360,
    overflow: "hidden",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  modalPill: {
    width: 52,
    height: 6,
    borderRadius: 999,
    justifyContent: "center",
    overflow: "hidden",
  },
  modalPillDot: {
    width: 24,
    height: 6,
    borderRadius: 999,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIconBar: {
    position: "absolute",
    width: 14,
    height: 2,
    borderRadius: 2,
  },
  modalContent: {
    flex: 1,
    height: "100%",
  },
  modalContentContainer: {
    padding: 14,
    flexGrow: 1,
  },
});
