import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  AppDetailHeader,
  AppDetailHistorySection,
  AppDetailStatsSection,
  AppDetailTodaySection,
  appsStyles,
  createThemedStyles,
} from "@/components/screens/Apps";
import { ThemedText } from "@/components/themed-text";
import { useAppDetail } from "@/hooks/use-app-detail";
import { useTheme } from "@/hooks/use-theme";

export default function AppDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const appId = Number.parseInt(params.id ?? "", 10);
  const { colors, radius, shadow, spacing } = useTheme();
  const themedStyles = useMemo(
    () => createThemedStyles(colors, radius, shadow, spacing),
    [colors, radius, shadow, spacing],
  );
  const {
    app,
    todayUsedMinutes,
    historyDays,
    stats,
    historyError,
    updateDailyGoal,
  } = useAppDetail(appId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Detalle de app",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
      },
    });
  }, [colors.background, colors.text, navigation]);

  if (!Number.isInteger(appId)) {
    return (
      <View style={[appsStyles.container, themedStyles.container, appsStyles.emptyStateContainer]}>
        <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
          El identificador de la app no es válido.
        </ThemedText>
      </View>
    );
  }

  if (!app) {
    return (
      <View style={[appsStyles.container, themedStyles.container, appsStyles.emptyStateContainer]}>
        <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
          No encontramos esta app.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[appsStyles.container, themedStyles.container]}>
      <ScrollView
        contentContainerStyle={appsStyles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppDetailHeader
          name={app.name}
          iconEmoji={app.iconEmoji}
          dailyGoalMinutes={app.dailyGoalMinutes}
          themedStyles={themedStyles}
          onSaveDailyGoal={updateDailyGoal}
        />

        <AppDetailTodaySection
          usedMinutes={todayUsedMinutes}
          dailyGoalMinutes={app.dailyGoalMinutes}
          themedStyles={themedStyles}
        />

        <Pressable
          onPress={() => {
            router.push({
              pathname: "/log-usage",
              params: { appId: String(app.id) },
            });
          }}
          style={({ pressed }) => [
            appsStyles.primaryButton,
            appsStyles.fullWidthButton,
            themedStyles.primaryButton,
            themedStyles.primaryButtonEnabled,
            pressed ? appsStyles.opacityPressed90 : null,
          ]}
        >
          <ThemedText style={[appsStyles.primaryButtonText, themedStyles.textOnPrimary]}>
            Registrar uso de hoy
          </ThemedText>
        </Pressable>

        <AppDetailHistorySection historyDays={historyDays} themedStyles={themedStyles} />
        <AppDetailStatsSection stats={stats} themedStyles={themedStyles} />

        {historyError ? (
          <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
            {historyError}
          </ThemedText>
        ) : null}
      </ScrollView>
    </View>
  );
}
