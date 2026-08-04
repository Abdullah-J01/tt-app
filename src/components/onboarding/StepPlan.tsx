"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { Pill } from "@/components/ui/Pill";
import { selectableSurface } from "@/components/ui/SelectableCard";
import { formatPrice, PLAN_DISPLAY, type Cycle, type PlanId } from "@/features/billing";

interface StepPlanProps {
  plan: PlanId;
  cycle: Cycle;
  onSelectPlan: (plan: PlanId) => void;
  onSelectCycle: (cycle: Cycle) => void;
}

const PREMIUM_FEATURES = ["feat1", "feat2", "feat3"] as const;

/**
 * Onboarding step 4 — plan selection (UI brief follow-up). Premium/yearly is
 * pre-selected via `useOnboardingState` defaults; the user can switch to Free
 * or Monthly here, and the header's Skip affordance leaves Free applied
 * (no checkout is ever started from Skip).
 */
export function StepPlan({ plan, cycle, onSelectPlan, onSelectCycle }: StepPlanProps) {
  const t = useTranslations("components_onboarding_StepPlan");
  const premium = PLAN_DISPLAY.premium;
  const savePct = Math.round((1 - premium.yearly / (premium.monthly * 12)) * 100);

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <div>
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm sm:mt-1.5 sm:text-base">{t("subtitle")}</p>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <div className="bg-lavender/50 inline-flex gap-1 rounded-full p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <Button
              key={c}
              unstyled
              type="button"
              aria-pressed={cycle === c}
              onClick={() => onSelectCycle(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                cycle === c ? "bg-violet text-white" : "text-ink hover:text-violet",
              )}
            >
              {t(c)}
            </Button>
          ))}
        </div>
        {/* {cycle === "yearly" && <Pill variant="green">{t("savePercent", { pct: savePct })}</Pill>} */}
      </div>

      <div role="group" aria-label={t("groupLabel")} className="flex flex-col gap-2.5 sm:gap-3">
        <Button
          unstyled
          type="button"
          aria-pressed={plan === "free"}
          onClick={() => onSelectPlan("free")}
          className={cn(
            "relative flex w-full items-center gap-3.5 p-4 text-left",
            selectableSurface(plan === "free"),
          )}
        >
          <IconBadge
            icon={<Sparkles />}
            shape="rounded"
            variant={plan === "free" ? "violet" : "grey"}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-ink text-[15px] font-semibold">{t("freeName")}</p>
            <p className="text-muted text-xs">{t("freeTagline")}</p>
          </div>
          {plan === "free" && (
            <Check className="text-violet absolute top-4 right-4 h-5 w-5 shrink-0" aria-hidden />
          )}
        </Button>

        <Button
          unstyled
          type="button"
          aria-pressed={plan === "premium"}
          onClick={() => onSelectPlan("premium")}
          className={cn(
            "relative flex w-full items-start gap-3.5 p-4 text-left",
            selectableSurface(plan === "premium"),
          )}
        >
          <IconBadge icon={<Zap />} shape="rounded" variant={plan === "premium" ? "violet" : "grey"} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 pr-6">
              <div>
                <p className="font-display text-ink text-[15px] font-semibold">
                  {t("premiumName")}
                </p>
                <p className="text-muted text-xs">{t("premiumTagline")}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-ink text-base font-bold">
                  {formatPrice(cycle === "yearly" ? premium.yearly : premium.monthly)}
                </p>
                <p className="text-muted text-[11px]">
                  {cycle === "yearly" ? t("perYearBilled") : t("perMonthMonthly")}
                </p>
              </div>
            </div>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="text-ink/80 flex items-center gap-2 text-xs">
                  <Check className="text-violet h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t(f)}
                </li>
              ))}
            </ul>
          </div>
          {plan === "premium" && (
            <Check className="text-violet absolute top-4 right-4 h-5 w-5 shrink-0" aria-hidden />
          )}
        </Button>
      </div>
    </div>
  );
}
