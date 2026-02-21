import { AppListItemCard } from "@/components/screens/Apps/AppListItemCard";
import {
  appsStyles,
  type ThemedStyles,
} from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";
import { SwipeActions } from "@/components/ui/SwipeActions";
import type { UpdateAppPayload } from "@/hooks/use-apps";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { type ReactElement, useMemo, useRef } from "react";
import { Alert, Pressable, SectionList, View } from "react-native";

export interface ListItem {
  id: number;
  name: string;
  iconEmoji: string | null;
  dailyGoalMinutes: number;
  isActive: boolean;
}

interface AppSection {
  key: "active" | "inactive";
  title: string;
  data: ListItem[];
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
  onDeleteApp: (appId: number) => Promise<void>;
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
  onDeleteApp,
}: ListSectionProps) => {
  const router = useRouter();
  const openSwipeableRef = useRef<{
    itemId: number;
    close: () => void;
  } | null>(null);

  const sections = useMemo<AppSection[]>(() => {
    const active = apps.filter((a) => a.isActive);
    const inactive = apps.filter((a) => !a.isActive);

    const result: AppSection[] = [];
    if (active.length > 0) {
      result.push({ key: "active", title: "Activas", data: active });
    }
    if (inactive.length > 0) {
      result.push({ key: "inactive", title: "Inactivas", data: inactive });
    }
    return result;
  }, [apps]);

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

  const openEditAppModal = (app: ListItem) => {
    router.push({
      pathname: "/modal",
      params: {
        mode: "edit",
        appId: String(app.id),
        name: app.name,
        iconEmoji: app.iconEmoji ?? "",
        dailyGoalMinutes: String(app.dailyGoalMinutes),
      },
    });
    closeOpenSwipeable();
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

  const handleDeleteApp = (app: ListItem) => {
    Alert.alert(
      "Eliminar app",
      `¿Estás seguro de que quieres eliminar "${app.name}"? Se borrarán todos sus registros de uso. Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDeleteApp(app.id);
            } catch (appError) {
              const message =
                appError instanceof Error
                  ? appError.message
                  : "No se pudo eliminar la app";
              Alert.alert("Error", message);
            }
          },
        },
      ],
    );
    closeOpenSwipeable();
  };

  const renderActiveRightActions = (app: ListItem) => (
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
          onPress: () => openEditAppModal(app),
          buttonStyle: themedStyles.swipeActionEdit,
        },
        {
          id: `deactivate-${app.id}`,
          label: (
            <Feather
              name="eye-off"
              size={24}
              color={themedStyles.textOnPrimary.color}
            />
          ),
          disabled: isMutating,
          onPress: () => handleToggleApp(app.id, false),
          buttonStyle: themedStyles.swipeActionDeactivate,
        },
      ]}
    />
  );

  const renderInactiveRightActions = (app: ListItem) => (
    <SwipeActions
      actions={[
        {
          id: `reactivate-${app.id}`,
          label: (
            <Feather
              name="check-circle"
              size={24}
              color={themedStyles.textOnPrimary.color}
            />
          ),
          disabled: isMutating,
          onPress: () => handleToggleApp(app.id, true),
          buttonStyle: themedStyles.swipeActionReactivate,
        },
        {
          id: `delete-${app.id}`,
          label: (
            <Feather
              name="trash-2"
              size={24}
              color={themedStyles.textOnPrimary.color}
            />
          ),
          disabled: isMutating,
          onPress: () => handleDeleteApp(app),
          buttonStyle: themedStyles.swipeActionDeactivate,
        },
      ]}
    />
  );

  const renderItem = ({
    item,
    section,
  }: {
    item: ListItem;
    section: AppSection;
  }) => (
    <View style={section.key === "inactive" ? appsStyles.inactiveCard : null}>
      <AppListItemCard
        item={item}
        usedMinutes={usedMinutesByAppId[item.id] ?? 0}
        themedStyles={themedStyles}
        renderRightActions={
          section.key === "active"
            ? renderActiveRightActions
            : renderInactiveRightActions
        }
        onSwipeableWillOpen={handleSwipeableWillOpen}
        onSwipeableClose={handleSwipeableClose}
        onCardPress={handleCardPress}
      />
    </View>
  );

  const renderSectionHeader = ({ section }: { section: AppSection }) => (
    <View style={appsStyles.sectionHeader}>
      <ThemedText
        style={[appsStyles.sectionHeaderTitle, themedStyles.textSecondary]}
      >
        {section.title}
      </ThemedText>
      <ThemedText
        style={[appsStyles.sectionHeaderBadge, themedStyles.textMuted]}
      >
        ({section.data.length})
      </ThemedText>
    </View>
  );

  const renderSectionSeparator = ({
    leadingSection,
  }: {
    leadingSection?: AppSection;
  }) => {
    if (!leadingSection || leadingSection.key !== "active") {
      return null;
    }
    return (
      <View
        style={[appsStyles.sectionSeparator, themedStyles.sectionSeparator]}
      />
    );
  };

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
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      refreshing={isHydrating}
      onRefresh={() => {
        closeOpenSwipeable();
        void onRefresh();
      }}
      ListHeaderComponent={listHeaderComponent}
      ListEmptyComponent={listEmptyComponent}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={renderSectionSeparator}
      contentContainerStyle={appsStyles.listContentContainer}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={closeOpenSwipeable}
      stickySectionHeadersEnabled={false}
    />
  );
};
