"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Bookmark, Check, Cloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Every studybook & studybite",
  "Unlimited saves & collections",
  "Offline reading",
  "Listen with audio cards",
];

/** Premium paywall bottom sheet → confirmation (UI: Paywall · Confirmation). */
export function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      setDone(false);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="drawer-up relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full hover:bg-lavender"
        >
          <X className="h-5 w-5" />
        </button>

        {!done ? (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violet text-white">
              <Award className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-center text-2xl font-bold">Unlock every studybook</h2>
            <p className="mt-2 text-center text-sm text-muted">
              This one&apos;s Premium. Go unlimited and keep the streak growing.
            </p>

            <ul className="mt-5 space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-brand-green" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-3">
              <PlanRow
                selected={plan === "annual"}
                onClick={() => setPlan("annual")}
                title="Annual"
                note="7-day free trial"
                price="1.90€"
                badge="Save 40%"
              />
              <PlanRow
                selected={plan === "monthly"}
                onClick={() => setPlan("monthly")}
                title="Monthly"
                note="Cancel anytime"
                price="2.90€"
              />
            </div>

            <button
              type="button"
              onClick={() => setDone(true)}
              className="mt-5 h-13 w-full rounded-xl bg-violet font-semibold text-white transition-transform hover:bg-violet-dark active:scale-[0.99]"
            >
              {plan === "annual" ? "Start 7-day free trial" : "Go Premium"}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              Then 1.90€/mo · Cancel anytime · <span className="font-semibold text-ink">Restore</span>
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-green/15 text-brand-green">
              <Check className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-center text-2xl font-bold">You&apos;re Premium!</h2>
            <p className="mt-2 text-center text-sm text-muted">
              Every studybook is unlocked and your saves are unlimited. Time to dive in.
            </p>
            <div className="mt-5 space-y-3 rounded-card border border-hairline p-4 text-sm">
              <p className="flex items-center gap-2">
                <Award className="h-4 w-4 shrink-0 text-violet" />
                {plan === "annual" ? "Annual" : "Monthly"} plan · renews 1 Jul 2027
              </p>
              <p className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 shrink-0 text-violet" /> Unlimited saves active
              </p>
              <p className="flex items-center gap-2">
                <Cloud className="h-4 w-4 shrink-0 text-violet" /> Offline reading on
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/feed");
              }}
              className="mt-5 h-13 w-full rounded-xl bg-violet font-semibold text-white transition-transform hover:bg-violet-dark active:scale-[0.99]"
            >
              Start learning
            </button>
          </>
        )}
      </div>
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
  return (
    <button
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
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-violet" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold">{title}</span>
          {badge && (
            <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-bold text-amber">{badge}</span>
          )}
        </span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-bold">{price}</span>
        <span className="block text-xs text-muted">/month</span>
      </span>
    </button>
  );
}
