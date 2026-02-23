import { StyleSheet } from "react-native";

import { type ThemeTokens } from "@/hooks/use-theme";

export const profileStyles = StyleSheet.create({
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
  avatarRow: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  avatarEmoji: {
    fontSize: 56,
  },
  avatarLevel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  avatarTitle: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
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
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  controlValue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  chartGrid: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    minHeight: 100,
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  chartItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  chartTrack: {
    width: "100%",
    maxWidth: 26,
    height: 80,
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBar: {
    width: "100%",
    borderRadius: 8,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 12,
  },
  footerBadges: {
    fontSize: 13,
    fontWeight: "600",
  },
  settingsButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    justifyContent: "center",
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  achievementsList: {
    gap: 8,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  achievementItemLocked: {
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
    gap: 2,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  achievementDesc: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  achievementVerMas: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
  },
  achievementVerMasText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export const createProfileThemedStyles = (
  colors: ThemeTokens["colors"],
  radius: ThemeTokens["radius"],
  shadow: ThemeTokens["shadow"],
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    statCard: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderRadius: radius.md,
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
    settingsButton: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
    },
    settingsButtonText: {
      color: colors.text,
    },
    progressTrack: {
      backgroundColor: colors.progressTrack,
    },
    chartBarPrimary: {
      backgroundColor: colors.primary,
    },
    chartBarSuccess: {
      backgroundColor: colors.success,
    },
    chartBarError: {
      backgroundColor: colors.error,
    },
    chartBarMuted: {
      backgroundColor: colors.progressTrack,
    },
    achievementItem: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
    },
    achievementVerMas: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceElevated,
    },
  });

export type ProfileThemedStyles = ReturnType<typeof createProfileThemedStyles>;
