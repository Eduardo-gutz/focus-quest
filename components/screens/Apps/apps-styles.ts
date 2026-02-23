import { StyleSheet } from "react-native";

import { type ThemeTokens } from "@/hooks/use-theme";

export const appsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },

  appCard: {
    gap: 10,
    borderWidth: 1,
    padding: 14,
  },
  appTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  appEmojiBubble: {
    alignItems: "center",
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  emojiText: {
    fontSize: 20,
  },
  appInfo: {
    flex: 1,
    gap: 2,
  },
  usageText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusMark: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
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
  appQuickAction: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: -2,
  },
  appQuickActionText: {
    fontSize: 12,
    fontWeight: "700",
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
    minWidth: 68,
    paddingHorizontal: 12,
  },

  emptyStateContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  fabGroup: {
    position: "absolute",
    bottom: 28,
    right: 20,
    alignItems: "flex-end",
    gap: 10,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },

  formContainer: {
    gap: 14,
  },
  sectionTitleRow: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 4,
  },
  helperText: {
    fontSize: 12,
  },
  formRow: {
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
  goalSliderWrap: {
    gap: 6,
  },
  goalSliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalSlider: {
    width: "100%",
    height: 36,
  },
  presetWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
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
  fullWidthButton: {
    width: "100%",
  },
  appChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  appChip: {
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  minutesInputLarge: {
    minHeight: 72,
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  statusPreviewCard: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeaderBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionSeparator: {
    height: 1,
    marginVertical: 8,
  },
  inactiveCard: {
    opacity: 0.6,
  },

  errorText: {
    fontSize: 13,
  },
  opacityPressed85: {
    opacity: 0.85,
  },
  opacityPressed90: {
    opacity: 0.9,
  },

  detailScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  detailCard: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  detailHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailEmojiWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  detailEmojiText: {
    fontSize: 32,
  },
  detailHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  detailMetaText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailGoalEditor: {
    gap: 8,
  },
  detailGoalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailGoalInput: {
    width: 90,
    textAlign: "center",
    fontWeight: "700",
  },
  detailGoalEditorActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailTodayText: {
    fontSize: 15,
    fontWeight: "700",
  },
  detailProgressTrackLarge: {
    borderRadius: 999,
    height: 14,
    overflow: "hidden",
    width: "100%",
  },
  detailProgressFillLarge: {
    height: "100%",
  },
  detailHistoryGrid: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 140,
  },
  detailHistoryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  detailHistoryTrack: {
    width: "100%",
    maxWidth: 22,
    height: 94,
    borderRadius: 999,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  detailHistoryBar: {
    width: "100%",
    borderRadius: 999,
  },
  detailHistoryStatus: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
    minHeight: 16,
  },
  detailHistoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailStatsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  detailStatCard: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 2,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  detailStatLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});

export function createThemedStyles(
  colors: ThemeTokens["colors"],
  radius: ThemeTokens["radius"],
  shadow: ThemeTokens["shadow"],
  _spacing: ThemeTokens["spacing"],
) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
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
    input: {
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      color: colors.text,
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
    fab: {
      backgroundColor: colors.primary,
      ...shadow.card,
    },
    fabSecondary: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.borderStrong,
      ...shadow.card,
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
    progressFillGreen: {
      backgroundColor: colors.success,
    },
    progressFillYellow: {
      backgroundColor: colors.warning,
    },
    progressFillOrange: {
      backgroundColor: "#F59E0B",
    },
    progressFillRed: {
      backgroundColor: colors.error,
    },
    sectionSeparator: {
      backgroundColor: colors.border,
    },
    swipeActionEdit: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },
    swipeActionDeactivate: {
      backgroundColor: colors.error,
      borderRadius: radius.md,
    },
    swipeActionReactivate: {
      backgroundColor: colors.success,
      borderRadius: radius.md,
    },
    appQuickAction: {
      borderColor: colors.success,
      borderRadius: radius.pill,
      backgroundColor: `${colors.success}18`,
    },
    presetChipTextSelected: {
      color: colors.onPrimary,
    },
    presetChipTextDefault: {
      color: colors.textSecondary,
    },
    appChipDefault: {
      borderColor: colors.borderStrong,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceElevated,
    },
    appChipSelected: {
      borderColor: colors.primary,
      borderRadius: radius.pill,
      backgroundColor: `${colors.primary}22`,
    },
    statusCardGood: {
      borderColor: colors.success,
      borderRadius: radius.md,
      backgroundColor: `${colors.success}15`,
    },
    statusCardBad: {
      borderColor: colors.error,
      borderRadius: radius.md,
      backgroundColor: `${colors.error}15`,
    },
    statusCardNeutral: {
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
    },
    primaryButtonDangerEnabled: {
      backgroundColor: colors.error,
    },
    primaryButtonSuccessEnabled: {
      backgroundColor: colors.success,
    },
  });
}

export type ThemedStyles = ReturnType<typeof createThemedStyles>;
