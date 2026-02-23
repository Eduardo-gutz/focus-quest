import { View, Switch, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

interface SettingsToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingsToggleRow = ({
  label,
  value,
  onValueChange,
}: SettingsToggleRowProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.progressTrack, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : colors.surfaceElevated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});
