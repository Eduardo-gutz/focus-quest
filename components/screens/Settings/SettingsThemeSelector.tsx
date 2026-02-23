import { View, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing, Radius } from "@/constants/theme";
import type { AppTheme } from "@/stores/settings-store";

interface SettingsThemeSelectorProps {
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
}

const OPTIONS: { value: AppTheme; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export const SettingsThemeSelector = ({
  value,
  onChange,
}: SettingsThemeSelectorProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected
                  ? `${colors.primary}22`
                  : colors.surfaceElevated,
                borderColor: isSelected ? colors.primary : colors.borderStrong,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: isSelected ? colors.primary : colors.textSecondary },
              ]}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
