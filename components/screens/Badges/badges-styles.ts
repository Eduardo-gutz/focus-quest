import { StyleSheet } from "react-native";

import { type ThemeTokens } from "@/hooks/use-theme";

export const badgesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  header: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerProgressLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  headerProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  headerProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  grid: {
    gap: 12,
  },
  columnWrapper: {
    gap: 8,
    marginBottom: 8,
  },
  badgeCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeEmoji: {
    fontSize: 36,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.1,
    numberOfLines: 2,
  },
  badgeHint: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  badgeDate: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  newBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    borderRadius: 16,
  },
  modalEmoji: {
    fontSize: 64,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  modalCondition: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  modalXp: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export const createBadgesThemedStyles = (
  colors: ThemeTokens["colors"],
  radius: ThemeTokens["radius"],
  shadow: ThemeTokens["shadow"],
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
    },
    headerProgressTrack: {
      backgroundColor: colors.progressTrack,
    },
    headerProgressFill: {
      backgroundColor: colors.primary,
    },
    badgeCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    badgeCardLocked: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
    },
    badgeName: {
      color: colors.text,
    },
    badgeHint: {
      color: colors.textMuted,
    },
    badgeDate: {
      color: colors.primary,
    },
    newBadge: {
      backgroundColor: colors.accent,
    },
    newBadgeText: {
      color: "#FFFFFF",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
    },
    modalDescription: {
      color: colors.textSecondary,
    },
    modalCondition: {
      color: colors.textMuted,
    },
    modalXp: {
      color: colors.primary,
    },
    modalCloseButton: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderWidth: 1,
    },
    modalCloseButtonText: {
      color: colors.text,
    },
  });

export type BadgesThemedStyles = ReturnType<typeof createBadgesThemedStyles>;
