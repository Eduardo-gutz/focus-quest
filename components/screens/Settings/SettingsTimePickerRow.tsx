import { useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { ReminderTime } from "@/stores/settings-store";

interface SettingsTimePickerRowProps {
  label: string;
  value: ReminderTime;
  onChange: (hour: number, minute: number) => void;
}

const formatTime = (hour: number, minute: number): string => {
  const h = hour.toString().padStart(2, "0");
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const SettingsTimePickerRow = ({
  label,
  value,
  onChange,
}: SettingsTimePickerRowProps) => {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  const date = new Date();
  date.setHours(value.hour, value.minute, 0, 0);

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate.getHours(), selectedDate.getMinutes());
    }
  };

  return (
    <View style={styles.row}>
      <ThemedText style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>
      <Pressable
        onPress={() => setShow(true)}
        style={({ pressed }) => [
          styles.valueButton,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderStrong,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <ThemedText style={[styles.valueText, { color: colors.primary }]}>
          {formatTime(value.hour, value.minute)}
        </ThemedText>
      </Pressable>

      {show && Platform.OS === "ios" && (
        <Modal transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShow(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShow(false)} hitSlop={16}>
                  <ThemedText style={[styles.modalButton, { color: colors.primary }]}>
                    Listo
                  </ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour
                display="spinner"
                onChange={handleChange}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour
          display="default"
          onChange={handleChange}
        />
      )}
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
  valueButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  modalButton: {
    fontSize: 17,
    fontWeight: "600",
  },
});
