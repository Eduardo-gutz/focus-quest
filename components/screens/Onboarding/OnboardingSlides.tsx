import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const SLIDES = [
  {
    emoji: "⏱️",
    title: "Controla tu tiempo",
    description: "Define metas diarias para las apps que más usas y mantén el equilibrio.",
  },
  {
    emoji: "📱",
    title: "Elige tus apps",
    description: "Selecciona las aplicaciones que quieres monitorear y establece límites.",
  },
  {
    emoji: "🏆",
    title: "Cumple metas y sube de nivel",
    description: "Gana XP, desbloquea logros y mantén tu racha de días enfocado.",
  },
];

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingSlides({ onComplete, onSkip }: OnboardingSlidesProps) {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast, onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable
        onPress={onSkip}
        style={[styles.skipButton, { paddingRight: spacing.lg }]}
        hitSlop={12}
      >
        <ThemedText style={[typography.label, { color: "rgba(255,255,255,0.9)" }]}>
          Omitir
        </ThemedText>
      </Pressable>

      <Animated.View
        key={currentIndex}
        entering={FadeInDown.duration(400)}
        style={styles.slideContent}
      >
        <ThemedText style={styles.emoji}>{slide.emoji}</ThemedText>
        <ThemedText
          style={[
            typography.heading1,
            styles.title,
            { color: "#FFFFFF", marginTop: spacing.xl },
          ]}
        >
          {slide.title}
        </ThemedText>
        <ThemedText
          style={[
            typography.body,
            styles.description,
            { color: "rgba(255,255,255,0.9)", marginTop: spacing.md },
          ]}
        >
          {slide.description}
        </ThemedText>
      </Animated.View>

      <View style={[styles.footer, { paddingHorizontal: spacing.xl }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? "Empezar" : "Siguiente"}
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleNext}
          style={[styles.nextButton, { marginTop: spacing.lg }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 16,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 72,
    height: 72,
    textAlignVertical: "center",
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  footer: {
    paddingBottom: 32,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {},
});
