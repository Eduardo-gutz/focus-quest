import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import {
  OTHER_APP_ID,
  OTHER_APP_OPTION,
  PREDEFINED_APPS,
  type PredefinedApp,
} from "@/constants/apps";
import { useTheme } from "@/hooks/use-theme";

export interface SelectedApp {
  app: PredefinedApp;
  customName?: string;
}

interface OnboardingAppGridProps {
  selectedApps: SelectedApp[];
  onSelectionChange: (apps: SelectedApp[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingAppGrid({
  selectedApps,
  onSelectionChange,
  onNext,
  onBack,
}: OnboardingAppGridProps) {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, typography } = useTheme();
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [otherAppName, setOtherAppName] = useState("");

  const isSelected = useCallback(
    (app: PredefinedApp) =>
      selectedApps.some(
        (s) => s.app.id === app.id && (app.id !== OTHER_APP_ID || s.customName === undefined),
      ),
    [selectedApps],
  );

  const toggleApp = useCallback(
    (app: PredefinedApp) => {
      if (app.id === OTHER_APP_ID) {
        setShowOtherModal(true);
        return;
      }
      const selected = isSelected(app);
      if (selected) {
        onSelectionChange(selectedApps.filter((s) => s.app.id !== app.id));
      } else {
        onSelectionChange([...selectedApps, { app }]);
      }
    },
    [isSelected, onSelectionChange, selectedApps],
  );

  const addOtherApp = useCallback(() => {
    const name = otherAppName.trim();
    if (!name) {
      Alert.alert("Nombre requerido", "Escribe el nombre de la app.");
      return;
    }
    const alreadyAdded = selectedApps.some(
      (s) => s.app.id === OTHER_APP_ID && s.customName === name,
    );
    if (alreadyAdded) {
      Alert.alert("Ya agregada", "Esta app ya está en tu lista.");
      return;
    }
    onSelectionChange([
      ...selectedApps,
      { app: OTHER_APP_OPTION, customName: name },
    ]);
    setOtherAppName("");
    setShowOtherModal(false);
  }, [otherAppName, onSelectionChange, selectedApps]);

  const removeOtherApp = useCallback(
    (customName: string) => {
      onSelectionChange(
        selectedApps.filter(
          (s) => !(s.app.id === OTHER_APP_ID && s.customName === customName),
        ),
      );
    },
    [onSelectionChange, selectedApps],
  );

  const canProceed = selectedApps.length >= 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <ThemedText type="link">Anterior</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="heading2" style={styles.title}>
          Selecciona tus apps
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Elige al menos una app para monitorear
        </ThemedText>

        <View style={styles.grid}>
          {PREDEFINED_APPS.map((app) => (
            <AppChip
              key={app.id}
              app={app}
              selected={isSelected(app)}
              onPress={() => toggleApp(app)}
              colors={colors}
              radius={radius}
              spacing={spacing}
              typography={typography}
            />
          ))}
          <AppChip
            app={OTHER_APP_OPTION}
            selected={selectedApps.some((s) => s.app.id === OTHER_APP_ID)}
            onPress={() => toggleApp(OTHER_APP_OPTION)}
            colors={colors}
            radius={radius}
            spacing={spacing}
            typography={typography}
          />
        </View>

        {selectedApps.some((s) => s.app.id === OTHER_APP_ID) ? (
          <View style={styles.otherList}>
            {selectedApps
              .filter((s) => s.app.id === OTHER_APP_ID && s.customName)
              .map((s) => (
                <View
                  key={s.customName}
                  style={[
                    styles.otherChip,
                    {
                      backgroundColor: `${colors.primary}22`,
                      borderColor: colors.primary,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                    },
                  ]}
                >
                  <ThemedText style={{ flex: 1 }}>{s.customName}</ThemedText>
                  <Pressable
                    onPress={() => removeOtherApp(s.customName!)}
                    hitSlop={8}
                  >
                    <ThemedText style={{ color: colors.error }}>✕</ThemedText>
                  </Pressable>
                </View>
              ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label="Siguiente"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onPress={onNext}
        />
      </View>

      <Modal
        visible={showOtherModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOtherModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowOtherModal(false)}
        />
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          <ThemedText type="heading4" style={{ marginBottom: spacing.sm }}>
            Nombre de la app
          </ThemedText>
          <TextInput
            value={otherAppName}
            onChangeText={setOtherAppName}
            placeholder="Ej: Reddit, Discord..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: radius.sm,
                color: colors.text,
              },
            ]}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={() => {
                setShowOtherModal(false);
                setOtherAppName("");
              }}
            />
            <Button label="Agregar" variant="primary" onPress={addOtherApp} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AppChip({
  app,
  selected,
  onPress,
  colors,
  radius,
  spacing,
  typography,
}: {
  app: PredefinedApp;
  selected: boolean;
  onPress: () => void;
  colors: Record<string, string>;
  radius: Record<string, number>;
  spacing: Record<string, number>;
  typography: Record<string, object>;
}) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? `${colors.primary}22` : colors.surface,
            borderColor: selected ? colors.primary : colors.border,
            borderRadius: radius.md,
            borderWidth: selected ? 2 : 1,
            padding: spacing.md,
          },
        ]}
      >
        <ThemedText style={styles.chipEmoji}>{app.iconEmoji}</ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[
            typography.label,
            { color: selected ? colors.primary : colors.text },
          ]}
        >
          {app.name}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {},
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    width: "47%",
    minWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chipEmoji: {
    fontSize: 24,
  },
  otherList: {
    marginTop: 16,
    gap: 8,
  },
  otherChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    paddingTop: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    padding: 24,
  },
  input: {
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
