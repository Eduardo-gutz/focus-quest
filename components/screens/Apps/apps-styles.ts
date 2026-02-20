import { StyleSheet } from "react-native";

import { type ThemeTokens } from "@/hooks/use-theme";

export const appsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 16,
    paddingBottom: 48,
  },
  heroCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  heroTitleWrap: {
    flex: 1,
    gap: 4,
  },
  heroSubtitle: {
    fontSize: 13,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  kpiGrid: {
    flexDirection: "row",
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 2,
  },
  kpiLabel: {
    fontSize: 12,
  },
  kpiValueCompact: {
    fontSize: 13,
    fontWeight: "600",
  },
  addCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  listContainer: {
    gap: 12,
  },
  listContentContainer: {
    gap: 12,
    paddingBottom: 48,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  helperText: {
    fontSize: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 8,
  },
  appCard: {
    gap: 12,
    borderWidth: 1,
    padding: 14,
  },
  appTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  appHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  appIdentity: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 10,
  },
  appEmojiBubble: {
    alignItems: "center",
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  emojiText: {
    fontSize: 20,
  },
  toggleWrap: {
    alignItems: "center",
    gap: 6,
  },
  appInfo: {
    flex: 1,
    gap: 3,
  },
  statePill: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  goalEditorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flexInput: {
    flex: 1,
  },
  emojiInput: {
    width: 72,
    textAlign: "center",
  },
  presetWrap: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalInput: {
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  opacityPressed85: {
    opacity: 0.85,
  },
  opacityPressed90: {
    opacity: 0.9,
  },
  emptyCard: {
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  mutedText: {
    fontSize: 13,
  },
  usageText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
  },
  statusMark: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  swipeActionsContainer: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  swipeActionButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    paddingHorizontal: 12,
  },
  emptyStateContainer: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 46,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
  },
});

export function createThemedStyles(
  colors: ThemeTokens["colors"],
  radius: ThemeTokens["radius"],
  shadow: ThemeTokens["shadow"],
  spacing: ThemeTokens["spacing"],
) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing.md,
    },
    heroCard: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    badgePill: {
      backgroundColor: colors.accent,
      borderRadius: radius.pill,
    },
    kpiCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    addCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    appCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    appEmojiBubble: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },
    input: {
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      color: colors.text,
    },
    presetChip: {
      borderRadius: radius.pill,
    },
    presetChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    presetChipDefault: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceElevated,
    },
    primaryButton: {
      borderRadius: radius.md,
    },
    primaryButtonEnabled: {
      backgroundColor: colors.primary,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.borderStrong,
    },
    secondaryButton: {
      borderColor: colors.primary,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}12`,
    },
    statePill: {
      borderRadius: radius.pill,
    },
    statePillActive: {
      color: colors.success,
      backgroundColor: `${colors.success}22`,
    },
    statePillPaused: {
      color: colors.warningForeground,
      backgroundColor: `${colors.warning}40`,
    },
    textMuted: {
      color: colors.textMuted,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textOnPrimary: {
      color: colors.onPrimary,
    },
    textPrimary: {
      color: colors.primary,
    },
    textError: {
      color: colors.error,
    },
    textSuccess: {
      color: colors.success,
    },
    progressTrack: {
      backgroundColor: colors.progressTrack,
    },
    progressFillGood: {
      backgroundColor: colors.success,
    },
    progressFillOver: {
      backgroundColor: colors.error,
    },
    swipeActionEdit: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },
    swipeActionDeactivate: {
      backgroundColor: colors.borderStrong,
      borderRadius: radius.md,
    },
    presetChipTextSelected: {
      color: colors.onPrimary,
    },
    presetChipTextDefault: {
      color: colors.textSecondary,
    },
  });
}

export type ThemedStyles = ReturnType<typeof createThemedStyles>;
