"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { Award, Bookmark, Check, Cloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  BillingError,
  BillingErrorModal,
  formatPrice,
  PLAN_DISPLAY,
  startCheckout,
} from "@/features/billing";

const FEATURES = ["featEverything", "featSaves", "featOffline", "featAudio"];

// The paywall upsells the recommended "Scholar" plan; the /premium page is the
// full comparison for anyone who wants Genius.
const PLAN = PLAN_DISPLAY.scholar;

/** Premium paywall bottom sheet → real Stripe Checkout (UI: Paywall). */
export function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("features_profile_components_Paywall");
  const router = useRouter();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [done, setDone] = useState(false);
  const [cycle, setCycle] = useState<"yearly" | "monthly">("yearly");
  const [loading, setLoading] = useState(false);
  const [billingError, setBillingError] = useState<BillingError | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      setLoading(false);
    };
  }, [open]);

  if (!open) return null;

  const savings = Math.round((1 - PLAN.yearly / PLAN.monthly) * 100);

  async function handleCheckout() {
    setLoading(true);
    try {
      await startCheckout(PLAN.id, cycle); // redirects to Stripe on success
    } catch (err) {
      setLoading(false);
      const billingErr =
        err instanceof BillingError
          ? err
          : new BillingError("Something went wrong. Please try again.", 0);
      console.error(billingErr);
      setBillingError(billingErr);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="drawer-up bg-surface relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl">
        <Button
          unstyled
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="hover:bg-lavender absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>

        <span className="bg-violet mx-auto grid h-14 w-14 place-items-center rounded-full text-white">
          <Award className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-center text-2xl font-bold">{t("unlockTitle")}</h2>
        <p className="text-muted mt-2 text-center text-sm">{t("unlockSubtitle")}</p>

        <ul className="mt-5 space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="text-brand-green h-4 w-4 shrink-0" /> {t(f)}
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-3">
          <PlanRow
            selected={cycle === "yearly"}
            onClick={() => setCycle("yearly")}
            title={t("annual")}
            note={t("trialNote")}
            price={formatPrice(PLAN.yearly)}
            badge={savings > 0 ? t("savePercent", { percent: savings }) : undefined}
          />
          <PlanRow
            selected={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            title={t("monthly")}
            note={t("trialNote")}
            price={formatPrice(PLAN.monthly)}
          />
        </div>

        <Button block loading={loading} onClick={handleCheckout} className="mt-5" size="lg">
          {t("startTrial")}
        </Button>
        <p className="text-muted mt-3 text-center text-xs">
          {t("renewLine", { price: formatPrice(cycle === "yearly" ? PLAN.yearly : PLAN.monthly) })}
        </p>
      </div>

      <BillingErrorModal
        error={billingError}
        onClose={() => setBillingError(null)}
        onRetry={handleCheckout}
      />
    </div>
  );
}

function PlanRow({
  selected,
  onClick,
  title,
  note,
  price,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  note: string;
  price: string;
  badge?: string;
}) {
  const t = useTranslations("features_profile_components_Paywall");
  return (
    <Button
      unstyled
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
        selected ? "border-violet bg-lavender/40" : "border-hairline hover:border-violet/40",
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
          selected ? "border-violet" : "border-hairline",
        )}
      >
        {selected && <span className="bg-violet h-2.5 w-2.5 rounded-full" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold">{title}</span>
          {badge && (
            <span className="bg-amber/15 text-amber rounded-full px-2 py-0.5 text-xs font-bold">
              {badge}
            </span>
          )}
        </span>
        <span className="text-muted block text-xs">{note}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-bold">{price}</span>
        <span className="text-muted block text-xs">{t("perMonth")}</span>
      </span>
    </Button>
  );
}
