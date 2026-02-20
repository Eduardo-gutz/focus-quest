import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { AddAppPayload } from "@/hooks/use-apps";
import {
  APP_GOAL_MAX_MINUTES,
  APP_GOAL_MIN_MINUTES,
  APP_NAME_MAX_LENGTH,
} from "@/services/appService";

const GOAL_PRESETS = [15, 30, 45, 60];
const parseGoal = (value: string): number => Number.parseInt(value.trim(), 10);

interface AddSectionProps {
  activeAppsCount: number;
  maxActiveApps: number;
  isMutating: boolean;
  placeholderTextColor: string;
  primaryTextColor: string;
  themedStyles: ThemedStyles;
  onAddApp: (payload: AddAppPayload) => Promise<void>;
}

export function AddSection({
  activeAppsCount,
  maxActiveApps,
  isMutating,
  placeholderTextColor,
  primaryTextColor,
  themedStyles,
  onAddApp,
}: AddSectionProps) {
  const [nameInput, setNameInput] = useState("");
  const [emojiInput, setEmojiInput] = useState("");
  const [goalInput, setGoalInput] = useState("30");

  const canAddMoreApps = activeAppsCount < maxActiveApps;

  const handleAddApp = async () => {
    const parsedGoal = parseGoal(goalInput);
    if (!Number.isInteger(parsedGoal)) {
      Alert.alert("Tiempo inválido", "Ingresa el tiempo máximo diario en minutos.");
      return;
    }

    try {
      await onAddApp({
        name: nameInput,
        iconEmoji: emojiInput.trim() || null,
        dailyGoalMinutes: parsedGoal,
      });
      setNameInput("");
      setEmojiInput("");
      setGoalInput("30");
    } catch (appError) {
      const message =
        appError instanceof Error
          ? appError.message
          : "No se pudo agregar la app";
      Alert.alert("No se pudo guardar", message);
    }
  };

  return (
    <ThemedView style={[appsStyles.addCard, themedStyles.addCard]}>
      <View style={appsStyles.sectionTitleRow}>
        <ThemedText type="label">Agregar nueva app</ThemedText>
        <ThemedText style={[appsStyles.helperText, themedStyles.textMuted]}>
          Puedes tener hasta {maxActiveApps} apps activas
        </ThemedText>
      </View>

      <View style={appsStyles.formRow}>
        <TextInput
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="Nombre (ej. TikTok)"
          maxLength={APP_NAME_MAX_LENGTH}
          style={[appsStyles.input, appsStyles.flexInput, themedStyles.input]}
          placeholderTextColor={placeholderTextColor}
        />
        <TextInput
          value={emojiInput}
          onChangeText={setEmojiInput}
          placeholder="😎"
          style={[appsStyles.input, appsStyles.emojiInput, themedStyles.input]}
          placeholderTextColor={placeholderTextColor}
        />
      </View>

      <TextInput
        value={goalInput}
        onChangeText={setGoalInput}
        keyboardType="number-pad"
        placeholder={`Tiempo máximo que usarás la app por día (${APP_GOAL_MIN_MINUTES}-${APP_GOAL_MAX_MINUTES} min)`}
        style={[appsStyles.input, themedStyles.input]}
        placeholderTextColor={placeholderTextColor}
      />

      <View style={appsStyles.presetWrap}>
        {GOAL_PRESETS.map((preset) => {
          const isSelected = Number(goalInput) === preset;

          return (
            <Pressable
              key={preset}
              onPress={() => setGoalInput(String(preset))}
              style={({ pressed }) => [
                appsStyles.presetChip,
                themedStyles.presetChip,
                isSelected
                  ? themedStyles.presetChipSelected
                  : themedStyles.presetChipDefault,
                pressed ? appsStyles.opacityPressed85 : null,
              ]}
            >
              <ThemedText
                style={
                  isSelected
                    ? themedStyles.presetChipTextSelected
                    : themedStyles.presetChipTextDefault
                }
              >
                {preset} min/día
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => void handleAddApp()}
        disabled={isMutating || !canAddMoreApps}
        style={({ pressed }) => [
          appsStyles.primaryButton,
          themedStyles.primaryButton,
          isMutating || !canAddMoreApps
            ? themedStyles.primaryButtonDisabled
            : themedStyles.primaryButtonEnabled,
          pressed ? appsStyles.opacityPressed90 : null,
        ]}
      >
        {isMutating ? (
          <ActivityIndicator color={primaryTextColor} />
        ) : (
          <ThemedText
            style={[appsStyles.primaryButtonText, themedStyles.textOnPrimary]}
          >
            Agregar app
          </ThemedText>
        )}
      </Pressable>

      {!canAddMoreApps ? (
        <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
          Ya alcanzaste el límite de {maxActiveApps} apps activas.
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}
