import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from "react-native";

import { appsStyles, type ThemedStyles } from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { calculateUsageXpPreview, USAGE_MAX_MINUTES, USAGE_MIN_MINUTES } from "@/services/usageService";

interface LogUsageAppItem {
  id: number;
  name: string;
  iconEmoji: string | null;
  dailyGoalMinutes: number;
  isActive: boolean;
}

interface LogUsageSectionProps {
  apps: LogUsageAppItem[];
  todayLogsCount: number;
  existingLogAppIds: number[];
  isMutating: boolean;
  placeholderTextColor: string;
  primaryTextColor: string;
  themedStyles: ThemedStyles;
  initialAppId?: number;
  onSubmit: (payload: { appId: number; minutesUsed: number }) => Promise<void>;
  onSubmitted?: () => void;
}

const parseMinutes = (value: string): number => Number.parseInt(value.trim(), 10);

export const LogUsageSection = ({
  apps,
  todayLogsCount,
  existingLogAppIds,
  isMutating,
  placeholderTextColor,
  primaryTextColor,
  themedStyles,
  initialAppId,
  onSubmit,
  onSubmitted,
}: LogUsageSectionProps) => {
  const fallbackAppId = apps[0]?.id;
  const [selectedAppId, setSelectedAppId] = useState<number | undefined>(initialAppId ?? fallbackAppId);
  const [minutesInput, setMinutesInput] = useState("");

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === selectedAppId) ?? apps[0],
    [apps, selectedAppId],
  );
  const parsedMinutes = parseMinutes(minutesInput);
  const isMinutesValid = Number.isInteger(parsedMinutes)
    && parsedMinutes >= USAGE_MIN_MINUTES
    && parsedMinutes <= USAGE_MAX_MINUTES;
  const hasAppSelected = Boolean(selectedApp);
  const isGoalMet = isMinutesValid && Boolean(selectedApp) && parsedMinutes <= selectedApp.dailyGoalMinutes;
  const isUpdatePreview = Boolean(selectedApp) && existingLogAppIds.includes(selectedApp.id);
  const xpPreview = selectedApp && isMinutesValid
    ? calculateUsageXpPreview({
      minutesUsed: parsedMinutes,
      dailyGoalMinutes: selectedApp.dailyGoalMinutes,
      isFirstLogOfDay: todayLogsCount === 0,
      isUpdate: isUpdatePreview,
    })
    : 0;

  const canSubmit = hasAppSelected && isMinutesValid && !isMutating;

  const handleRegister = async () => {
    if (!selectedApp) {
      Alert.alert("Selecciona una app", "Debes seleccionar una app activa para registrar uso.");
      return;
    }

    if (!isMinutesValid) {
      Alert.alert(
        "Minutos inválidos",
        `Ingresa minutos entre ${USAGE_MIN_MINUTES} y ${USAGE_MAX_MINUTES}.`,
      );
      return;
    }

    try {
      await onSubmit({
        appId: selectedApp.id,
        minutesUsed: parsedMinutes,
      });
      onSubmitted?.();
    } catch (usageError) {
      const message = usageError instanceof Error ? usageError.message : "No se pudo registrar el uso.";
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={appsStyles.formContainer}>
      <View style={appsStyles.sectionTitleRow}>
        <ThemedText type="label">Registrar uso</ThemedText>
        <ThemedText style={[appsStyles.helperText, themedStyles.textMuted]}>
          Selecciona app y minutos de hoy.
        </ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={appsStyles.appChipsRow}>
        {apps.map((app) => {
          const isSelected = app.id === selectedApp?.id;
          return (
            <Pressable
              key={app.id}
              onPress={() => setSelectedAppId(app.id)}
              style={[
                appsStyles.appChip,
                isSelected ? themedStyles.appChipSelected : themedStyles.appChipDefault,
              ]}
            >
              <ThemedText>{app.iconEmoji ?? "📱"}</ThemedText>
              <ThemedText style={isSelected ? themedStyles.textPrimary : themedStyles.textSecondary}>
                {app.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <TextInput
        value={minutesInput}
        onChangeText={setMinutesInput}
        keyboardType="number-pad"
        placeholder="0"
        maxLength={3}
        style={[appsStyles.input, appsStyles.minutesInputLarge, themedStyles.input]}
        placeholderTextColor={placeholderTextColor}
      />

      <View
        style={[
          appsStyles.statusPreviewCard,
          !isMinutesValid
            ? themedStyles.statusCardNeutral
            : isGoalMet
              ? themedStyles.statusCardGood
              : themedStyles.statusCardBad,
        ]}
      >
        <ThemedText
          style={
            !isMinutesValid
              ? themedStyles.textMuted
              : isGoalMet
                ? themedStyles.textSuccess
                : themedStyles.textError
          }
        >
          {!isMinutesValid ? "Ingresa minutos para ver estado" : isGoalMet ? "Meta cumplida" : "Meta superada"}
        </ThemedText>
        <ThemedText type="defaultSemiBold">
          Ganarás +{xpPreview} XP
        </ThemedText>
      </View>

      <Pressable
        onPress={() => void handleRegister()}
        disabled={!canSubmit}
        style={({ pressed }) => [
          appsStyles.primaryButton,
          appsStyles.fullWidthButton,
          themedStyles.primaryButton,
          !canSubmit
            ? themedStyles.primaryButtonDisabled
            : isGoalMet
              ? themedStyles.primaryButtonSuccessEnabled
              : themedStyles.primaryButtonDangerEnabled,
          pressed ? appsStyles.opacityPressed90 : null,
        ]}
      >
        {isMutating ? (
          <ActivityIndicator color={primaryTextColor} />
        ) : (
          <ThemedText style={[appsStyles.primaryButtonText, themedStyles.textOnPrimary]}>
            Registrar
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
};

