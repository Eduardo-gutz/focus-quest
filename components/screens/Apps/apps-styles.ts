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
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
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
    presetChipTextSelected: {
      color: colors.onPrimary,
    },
    presetChipTextDefault: {
      color: colors.textSecondary,
    },
  });
}

export type ThemedStyles = ReturnType<typeof createThemedStyles>;
