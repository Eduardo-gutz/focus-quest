import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
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
  onAdded?: () => void;
}

export function AddSection({
  activeAppsCount,
  maxActiveApps,
  isMutating,
  placeholderTextColor,
  primaryTextColor,
  themedStyles,
  onAddApp,
  onAdded,
}: AddSectionProps) {
  const [nameInput, setNameInput] = useState("");
  const [emojiInput, setEmojiInput] = useState("");
  const [goalInput, setGoalInput] = useState("30");
  const goalFromInput = parseGoal(goalInput);
  const selectedPresetIndex = Math.max(0, GOAL_PRESETS.indexOf(goalFromInput));
  const selectedPreset = GOAL_PRESETS[selectedPresetIndex];

  const canAddMoreApps = activeAppsCount < maxActiveApps;

  const handleAddApp = async () => {
    const parsedGoal = parseGoal(goalInput);
    if (!Number.isInteger(parsedGoal)) {
      Alert.alert(
        "Tiempo inválido",
        "Ingresa el tiempo máximo diario en minutos.",
      );
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
      onAdded?.();
    } catch (appError) {
      const message =
        appError instanceof Error
          ? appError.message
          : "No se pudo agregar la app";
      Alert.alert("No se pudo guardar", message);
    }
  };

  return (
    <View style={appsStyles.formContainer}>
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
        placeholder={`Tiempo máximo (${APP_GOAL_MIN_MINUTES}-${APP_GOAL_MAX_MINUTES} min)`}
        style={[appsStyles.input, themedStyles.input]}
        placeholderTextColor={placeholderTextColor}
      />

      <View style={appsStyles.goalSliderWrap}>
        <View style={appsStyles.goalSliderHeader}>
          <ThemedText style={[appsStyles.helperText, themedStyles.textMuted]}>
            Preset diario
          </ThemedText>
          <ThemedText
            style={[appsStyles.helperText, themedStyles.textPrimary]}
          >
            {selectedPreset} min/día
          </ThemedText>
        </View>

        <Slider
          style={appsStyles.goalSlider}
          value={selectedPresetIndex}
          minimumValue={0}
          maximumValue={GOAL_PRESETS.length - 1}
          step={1}
          onValueChange={(value) => {
            const preset = GOAL_PRESETS[Math.round(value)] ?? GOAL_PRESETS[0];
            setGoalInput(String(preset));
          }}
        />

        <View style={appsStyles.presetWrap}>
          {GOAL_PRESETS.map((preset, index) => (
            <ThemedText
              key={preset}
              style={
                index === selectedPresetIndex
                  ? themedStyles.presetChipTextSelected
                  : themedStyles.presetChipTextDefault
              }
            >
              {preset}
            </ThemedText>
          ))}
        </View>
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
    </View>
  );
}
