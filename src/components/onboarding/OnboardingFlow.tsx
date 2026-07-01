"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DAILY_GOALS, GRADES, SUBJECTS } from "@/config/subjects";
import { OnboardingHeader } from "./OnboardingHeader";
import { StepGrade } from "./StepGrade";
import { StepInterests } from "./StepInterests";
import { StepDailyGoal } from "./StepDailyGoal";
import { finishOnboarding } from "./actions";

const TOTAL_STEPS = 3;
const MIN_INTERESTS = 3;
const GRADE_OPTIONS = GRADES.filter((g) => g.slug !== "all");

/**
 * 3-step onboarding wizard (UI brief §6.1). Owns all step state + validation;
 * steps are presentational. Persistence happens in the `finishOnboarding` action.
 */
export function OnboardingFlow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<string | null>(null);
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [dailyGoal, setDailyGoal] = useState(5);
  const [reminders, setReminders] = useState(true);

  const toggleInterest = (slug: string) =>
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const isLastStep = step === TOTAL_STEPS - 1;
  const canContinue =
    step === 0 ? grade !== null : step === 1 ? interests.size >= MIN_INTERESTS : true;

  const enterFeed = () => router.push("/feed");

  const handlePrimary = () => {
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    startTransition(async () => {
      await finishOnboarding({ grade, interests: [...interests], dailyGoal, reminders });
    });
  };

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col gap-6 px-5 pb-8 pt-10">
      <OnboardingHeader step={step} total={TOTAL_STEPS} onSkip={enterFeed} />

      <div className="flex flex-1 flex-col">
        {step === 0 && <StepGrade grades={GRADE_OPTIONS} selected={grade} onSelect={setGrade} />}
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
            onSelect={setDailyGoal}
            reminders={reminders}
            onToggleReminders={setReminders}
          />
        )}
      </div>

      <Button block size="lg" disabled={!canContinue} loading={pending} onClick={handlePrimary}>
        {isLastStep ? "Start learning" : "Continue"}
      </Button>
    </div>
  );
}
