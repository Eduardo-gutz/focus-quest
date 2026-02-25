import { expoDb } from "@/db/client";
import { useResolvedColorScheme } from "@/hooks/use-resolved-color-scheme";
import { init as initDatabase } from "@/services/database";
import { rescheduleAll } from "@/services/notificationService";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AchievementToastOverlay } from "@/components/AchievementToastOverlay";
import { LevelUpModal } from "@/components/LevelUpModal";
import { PermissionModal } from "@/components/PermissionModal";
import { useSettingsStore } from "@/stores/settings-store";
import { registerUsageSyncTask } from "@/tasks/usage-sync-task";

void SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useResolvedColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useDrizzleStudio(expoDb);

  useEffect(() => {
    const bootDatabase = async () => {
      try {
        await initDatabase();
        setIsDatabaseReady(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown database error";
        setDatabaseError(message);
      }
    };

    bootDatabase();
  }, []);

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    if (isDatabaseReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded, isDatabaseReady]);

  useEffect(() => {
    if (!isDatabaseReady) return;

    const redirect = (data: Record<string, unknown> | undefined) => {
      const screen = data?.screen;
      if (screen === "log-usage") {
        router.push("/log-usage");
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirect(lastResponse.notification.request.content.data as Record<string, unknown> | undefined);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification.request.content.data as Record<string, unknown> | undefined);
    });

    return () => subscription.remove();
  }, [isDatabaseReady]);

  useEffect(() => {
    if (!isDatabaseReady) return;

    const timer = setTimeout(() => {
      void rescheduleAll();
      if (Platform.OS === "android") {
        void registerUsageSyncTask();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isDatabaseReady]);

  const hasCompletedOnboarding = useSettingsStore(
    (s) => s.hasCompletedOnboarding,
  );

  useEffect(() => {
    if (!fontsLoaded || !isDatabaseReady || fontError) return;
    if (hasCompletedOnboarding) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding" as Parameters<typeof router.replace>[0]);
    }
  }, [fontsLoaded, isDatabaseReady, fontError, hasCompletedOnboarding]);

  if (fontError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Font loading failed
        </Text>
        <Text>{fontError.message}</Text>
      </View>
    );
  }

  if (databaseError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Database initialization failed
        </Text>
        <Text>{databaseError}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !isDatabaseReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="app-detail/[id]"
            options={{
              presentation: "card",
              animation: "default",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="log-usage"
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: "card",
              title: "Configuración",
            }}
          />
        </Stack>
        <AchievementToastOverlay />
        <LevelUpModal />
        <PermissionModal />
        </View>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
