import { useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { Pressable, View } from "react-native";

import {
  ListSection,
  appsStyles,
  createThemedStyles,
  type ListItem,
} from "@/components/screens/Apps";
import { ThemedText } from "@/components/themed-text";
import { useApps } from "@/hooks/use-apps";
import { useTheme } from "@/hooks/use-theme";

export default function AppsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, radius, shadow, spacing } = useTheme();
  const themedStyles = useMemo(
    () => createThemedStyles(colors, radius, shadow, spacing),
    [colors, radius, shadow, spacing],
  );
  const {
    apps,
    todayLogs,
    isHydrating,
    isMutating,
    error,
    refresh,
    updateApp,
    toggleApp,
    deleteApp,
  } = useApps();

  const usedMinutesByAppId = useMemo(() => {
    const minutesByApp: Record<number, number> = {};
    for (const log of todayLogs) {
      const current = minutesByApp[log.appId] ?? 0;
      minutesByApp[log.appId] = current + log.minutesUsed;
    }
    return minutesByApp;
  }, [todayLogs]);

  const openAddModal = useCallback(() => {
    router.push("/modal");
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Mis Apps",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "700",
      },
    });
  }, [colors.text, colors.background, navigation]);

  return (
    <View style={[appsStyles.container, themedStyles.container]}>
      <ListSection
        apps={apps as ListItem[]}
        usedMinutesByAppId={usedMinutesByAppId}
        isHydrating={isHydrating}
        isMutating={isMutating}
        themedStyles={themedStyles}
        onRefresh={refresh}
        onAddFirstApp={openAddModal}
        listHeaderComponent={
          error ? (
            <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
              {error}
            </ThemedText>
          ) : null
        }
        onUpdateApp={updateApp}
        onToggleApp={toggleApp}
        onDeleteApp={deleteApp}
      />

      <Pressable
        onPress={openAddModal}
        style={({ pressed }) => [
          appsStyles.fab,
          themedStyles.fab,
          pressed && appsStyles.opacityPressed85,
        ]}
      >
        <ThemedText style={[appsStyles.fabIcon, themedStyles.textOnPrimary]}>
          +
        </ThemedText>
      </Pressable>
    </View>
  );
}
