import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressDots } from "@/components/ui/ProgressDots";

interface OnboardingHeaderProps {
  /** Zero-based current step. */
  step: number;
  total: number;
  /** Back affordance — shown only when provided. */
  onBack?: () => void;
  /** Forward affordance — shown only for already-visited steps (resume without re-picking). */
  onForward?: () => void;
  /** Optional skip affordance. */
  onSkip?: () => void;
}

const arrowClass =
  "flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-lavender";

/** Onboarding step header — back/forward arrows, "Step X of Y", skip, and progress dots. */
export function OnboardingHeader({ step, total, onBack, onForward, onSkip }: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Go back" className={`-ml-1.5 ${arrowClass}`}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
          )}
          <span className="text-xs font-semibold text-muted">
            Step {step + 1} of {total}
          </span>
          {onForward && (
            <button type="button" onClick={onForward} aria-label="Go forward" className={arrowClass}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
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
