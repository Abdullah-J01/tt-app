"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { DAILY_GOALS, GRADES, SUBJECTS } from "@/config/subjects";
import { OnboardingHeader } from "./OnboardingHeader";
import { StepGrade } from "./StepGrade";
import { StepInterests } from "./StepInterests";
import { StepDailyGoal } from "./StepDailyGoal";
import { finishOnboarding } from "./actions";
import { useOnboardingState } from "./useOnboardingState";

const TOTAL_STEPS = 3;
const MIN_INTERESTS = 3;
const GRADE_OPTIONS = GRADES.filter((g) => g.slug !== "all");

/**
 * 3-step onboarding wizard (UI brief §6.1). Owns all step state + validation;
 * steps are presentational. Selections + progress persist across reloads via
 * `useOnboardingState`; final persistence to TT happens in `finishOnboarding`.
 */
export function OnboardingFlow() {
  const t = useTranslations("components_onboarding_OnboardingFlow");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { data, update, hydrated, clear } = useOnboardingState();
  const { step, maxStep, grade, dailyGoal, reminders } = data;
  const interests = new Set(data.interests);

  // Transient animation direction — not persisted (1 = forward, -1 = back).
  const [direction, setDirection] = useState<1 | -1>(1);

  const toggleInterest = (slug: string) => {
    const next = new Set(interests);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    update({ interests: [...next] });
  };

  const isLastStep = step === TOTAL_STEPS - 1;
  const canContinue =
    step === 0 ? grade !== null : step === 1 ? interests.size >= MIN_INTERESTS : true;
  const canGoForward = step < maxStep && canContinue;

  const goTo = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    update({ step: next, maxStep: Math.max(maxStep, next) });
  };

  const goBack = () => {
    if (step > 0) goTo(step - 1, -1);
    // First step → back to the create-account screen we came from.
    else router.back();
  };

  const leaveFlow = (to: string) => {
    clear(); // finished / skipped → start fresh next time
    router.push(to);
  };

  const handlePrimary = () => {
    if (!isLastStep) {
      goTo(step + 1, 1);
      return;
    }
    startTransition(async () => {
      clear();
      await finishOnboarding({ grade, interests: data.interests, dailyGoal, reminders });
    });
  };

  // Wait for localStorage before painting so a reload restores the right step.
  if (!hydrated) return <div className="bg-surface min-h-[100svh]" />;

  return (
    // Compact on mobile so a full step (header + options + CTA) fits one screen.
    // The bottom padding below md clears the fixed BottomNav (+ gesture bar).
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col gap-4 px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:gap-6 sm:pt-10 md:pb-8">
      <OnboardingHeader
        step={step}
        total={TOTAL_STEPS}
        onBack={goBack}
        onForward={canGoForward ? () => goTo(step + 1, 1) : undefined}
        onSkip={() => leaveFlow("/feed")}
      />

      {/* `key={step}` remounts the wrapper each change so the entrance animation replays. */}
      <div
        key={step}
        className={cn(
          // Mobile: no flex-1 — the CTA sits right under the selections instead
          // of being pushed to the viewport bottom (behind the bottom nav).
          "flex flex-col sm:flex-1",
          direction === 1 ? "anim-step-next" : "anim-step-prev",
        )}
      >
        {step === 0 && (
          <StepGrade
            grades={GRADE_OPTIONS}
            selected={grade}
            onSelect={(slug) => update({ grade: slug })}
          />
        )}
        {step === 1 && (
          <StepInterests
            subjects={SUBJECTS}
            selected={interests}
            onToggle={toggleInterest}
            min={MIN_INTERESTS}
          />
        )}
        {step === 2 && (
          <StepDailyGoal
            goals={DAILY_GOALS}
            selected={dailyGoal}
            onSelect={(g) => update({ dailyGoal: g })}
            reminders={reminders}
            onToggleReminders={(v) => update({ reminders: v })}
          />
        )}
      </div>

      <Button block size="lg" disabled={!canContinue} loading={pending} onClick={handlePrimary}>
        {isLastStep ? t("startLearning") : t("continue")}
      </Button>
    </div>
  );
}
