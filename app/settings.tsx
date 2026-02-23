import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Alert,
  ScrollView,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SettingsThemeSelector,
  SettingsTimePickerRow,
  SettingsToggleRow,
} from "@/components/screens/Settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import { useSettingsStore } from "@/stores/settings-store";
import { useTheme } from "@/hooks/use-theme";
import { resetAllData } from "@/services/resetService";
import { Spacing } from "@/constants/theme";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const DEV_NAME = "FocusQuest";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const theme = useSettingsStore((state) => state.theme);
  const dailyReminderEnabled = useSettingsStore(
    (state) => state.notifications.dailyReminderEnabled,
  );
  const reminderTime = useSettingsStore((state) => state.reminderTime);

  const setTheme = useSettingsStore((state) => state.setTheme);
  const setNotifications = useSettingsStore((state) => state.setNotifications);
  const setReminderTime = useSettingsStore((state) => state.setReminderTime);

  const handleReset = useCallback(() => {
    Alert.alert(
      "Resetear datos",
      "¿Estás seguro? Se borrarán todas las apps, historial, logros y progreso. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmar reset",
              "Última confirmación: ¿deseas borrar todos tus datos?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sí, resetear todo",
                  style: "destructive",
                  onPress: async () => {
                    await resetAllData();
                    router.back();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.md,
          gap: Spacing.lg,
          paddingBottom: Spacing.xxl,
        }}
      >
        <Card>
          <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: Spacing.sm, color: colors.textMuted }}
          >
            Notificaciones
          </ThemedText>
          <SettingsToggleRow
            label="Recordatorio diario"
            value={dailyReminderEnabled}
            onValueChange={(v) => setNotifications({ dailyReminderEnabled: v })}
          />
          {dailyReminderEnabled && (
            <SettingsTimePickerRow
              label="Hora del recordatorio"
              value={reminderTime}
              onChange={(h, m) => setReminderTime(h, m)}
            />
          )}
        </Card>

        <Card>
          <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: Spacing.sm, color: colors.textMuted }}
          >
            Apariencia
          </ThemedText>
          <SettingsThemeSelector value={theme} onChange={setTheme} />
        </Card>

        <Card>
          <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: Spacing.sm, color: colors.textMuted }}
          >
            Datos
          </ThemedText>
          <Button
            label="Resetear todos los datos"
            variant="primary"
            fullWidth
            onPress={handleReset}
            style={{
              backgroundColor: colors.error,
              borderColor: colors.error,
            }}
          />
        </Card>

        <Card>
          <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: Spacing.sm, color: colors.textMuted }}
          >
            Acerca de
          </ThemedText>
          <View style={{ gap: Spacing.xs }}>
            <ThemedText type="caption" style={{ color: colors.textSecondary }}>
              Versión {APP_VERSION}
            </ThemedText>
            <ThemedText type="caption" style={{ color: colors.textSecondary }}>
              {DEV_NAME}
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
