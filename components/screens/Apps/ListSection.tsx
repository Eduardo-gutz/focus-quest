import { AppListItemCard } from "@/components/screens/Apps/AppListItemCard";
import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { SwipeActions } from "@/components/ui/SwipeActions";
import type { UpdateAppPayload } from "@/hooks/use-apps";
import Feather from "@expo/vector-icons/Feather";
import { type ReactElement, useRef } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";

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
  listHeaderComponent?: ReactElement | null;
  onUpdateApp: (appId: number, payload: UpdateAppPayload) => Promise<void>;
  onToggleApp: (appId: number, value: boolean) => Promise<void>;
}

export const ListSection = ({
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
}: ListSectionProps) => {
  const openSwipeableRef = useRef<{
    itemId: number;
    close: () => void;
  } | null>(null);

  const closeOpenSwipeable = () => {
    if (!openSwipeableRef.current) {
      return;
    }

    openSwipeableRef.current.close();
  };

  const handleSwipeableWillOpen = (
    itemId: number,
    swipeable: { close: () => void } | null,
  ) => {
    if (!swipeable) {
      return;
    }

    if (openSwipeableRef.current?.itemId !== itemId) {
      openSwipeableRef.current?.close();
    }

    openSwipeableRef.current = { itemId, close: () => swipeable.close() };
  };

  const handleSwipeableClose = (itemId: number) => {
    if (openSwipeableRef.current?.itemId === itemId) {
      openSwipeableRef.current = null;
    }
  };

  const handleCardPress = (itemId: number) => {
    if (!openSwipeableRef.current) {
      return;
    }

    if (openSwipeableRef.current.itemId !== itemId) {
      openSwipeableRef.current.close();
      return;
    }

    closeOpenSwipeable();
  };

  const handleUpdateGoal = async (app: ListItem, nextGoal: number) => {
    try {
      await onUpdateApp(app.id, { dailyGoalMinutes: nextGoal });
      closeOpenSwipeable();
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
      onPress: () => handleUpdateGoal(app, value),
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
    <SwipeActions
      actions={[
        {
          id: `edit-goal-${app.id}`,
          label: (
            <Feather
              name="edit-2"
              size={24}
              color={themedStyles.textOnPrimary.color}
            />
          ),
          disabled: isMutating,
          onPress: () => openEditGoalActions(app),
          buttonStyle: themedStyles.swipeActionEdit,
        },
        {
          id: `deactivate-${app.id}`,
          label: (
            <Feather
              name="trash-2"
              size={24}
              color={themedStyles.textOnPrimary.color}
            />
          ),
          disabled: isMutating || !app.isActive,
          onPress: () => handleToggleApp(app.id, false),
          buttonStyle: themedStyles.swipeActionDeactivate,
        },
      ]}
    />
  );

  const renderItem = ({ item }: { item: ListItem }) => (
    <AppListItemCard
      item={item}
      usedMinutes={usedMinutesByAppId[item.id] ?? 0}
      themedStyles={themedStyles}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      onSwipeableClose={handleSwipeableClose}
      onCardPress={handleCardPress}
    />
  );

  const listEmptyComponent = (
    <View style={appsStyles.emptyStateContainer}>
      <ThemedText style={appsStyles.emptyEmoji}>🎯</ThemedText>
      <ThemedText style={appsStyles.emptyTitle}>
        Aún no tienes apps monitoreadas
      </ThemedText>
      <ThemedText style={[appsStyles.emptyDescription, themedStyles.textMuted]}>
        Agrega tu primera app y define el tiempo máximo diario que quieres
        dedicarle.
      </ThemedText>
      <Pressable
        onPress={onAddFirstApp}
        style={[
          appsStyles.primaryButton,
          themedStyles.primaryButton,
          themedStyles.primaryButtonEnabled,
        ]}
      >
        <ThemedText
          style={[appsStyles.primaryButtonText, themedStyles.textOnPrimary]}
        >
          Agregar primera app
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      data={apps}
      keyExtractor={(item) => String(item.id)}
      refreshing={isHydrating}
      onRefresh={() => {
        closeOpenSwipeable();
        void onRefresh();
      }}
      ListHeaderComponent={listHeaderComponent}
      ListEmptyComponent={listEmptyComponent}
      renderItem={renderItem}
      contentContainerStyle={appsStyles.listContentContainer}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={closeOpenSwipeable}
    />
  );
};
