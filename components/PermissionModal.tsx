import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { usePermissionModalStore } from '@/stores/permission-modal-store';
import { useSettingsStore } from '@/stores/settings-store';
import { requestUsageStatsPermission } from 'usage-stats';

export interface PermissionModalProps {
  visible?: boolean;
  onDismiss?: () => void;
  onPermissionRequested?: () => void;
}

export function PermissionModal({
  visible: visibleProp,
  onDismiss: onDismissProp,
  onPermissionRequested,
}: PermissionModalProps = {}) {
  const { colors, radius, shadow, spacing, typography } = useTheme();
  const storeVisible = usePermissionModalStore((s) => s.visible);
  const hidePermissionModal = usePermissionModalStore((s) => s.hide);
  const setPermissionModalShown = useSettingsStore(
    (s) => s.setPermissionModalShown,
  );

  const visible = visibleProp ?? storeVisible;
  const isControlled = visibleProp !== undefined;

  const handleDismiss = () => {
    if (!isControlled) {
      hidePermissionModal();
    }
    setPermissionModalShown(true);
    onDismissProp?.();
  };

  if (Platform.OS !== 'android' || !visible) {
    return null;
  }

  const handleGrantPermission = () => {
    requestUsageStatsPermission();
    onPermissionRequested?.();
    handleDismiss();
  };

  const handleNotNow = () => {
    handleDismiss();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: `${colors.text}55` }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.xl,
            ...shadow.card,
          },
        ]}
      >
        <ThemedText
          style={[
            typography.heading3,
            { color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
          ]}
        >
          Activa el tracking automático
        </ThemedText>
        <ThemedText
          style={[
            typography.body,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: spacing.lg,
            },
          ]}
        >
          Para medir el tiempo de uso de tus apps sin abrir FocusQuest, necesitamos
          el permiso de acceso a estadísticas de uso. Tus datos se mantienen en tu
          dispositivo y no se comparten.
        </ThemedText>
        <View style={styles.buttonsRow}>
          <Button
            label="Dar permiso"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleGrantPermission}
          />
          <Button
            label="Ahora no"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={handleNotNow}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '85%',
    maxWidth: 340,
    borderWidth: 1,
  },
  buttonsRow: {
    gap: 12,
  },
});
