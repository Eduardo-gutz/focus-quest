import { expoDb } from "@/db/client";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { init as initDatabase } from "@/services/database";
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
import { useFonts } from "expo-font";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-reanimated";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
