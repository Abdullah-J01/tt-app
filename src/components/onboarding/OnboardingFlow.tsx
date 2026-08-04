"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { DAILY_GOALS, GRADES, SUBJECTS } from "@/config/subjects";
import { BillingError, BillingErrorModal, startCheckout } from "@/features/billing";
import { OnboardingHeader } from "./OnboardingHeader";
import { StepGrade } from "./StepGrade";
import { StepInterests } from "./StepInterests";
import { StepDailyGoal } from "./StepDailyGoal";
import { StepPlan } from "./StepPlan";
import { finishOnboarding } from "./actions";
import { useOnboardingState } from "./useOnboardingState";

const TOTAL_STEPS = 4;
const MIN_INTERESTS = 3;
const GRADE_OPTIONS = GRADES.filter((g) => g.slug !== "all");

/**
 * 4-step onboarding wizard (UI brief §6.1 + plan step). Owns all step state +
 * validation; steps are presentational. Selections + progress persist across
 * reloads via `useOnboardingState`; final persistence to TT happens in
 * `finishOnboarding`.
 */
export function OnboardingFlow() {
  const t = useTranslations("components_onboarding_OnboardingFlow");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [billingError, setBillingError] = useState<BillingError | null>(null);
  const { data, update, hydrated, clear } = useOnboardingState();
  const { step, maxStep, grade, dailyGoal, reminders, plan, cycle } = data;
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
      await finishOnboarding({ grade, interests: data.interests, dailyGoal, reminders });
      if (plan === "premium") {
        try {
          await startCheckout(plan, cycle); // redirects to Stripe Checkout on success
        } catch (err) {
          const billingErr =
            err instanceof BillingError
              ? err
              : new BillingError("Something went wrong. Please try again.", 0);
          console.error(billingErr);
          setBillingError(billingErr);
        }
        return;
      }
      clear();
      router.push("/home");
    });
  };

  const primaryLabel = !isLastStep
    ? t("continue")
    : plan === "premium"
      ? t("startTrial")
      : t("startLearning");

  // Wait for localStorage before painting so a reload restores the right step.
  if (!hydrated) return <div className="bg-surface min-h-[100svh]" />;

  return (
    // Compact on mobile so a full step (header + options + CTA) fits one screen.
    // The bottom padding below md clears the pinned CTA and the fixed BottomNav
    // (+ gesture bar), so the last option can still be scrolled into view.
    <div
      className={cn(
        // lg+: centre the step as one block instead of stretching it, so a short
        // step doesn't leave a gulf between the content and a bottom-pinned CTA.
        "mx-auto flex min-h-[100svh] w-full max-w-md flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:gap-6 sm:pt-10 md:pb-8 lg:justify-center lg:gap-3 lg:pt-5 lg:pb-6",
        // Interests is the only long step: at max-w-md its 23 tiles are 8 rows
        // deep and push the CTA off-screen. Widen it at lg so the grid can go
        // 6-across (4 rows) and the whole step stays above the fold.
        step === 1 && "lg:max-w-4xl",
      )}
    >
      <OnboardingHeader
        step={step}
        total={TOTAL_STEPS}
        onBack={goBack}
        onForward={canGoForward ? () => goTo(step + 1, 1) : undefined}
        onSkip={() => leaveFlow("/home")}
      />

      {/* `key={step}` remounts the wrapper each change so the entrance animation replays. */}
      <div
        key={step}
        className={cn(
          // Mobile: no flex-1 — the step keeps its natural height and simply
          // scrolls under the pinned CTA rather than stretching to fill.
          "flex flex-col sm:flex-1 lg:flex-none",
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
        {step === 3 && (
          <StepPlan
            plan={plan}
            cycle={cycle}
            onSelectPlan={(p) => update({ plan: p })}
            onSelectCycle={(c) => update({ cycle: c })}
          />
        )}
      </div>

      {/* Below md the CTA is pinned to the viewport, just above the fixed
        MobileNav, so it's always reachable without scrolling the step. The
        fade lets the options scroll under it instead of ending abruptly.
        md+ has no bottom nav, so it goes back in flow — capped + centred so
        it keeps its shape on the wide interests step. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+3.75rem)]",
          "from-surface via-surface bg-gradient-to-t to-transparent",
          "md:static md:z-auto md:bg-none md:p-0",
        )}
      >
        <div className="mx-auto w-full max-w-md">
          <Button block size="lg" disabled={!canContinue} loading={pending} onClick={handlePrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>

      <BillingErrorModal
        error={billingError}
        onClose={() => setBillingError(null)}
        onRetry={plan === "premium" ? handlePrimary : undefined}
      />
    </div>
  );
}
