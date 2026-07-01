import { ProgressDots } from "@/components/ui/ProgressDots";

interface OnboardingHeaderProps {
  /** Zero-based current step. */
  step: number;
  total: number;
  /** Optional skip affordance. */
  onSkip?: () => void;
}

/** Onboarding step header — "Step X of Y", a skip link, and the progress dots. */
export function OnboardingHeader({ step, total, onSkip }: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          Step {step + 1} of {total}
        </span>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-semibold text-violet hover:text-violet-dark"
          >
            Skip
          </button>
        )}
      </div>
      <ProgressDots total={total} current={step} />
    </div>
  );
}
