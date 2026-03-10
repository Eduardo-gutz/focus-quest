import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import {
  homeStyles,
  type HomeThemedStyles,
} from "@/components/screens/Home/home-styles";
import { ThemedText } from "@/components/themed-text";
import { type DashboardTopApp } from "@/hooks/use-dashboard";
import { type ThemeTokens } from "@/hooks/use-theme";

interface DashboardProgressRingProps {
  completionPercentage: number;
  minutesUsed: number;
  minutesGoal: number;
  anyAppOverGoal: boolean;
  overGoalApps: Pick<DashboardTopApp, "id" | "name" | "iconEmoji" | "usedMinutes" | "goalMinutes">[];
  colors: ThemeTokens["colors"];
  themedStyles: HomeThemedStyles;
}

export function DashboardProgressRing({
  completionPercentage,
  minutesUsed,
  minutesGoal,
  anyAppOverGoal,
  overGoalApps,
  colors,
  themedStyles,
}: DashboardProgressRingProps) {
  const completedValue = Math.max(0, Math.min(100, completionPercentage));
  const remainingValue = Math.max(0, 100 - completedValue);
  const hasGoals = minutesGoal > 0;

  const ringFillColor = anyAppOverGoal ? colors.error : colors.primary;
  const ringTrackColor = anyAppOverGoal
    ? colors.error + "30"
    : colors.success + "45";

  const minutesDelta = Math.abs(minutesGoal - minutesUsed);

  return (
    <View style={[homeStyles.card, homeStyles.ringCard, themedStyles.card]}>
      {anyAppOverGoal ? (
        <View
          style={{
            width: "100%",
            backgroundColor: colors.error + "15",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.error + "40",
            paddingVertical: 7,
            paddingHorizontal: 10,
            gap: 4,
            marginBottom: 12,
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.4,
              color: colors.error,
              textTransform: "uppercase",
            }}
          >
            Límite superado
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {overGoalApps.map((app) => (
              <View
                key={app.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: colors.error + "20",
                  borderRadius: 999,
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                }}
              >
                <ThemedText style={{ fontSize: 12 }}>{app.iconEmoji}</ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.error,
                  }}
                >
                  {app.name}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: colors.error + "CC",
                  }}
                >
                  {app.usedMinutes}/{app.goalMinutes} min
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={{ fontSize: 12, color: colors.error }}>
            Aun puedes salvar {minutesDelta} minutos, si no usas otras apps durante el día.
          </ThemedText>
        </View>
      ) : null}
      <PieChart
        data={[
          { value: completedValue || 0.0001, color: ringFillColor },
          { value: remainingValue || 0.0001, color: ringTrackColor },
        ]}
        donut
        radius={92}
        innerRadius={70}
        isAnimated
        animationDuration={650}
        showText={false}
        strokeWidth={0}
        centerLabelComponent={() => {
          const innerDiameter = 70 * 2;
          return (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: innerDiameter,
                height: innerDiameter,
                borderRadius: innerDiameter / 2,
                backgroundColor: colors.surface,
              }}
            >
              <ThemedText
                style={[
                  homeStyles.ringLabelPrimary,
                  anyAppOverGoal ? themedStyles.errorText : null,
                ]}
              >
                {completedValue}%
              </ThemedText>
              <ThemedText
                style={[homeStyles.ringLabelSecondary, themedStyles.mutedText]}
              >
                {hasGoals
                  ? `${minutesUsed} / ${minutesGoal} min`
                  : "Sin apps activas"}
              </ThemedText>
            </View>
          );
        }}
      />

      {hasGoals ? (
        <View style={homeStyles.ringCardFooter}>
          <View style={homeStyles.ringFooterItem}>
            <ThemedText
              style={[
                homeStyles.ringFooterValue,
                anyAppOverGoal ? themedStyles.errorText : themedStyles.successText,
              ]}
            >
              {minutesUsed}
            </ThemedText>
            <ThemedText style={[homeStyles.ringFooterLabel, themedStyles.mutedText]}>
              MINUTOS USADOS
            </ThemedText>
          </View>
          <View style={{ width: 1, height: 28, backgroundColor: colors.border }} />
          <View style={homeStyles.ringFooterItem}>
            <ThemedText
              style={[
                homeStyles.ringFooterValue,
                anyAppOverGoal ? themedStyles.errorText : themedStyles.secondaryText,
              ]}
            >
              {anyAppOverGoal ? `+${minutesDelta}` : minutesDelta}
            </ThemedText>
            <ThemedText style={[homeStyles.ringFooterLabel, themedStyles.mutedText]}>
              {anyAppOverGoal ? "MINUTOS EXCEDIDOS" : "MINUTOS AHORRADOS"}
            </ThemedText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
