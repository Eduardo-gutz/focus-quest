import { useLayoutEffect, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "expo-router";
import type { FlatList } from "react-native";

import {
  AddSection,
  HeroSection,
  ListSection,
  appsStyles,
  createThemedStyles,
  type ListItem,
} from "@/components/screens/Apps";
import { ThemedText } from "@/components/themed-text";
import { useApps } from "@/hooks/use-apps";
import { useTheme } from "@/hooks/use-theme";

export default function AppsScreen() {
  const navigation = useNavigation();
  const listRef = useRef<FlatList<ListItem>>(null);
  const { colors, radius, shadow, spacing } = useTheme();
  const themedStyles = useMemo(
    () => createThemedStyles(colors, radius, shadow, spacing),
    [colors, radius, shadow, spacing],
  );
  const {
    apps,
    todayLogs,
    activeAppsCount,
    maxActiveApps,
    isHydrating,
    isMutating,
    error,
    refresh,
    addApp,
    updateApp,
    toggleApp,
  } = useApps();
  const activeStatusText = useMemo(
    () => `${activeAppsCount}/${maxActiveApps} apps activas`,
    [activeAppsCount, maxActiveApps],
  );
  const usedMinutesByAppId = useMemo(() => {
    const minutesByApp: Record<number, number> = {};
    for (const log of todayLogs) {
      const current = minutesByApp[log.appId] ?? 0;
      minutesByApp[log.appId] = current + log.minutesUsed;
    }
    return minutesByApp;
  }, [todayLogs]);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Mis Apps",
      headerRight: () => (
        <Pressable
          onPress={scrollToTop}
          style={({ pressed }) => [
            {
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: "700", fontSize: 18 }}>+</ThemedText>
        </Pressable>
      ),
    });
  }, [colors.onPrimary, colors.primary, navigation]);

  return (
    <View style={[appsStyles.container, themedStyles.container]}>
      <ListSection
        ref={listRef}
        apps={apps as ListItem[]}
        usedMinutesByAppId={usedMinutesByAppId}
        isHydrating={isHydrating}
        isMutating={isMutating}
        themedStyles={themedStyles}
        onRefresh={refresh}
        onAddFirstApp={scrollToTop}
        listHeaderComponent={
          <>
            <HeroSection
              activeAppsCount={activeAppsCount}
              maxActiveApps={maxActiveApps}
              activeStatusText={activeStatusText}
              themedStyles={themedStyles}
            />

            <AddSection
              activeAppsCount={activeAppsCount}
              maxActiveApps={maxActiveApps}
              isMutating={isMutating}
              placeholderTextColor={colors.textMuted}
              primaryTextColor={colors.onPrimary}
              themedStyles={themedStyles}
              onAddApp={addApp}
            />

            {error ? (
              <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
                {error}
              </ThemedText>
            ) : null}
          </>
        }
        onUpdateApp={updateApp}
        onToggleApp={toggleApp}
      />
    </View>
  );
}
