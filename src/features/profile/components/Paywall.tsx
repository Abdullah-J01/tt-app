"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { Award, Bookmark, Check, Cloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const FEATURES = ["featEverything", "featSaves", "featOffline", "featAudio"];

/** Premium paywall bottom sheet → confirmation (UI: Paywall · Confirmation). */
export function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("features_profile_components_Paywall");
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

        {!done ? (
          <>
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
                selected={plan === "annual"}
                onClick={() => setPlan("annual")}
                title={t("annual")}
                note={t("annualNote")}
                price="1.90€"
                badge={t("save40")}
              />
              <PlanRow
                selected={plan === "monthly"}
                onClick={() => setPlan("monthly")}
                title={t("monthly")}
                note={t("monthlyNote")}
                price="2.90€"
              />
            </div>

            <Button
              unstyled
              type="button"
              onClick={() => setDone(true)}
              className="bg-violet hover:bg-violet-dark mt-5 h-13 w-full rounded-xl font-semibold text-white transition-transform active:scale-[0.99]"
            >
              {plan === "annual" ? t("startTrial") : t("goPremium")}
            </Button>
            <p className="text-muted mt-3 text-center text-xs">
              {t("renewNote")}{" "}
              <span className="text-ink font-semibold">{t("restore")}</span>
            </p>
          </>
        ) : (
          <>
            <span className="bg-brand-green/15 text-brand-green mx-auto grid h-14 w-14 place-items-center rounded-full">
              <Check className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-center text-2xl font-bold">{t("premiumTitle")}</h2>
            <p className="text-muted mt-2 text-center text-sm">{t("premiumSubtitle")}</p>
            <div className="rounded-card border-hairline mt-5 space-y-3 border p-4 text-sm">
              <p className="flex items-center gap-2">
                <Award className="text-violet h-4 w-4 shrink-0" />
                {plan === "annual" ? t("annualRenews") : t("monthlyRenews")}
              </p>
              <p className="flex items-center gap-2">
                <Bookmark className="text-violet h-4 w-4 shrink-0" /> {t("savesActive")}
              </p>
              <p className="flex items-center gap-2">
                <Cloud className="text-violet h-4 w-4 shrink-0" /> {t("offlineOn")}
              </p>
            </div>
            <Button
              unstyled
              type="button"
              onClick={() => {
                onClose();
                router.push("/feed");
              }}
              className="bg-violet hover:bg-violet-dark mt-5 h-13 w-full rounded-xl font-semibold text-white transition-transform active:scale-[0.99]"
            >
              {t("startLearning")}
            </Button>
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
