import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { syncUsageFromUsageStats } from "@/services/syncService";
import { useGamificationStore } from "@/stores/gamification-store";
import { useHabitsStore } from "@/stores/habits-store";

export function useForegroundSync(isDatabaseReady: boolean) {
  const hydrateToday = useHabitsStore((s) => s.hydrateToday);
  const hydrateGamification = useGamificationStore((s) => s.hydrate);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== "android" || !isDatabaseReady) return;

    const runSyncAndHydrate = async () => {
      await syncUsageFromUsageStats();
      await hydrateToday();
      await hydrateGamification();
    };

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current !== "active" && nextState === "active") {
        void runSyncAndHydrate();
      }
      appStateRef.current = nextState;
    });

    // Sync también en el mount inicial
    void runSyncAndHydrate();

    return () => subscription.remove();
  }, [hydrateToday, hydrateGamification, isDatabaseReady]);
}
