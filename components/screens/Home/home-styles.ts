import { StyleSheet } from "react-native";

import { type ThemeTokens } from "@/hooks/use-theme";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  // Header
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  headerGreeting: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    flex: 1,
    letterSpacing: -0.3,
  },
  headerLevelBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerLevelBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  // Ring / progress card
  ringCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 230,
    gap: 0,
  },
  ringLabelPrimary: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -1,
  },
  ringLabelSecondary: {
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  ringCardFooter: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingTop: 4,
  },
  ringFooterItem: {
    alignItems: "center",
    gap: 1,
  },
  ringFooterValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  ringFooterLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
  },
  statAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  // XP bar
  xpTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  xpTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 999,
  },
  xpLevelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  xpLevelLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Today apps list
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  appsList: {
    gap: 8,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  appEmojiWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  appEmojiText: {
    fontSize: 18,
  },
  appInfo: {
    flex: 1,
    gap: 3,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  appMinutes: {
    fontSize: 12,
    fontWeight: "500",
  },
  appProgressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  appProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  appStatus: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyAppsWrap: {
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
  },
  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "700",
  },
  // Error
  errorCard: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
  },
  opacityPressed85: {
    opacity: 0.85,
  },
});

export function createHomeThemedStyles(
  colors: ThemeTokens["colors"],
  radius: ThemeTokens["radius"],
  shadow: ThemeTokens["shadow"],
) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    headerLevelBadge: {
      borderColor: `${colors.primary}50`,
      backgroundColor: `${colors.primary}18`,
      borderRadius: radius.pill,
    },
    mutedText: {
      color: colors.textMuted,
    },
    secondaryText: {
      color: colors.textSecondary,
    },
    primaryText: {
      color: colors.primary,
    },
    accentText: {
      color: colors.accent,
    },
    successText: {
      color: colors.success,
    },
    errorText: {
      color: colors.error,
    },
    statCard: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    statAccentBarStreak: {
      backgroundColor: colors.primary,
    },
    statAccentBarLevel: {
      backgroundColor: colors.accent,
    },
    statAccentBarXp: {
      backgroundColor: colors.success,
    },
    xpTrack: {
      backgroundColor: colors.progressTrack,
    },
    xpFill: {
      backgroundColor: colors.primary,
    },
    appRow: {
      borderColor: colors.border,
      borderLeftColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
    },
    appRowActive: {
      borderLeftColor: colors.primary,
    },
    appRowGoalMet: {
      borderLeftColor: colors.success,
    },
    appRowOverGoal: {
      borderLeftColor: colors.error,
    },
    appEmojiWrap: {
      backgroundColor: `${colors.primary}15`,
    },
    appProgressTrack: {
      backgroundColor: colors.progressTrack,
    },
    appProgressFillGood: {
      backgroundColor: colors.success,
    },
    appProgressFillWarn: {
      backgroundColor: colors.warning,
    },
    appProgressFillBad: {
      backgroundColor: colors.error,
    },
    appProgressFillPrimary: {
      backgroundColor: colors.primary,
    },
    emptyAppsWrap: {
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
    },
    fab: {
      backgroundColor: colors.primary,
      ...shadow.card,
    },
    fabText: {
      color: colors.onPrimary,
    },
    errorCard: {
      borderColor: colors.error,
      borderRadius: radius.md,
      backgroundColor: `${colors.error}12`,
    },
  });
}

export type HomeThemedStyles = ReturnType<typeof createHomeThemedStyles>;
