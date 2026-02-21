import { useEffect, useState } from "react";
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
import type { AddAppPayload, UpdateAppPayload } from "@/hooks/use-apps";
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
  mode?: "create" | "edit";
  editAppId?: number;
  initialValues?: {
    name: string;
    iconEmoji?: string | null;
    dailyGoalMinutes: number;
  };
  onAddApp: (payload: AddAppPayload) => Promise<void>;
  onUpdateApp?: (appId: number, payload: UpdateAppPayload) => Promise<void>;
  onAdded?: () => void;
}

export function AddSection({
  activeAppsCount,
  maxActiveApps,
  isMutating,
  placeholderTextColor,
  primaryTextColor,
  themedStyles,
  mode = "create",
  editAppId,
  initialValues,
  onAddApp,
  onUpdateApp,
  onAdded,
}: AddSectionProps) {
  const isEditMode = mode === "edit";
  const [nameInput, setNameInput] = useState(initialValues?.name ?? "");
  const [emojiInput, setEmojiInput] = useState(initialValues?.iconEmoji ?? "");
  const [goalInput, setGoalInput] = useState(
    String(initialValues?.dailyGoalMinutes ?? 30),
  );
  const goalFromInput = parseGoal(goalInput);
  const selectedPresetIndex = Math.max(0, GOAL_PRESETS.indexOf(goalFromInput));
  const selectedPreset = GOAL_PRESETS[selectedPresetIndex];
  const canAddMoreApps = activeAppsCount < maxActiveApps;
  const canSubmit = isEditMode ? true : canAddMoreApps;

  useEffect(() => {
    setNameInput(initialValues?.name ?? "");
    setEmojiInput(initialValues?.iconEmoji ?? "");
    setGoalInput(String(initialValues?.dailyGoalMinutes ?? 30));
  }, [initialValues?.dailyGoalMinutes, initialValues?.iconEmoji, initialValues?.name]);

  const handleSubmit = async () => {
    const parsedGoal = parseGoal(goalInput);
    if (!Number.isInteger(parsedGoal)) {
      Alert.alert(
        "Tiempo inválido",
        "Ingresa el tiempo máximo diario en minutos.",
      );
      return;
    }

    try {
      if (isEditMode) {
        if (!onUpdateApp || !editAppId) {
          Alert.alert("No se pudo guardar", "No se pudo identificar la app a editar.");
          return;
        }

        await onUpdateApp(editAppId, {
          name: nameInput,
          iconEmoji: emojiInput.trim() || null,
          dailyGoalMinutes: parsedGoal,
        });
      } else {
        await onAddApp({
          name: nameInput,
          iconEmoji: emojiInput.trim() || null,
          dailyGoalMinutes: parsedGoal,
        });
        setNameInput("");
        setEmojiInput("");
        setGoalInput("30");
      }
      onAdded?.();
    } catch (appError) {
      const message =
        appError instanceof Error
          ? appError.message
          : isEditMode
            ? "No se pudo editar la app"
            : "No se pudo agregar la app";
      Alert.alert("No se pudo guardar", message);
    }
  };

  return (
    <View style={appsStyles.formContainer}>
      <View style={appsStyles.sectionTitleRow}>
        <ThemedText type="label">
          {isEditMode ? "Editar app" : "Agregar nueva app"}
        </ThemedText>
        <ThemedText style={[appsStyles.helperText, themedStyles.textMuted]}>
          {isEditMode
            ? "Actualiza nombre, emoji y tiempo máximo diario"
            : `Puedes tener hasta ${maxActiveApps} apps activas`}
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
        onPress={() => void handleSubmit()}
        disabled={isMutating || !canSubmit}
        style={({ pressed }) => [
          appsStyles.primaryButton,
          themedStyles.primaryButton,
          isMutating || !canSubmit
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
            {isEditMode ? "Guardar cambios" : "Agregar app"}
          </ThemedText>
        )}
      </Pressable>

      {!canAddMoreApps && !isEditMode ? (
        <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
          Ya alcanzaste el límite de {maxActiveApps} apps activas.
        </ThemedText>
      ) : null}
    </View>
  );
}
