import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { syncUsageFromUsageStats } from "@/services/syncService";
import { useHabitsStore } from "@/stores/habits-store";

export function useForegroundSync(isDatabaseReady: boolean) {
  const hydrateToday = useHabitsStore((s) => s.hydrateToday);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== "android" || !isDatabaseReady) return;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current !== "active" && nextState === "active") {
        void syncUsageFromUsageStats().then(() => hydrateToday());
      }
      appStateRef.current = nextState;
    });

    // Sync también en el mount inicial
    void syncUsageFromUsageStats().then(() => hydrateToday());

    return () => subscription.remove();
  }, [hydrateToday, isDatabaseReady]);
}
