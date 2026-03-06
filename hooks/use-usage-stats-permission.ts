import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { hasUsageStatsPermission } from "usage-stats";

export function useUsageStatsPermission(): boolean {
  const [hasPermission, setHasPermission] = useState(() =>
    Platform.OS === "android" ? hasUsageStatsPermission() : true,
  );
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appStateRef.current !== "active" && nextState === "active") {
        setHasPermission(hasUsageStatsPermission());
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  return hasPermission;
}
