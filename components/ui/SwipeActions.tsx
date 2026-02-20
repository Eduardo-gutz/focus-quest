import {
  Pressable,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { appsStyles } from "@/components/screens/Apps/apps-styles";
import { ThemedText } from "@/components/themed-text";

export interface SwipeActionItem {
  id: string;
  label: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

interface SwipeActionsProps {
  actions: SwipeActionItem[];
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function SwipeActions({
  actions,
  containerStyle,
  buttonStyle,
  labelStyle,
}: SwipeActionsProps) {
  return (
    <View style={[appsStyles.swipeActionsContainer, containerStyle]}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          disabled={action.disabled}
          onPress={action.onPress}
          style={[
            appsStyles.swipeActionButton,
            buttonStyle,
            action.buttonStyle,
          ]}
        >
          <ThemedText style={[labelStyle, action.labelStyle]}>
            {action.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
