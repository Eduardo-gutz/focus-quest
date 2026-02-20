import { forwardRef, type ReactElement } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { UpdateAppPayload } from "@/hooks/use-apps";

export interface ListItem {
  id: number;
  name: string;
  iconEmoji: string | null;
  dailyGoalMinutes: number;
  isActive: boolean;
}

interface ListSectionProps {
  apps: ListItem[];
  usedMinutesByAppId: Record<number, number>;
  isHydrating: boolean;
  isMutating: boolean;
  themedStyles: ThemedStyles;
  onRefresh: () => Promise<void>;
  onAddFirstApp: () => void;
  listHeaderComponent?: ReactElement;
  onUpdateApp: (appId: number, payload: UpdateAppPayload) => Promise<void>;
  onToggleApp: (appId: number, value: boolean) => Promise<void>;
}

export const ListSection = forwardRef<FlatList<ListItem>, ListSectionProps>(function ListSection({
  apps,
  usedMinutesByAppId,
  isHydrating,
  isMutating,
  themedStyles,
  onRefresh,
  onAddFirstApp,
  listHeaderComponent,
  onUpdateApp,
  onToggleApp,
}, ref) {
  const handleUpdateGoal = async (app: ListItem, nextGoal: number) => {
    try {
      await onUpdateApp(app.id, { dailyGoalMinutes: nextGoal });
    } catch (appError) {
      const message =
        appError instanceof Error
          ? appError.message
          : "No se pudo actualizar el tiempo máximo";
      Alert.alert("No se pudo guardar", message);
    }
  };

  const openEditGoalActions = (app: ListItem) => {
    const presets = [15, 30, 45, 60, app.dailyGoalMinutes];
    const uniquePresets = [...new Set(presets)].sort((a, b) => a - b);
    const buttons = uniquePresets.map((value) => ({
      text: `${value} min/día`,
      onPress: () => {
        void handleUpdateGoal(app, value);
      },
    }));

    Alert.alert(
      `Editar tiempo de ${app.name}`,
      "Selecciona un nuevo tiempo máximo diario:",
      [...buttons, { text: "Cancelar", style: "cancel" }],
    );
  };

  const handleToggleApp = async (appId: number, value: boolean) => {
    try {
      await onToggleApp(appId, value);
    } catch (appError) {
      const message =
        appError instanceof Error
          ? appError.message
          : "No se pudo cambiar el estado";
      Alert.alert("No se pudo actualizar", message);
    }
  };

  const renderRightActions = (app: ListItem) => (
    <View style={appsStyles.swipeActionsContainer}>
      <Pressable
        disabled={isMutating}
        onPress={() => openEditGoalActions(app)}
        style={[appsStyles.swipeActionButton, themedStyles.swipeActionEdit]}>
        <ThemedText style={themedStyles.textOnPrimary}>Editar meta</ThemedText>
      </Pressable>
      <Pressable
        disabled={isMutating || !app.isActive}
        onPress={() => {
          void handleToggleApp(app.id, false);
        }}
        style={[appsStyles.swipeActionButton, themedStyles.swipeActionDeactivate]}>
        <ThemedText style={themedStyles.textOnPrimary}>Desactivar</ThemedText>
      </Pressable>
    </View>
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    const usedMinutes = usedMinutesByAppId[item.id] ?? 0;
    const goalMinutes = item.dailyGoalMinutes;
    const progressRatio = goalMinutes > 0 ? Math.min(usedMinutes / goalMinutes, 1) : 0;
    const progressWidth = `${Math.round(progressRatio * 100)}%` as const;
    const isGoalMet = usedMinutes <= goalMinutes;
    const statusMark = isGoalMet ? "✓" : "✗";
    const usageText = `${usedMinutes} / ${goalMinutes} min`;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <ThemedView style={[appsStyles.appCard, themedStyles.appCard]}>
          <View style={appsStyles.appTopRow}>
            <View style={[appsStyles.appEmojiBubble, themedStyles.appEmojiBubble]}>
              <ThemedText style={appsStyles.emojiText}>{item.iconEmoji || "📱"}</ThemedText>
            </View>
            <View style={appsStyles.appInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={[appsStyles.usageText, themedStyles.textSecondary]}>{usageText}</ThemedText>
            </View>
            <ThemedText
              style={[
                appsStyles.statusMark,
                isGoalMet ? themedStyles.textSuccess : themedStyles.textError,
              ]}>
              {statusMark}
            </ThemedText>
          </View>

          <View style={[appsStyles.progressTrack, themedStyles.progressTrack]}>
            <View
              style={[
                appsStyles.progressFill,
                isGoalMet ? themedStyles.progressFillGood : themedStyles.progressFillOver,
                { width: progressWidth },
              ]}
            />
          </View>
        </ThemedView>
      </Swipeable>
    );
  };

  const listEmptyComponent = (
    <ThemedView style={[appsStyles.emptyCard, themedStyles.emptyCard]}>
      <View style={appsStyles.emptyStateContainer}>
        <ThemedText style={appsStyles.emptyEmoji}>🎯</ThemedText>
        <ThemedText style={appsStyles.emptyTitle}>Aún no tienes apps monitoreadas</ThemedText>
        <ThemedText style={[appsStyles.emptyDescription, themedStyles.textMuted]}>
          Agrega tu primera app y define el tiempo máximo diario.
        </ThemedText>
        <Pressable
          onPress={onAddFirstApp}
          style={[appsStyles.primaryButton, themedStyles.primaryButton, themedStyles.primaryButtonEnabled]}>
          <ThemedText style={[appsStyles.primaryButtonText, themedStyles.textOnPrimary]}>
            Agregar primera app
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );

  return (
    <FlatList
      ref={ref}
      data={apps}
      keyExtractor={(item) => String(item.id)}
      refreshing={isHydrating}
      onRefresh={() => {
        void onRefresh();
      }}
      ListHeaderComponent={listHeaderComponent}
      ListEmptyComponent={listEmptyComponent}
      renderItem={renderItem}
      contentContainerStyle={appsStyles.listContentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
});
