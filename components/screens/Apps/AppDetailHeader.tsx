import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import {
  APP_GOAL_MAX_MINUTES,
  APP_GOAL_MIN_MINUTES,
} from "@/services/appService";

interface AppDetailHeaderProps {
  name: string;
  iconEmoji: string | null;
  dailyGoalMinutes: number;
  themedStyles: ThemedStyles;
  onSaveDailyGoal: (dailyGoalMinutes: number) => Promise<void>;
}

export function AppDetailHeader({
  name,
  iconEmoji,
  dailyGoalMinutes,
  themedStyles,
  onSaveDailyGoal,
}: AppDetailHeaderProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(dailyGoalMinutes));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftGoal(String(dailyGoalMinutes));
  }, [dailyGoalMinutes]);

  const parsedGoal = useMemo(() => Number.parseInt(draftGoal, 10), [draftGoal]);

  const onCancel = () => {
    setDraftGoal(String(dailyGoalMinutes));
    setError(null);
    setIsEditingGoal(false);
  };

  const onSave = async () => {
    if (!Number.isInteger(parsedGoal)) {
      setError("Ingresa una meta válida.");
      return;
    }

    if (
      parsedGoal < APP_GOAL_MIN_MINUTES ||
      parsedGoal > APP_GOAL_MAX_MINUTES
    ) {
      setError(
        `La meta debe estar entre ${APP_GOAL_MIN_MINUTES} y ${APP_GOAL_MAX_MINUTES} min.`,
      );
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSaveDailyGoal(parsedGoal);
      setIsEditingGoal(false);
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la meta";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[appsStyles.detailCard, themedStyles.appCard]}>
      <View style={appsStyles.detailHeaderTopRow}>
        <View style={[appsStyles.detailEmojiWrap, themedStyles.detailEmojiWrap]}>
          <ThemedText style={appsStyles.detailEmojiText}>
            {iconEmoji || "📱"}
          </ThemedText>
        </View>
        <View style={appsStyles.detailHeaderInfo}>
          <ThemedText type="subtitle">{name}</ThemedText>
          <ThemedText
            style={[appsStyles.detailMetaText, themedStyles.textSecondary]}
          >
            Meta diaria · {dailyGoalMinutes} min
          </ThemedText>
        </View>
      </View>

      {!isEditingGoal ? (
        <Pressable
          onPress={() => setIsEditingGoal(true)}
          style={({ pressed }) => [
            appsStyles.appQuickAction,
            themedStyles.appQuickAction,
            pressed ? appsStyles.opacityPressed90 : null,
          ]}
        >
          <ThemedText
            style={[appsStyles.appQuickActionText, themedStyles.textPrimary]}
          >
            Editar meta
          </ThemedText>
        </Pressable>
      ) : (
        <View style={appsStyles.detailGoalEditor}>
          <View style={appsStyles.detailGoalInputRow}>
            <TextInput
              value={draftGoal}
              onChangeText={setDraftGoal}
              keyboardType="number-pad"
              placeholder="Meta"
              style={[
                appsStyles.input,
                appsStyles.detailGoalInput,
                themedStyles.input,
              ]}
            />
            <ThemedText style={themedStyles.textSecondary}>min</ThemedText>
          </View>
          <View style={appsStyles.detailGoalEditorActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                appsStyles.appQuickAction,
                themedStyles.appChipDefault,
                pressed ? appsStyles.opacityPressed90 : null,
              ]}
              disabled={isSaving}
            >
              <ThemedText
                style={[
                  appsStyles.appQuickActionText,
                  themedStyles.textSecondary,
                ]}
              >
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                void onSave();
              }}
              style={({ pressed }) => [
                appsStyles.appQuickAction,
                themedStyles.appQuickAction,
                isSaving ? appsStyles.opacityPressed85 : null,
                pressed ? appsStyles.opacityPressed90 : null,
              ]}
              disabled={isSaving}
            >
              <ThemedText
                style={[appsStyles.appQuickActionText, themedStyles.textPrimary]}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </ThemedText>
            </Pressable>
          </View>
          {error ? (
            <ThemedText style={[appsStyles.errorText, themedStyles.textError]}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      )}
    </View>
  );
}
