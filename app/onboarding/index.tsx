import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import {
  OnboardingAppGoals,
  OnboardingAppGrid,
  OnboardingComplete,
  OnboardingPermissionStep,
  OnboardingSlides,
  type SelectedApp,
} from "@/components/screens/Onboarding";
import { ONBOARDING_GOAL_DEFAULT } from "@/constants/apps";
import { appService } from "@/services/appService";
import { useHabitsStore } from "@/stores/habits-store";
import { useSettingsStore } from "@/stores/settings-store";

const STEP_SLIDES = 0;
const STEP_APPS = 1;
const STEP_GOALS = 2;
const STEP_PERMISSION = 3;
const STEP_COMPLETE = 4;

function getAppKey(app: SelectedApp): string {
  return app.app.id === "other" && app.customName
    ? `other:${app.customName}`
    : app.app.id;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useSettingsStore(
    (s) => s.setOnboardingCompleted,
  );
  const hydrateToday = useHabitsStore((s) => s.hydrateToday);

  const [step, setStep] = useState(STEP_SLIDES);
  const [selectedApps, setSelectedApps] = useState<SelectedApp[]>([]);
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const isAndroid = Platform.OS === "android";

  const handleCompleteOnboarding = useCallback(async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      const appsToAdd = selectedApps.map((selected) => {
        const key = getAppKey(selected);
        const displayName =
          selected.app.id === "other" && selected.customName
            ? selected.customName
            : selected.app.name;
        const dailyGoalMinutes = Math.round(goals[key] ?? ONBOARDING_GOAL_DEFAULT);
        return {
          name: displayName,
          packageName: selected.app.packageName ?? null,
          iconEmoji: selected.app.iconEmoji,
          dailyGoalMinutes,
        };
      });

      await appService.replaceAppsForOnboarding(appsToAdd);
      setOnboardingCompleted(true);
      await hydrateToday();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding complete error:", error);
      setIsCompleting(false);
    }
  }, [
    selectedApps,
    goals,
    isCompleting,
    setOnboardingCompleted,
    hydrateToday,
    router,
  ]);

  const handleNext = useCallback(() => {
    setStep((s) => {
      const next = s + 1;
      if (!isAndroid && next === STEP_PERMISSION) {
        return STEP_COMPLETE;
      }
      return Math.min(next, STEP_COMPLETE);
    });
  }, [isAndroid]);

  const handleBack = useCallback(() => {
    setStep((s) => {
      const prev = s - 1;
      if (!isAndroid && s === STEP_COMPLETE) {
        return STEP_GOALS;
      }
      return Math.max(prev, STEP_SLIDES);
    });
  }, [isAndroid]);

  const handleSkip = useCallback(() => {
    setStep(STEP_APPS);
  }, []);

  if (step === STEP_SLIDES) {
    return (
      <OnboardingSlides
        onComplete={handleNext}
        onSkip={handleSkip}
      />
    );
  }

  if (step === STEP_APPS) {
    return (
      <OnboardingAppGrid
        selectedApps={selectedApps}
        onSelectionChange={setSelectedApps}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  if (step === STEP_GOALS) {
    return (
      <OnboardingAppGoals
        selectedApps={selectedApps}
        goals={goals}
        onGoalsChange={setGoals}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  if (isAndroid && step === STEP_PERMISSION) {
    return (
      <OnboardingPermissionStep
        onContinue={handleNext}
        onBack={handleBack}
      />
    );
  }

  return (
    <OnboardingComplete
      selectedApps={selectedApps}
      goals={goals}
      onStart={handleCompleteOnboarding}
      onBack={handleBack}
    />
  );
}
