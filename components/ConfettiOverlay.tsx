import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 28;
const COLORS = ['#F97316', '#E879F9', '#22C55E', '#FBBF24', '#FFFFFF'];
const DURATION = 2500;
const FALL_DISTANCE = 500;

/** Partículas de confetti animadas con reanimated. Colores: primary, accent, success. */
export function ConfettiOverlay() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: DURATION });
  }, [progress]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <ConfettiParticle
          key={i}
          index={i}
          progress={progress}
          color={COLORS[i % COLORS.length]}
        />
      ))}
    </View>
  );
}

interface ConfettiParticleProps {
  index: number;
  progress: SharedValue<number>;
  color: string;
}

function ConfettiParticle({ index, progress, color }: ConfettiParticleProps) {
  const { width } = Dimensions.get('window');
  const startX = ((index * 37 + 13) % 100) * (width / 100) - 8;
  const delayStart = (index % 5) * 0.08;
  const fallExtra = (index % 3) * 80;
  const baseRotation = (index % 4) * 15;
  const spinRotation = (index % 7) * 45;

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const fallProgress = p <= delayStart ? 0 : (p - delayStart) / (1 - delayStart);
    return {
      transform: [
        { translateY: fallProgress * (FALL_DISTANCE + fallExtra) },
        { rotate: `${baseRotation + fallProgress * spinRotation}deg` },
      ],
      opacity: interpolate(p, [0, 0.15, 0.75, 0.92, 1], [0, 1, 1, 1, 0]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: -20,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
