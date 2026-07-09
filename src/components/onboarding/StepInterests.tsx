"use client";

import { useTranslations } from "@/i18n/client";
import { SelectableCard } from "@/components/ui/SelectableCard";
import type { Subject } from "@/config/subjects";

interface StepInterestsProps {
  subjects: Subject[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
  /** Minimum required selections. */
  min?: number;
}

/** Onboarding step 2 — multi-select interest tiles with a min-count affordance (§6.1). */
export function StepInterests({ subjects, selected, onToggle, min = 3 }: StepInterestsProps) {
  const t = useTranslations("components_onboarding_StepInterests");
  const remaining = Math.max(0, min - selected.size);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1.5 text-muted">{t("subtitle", { min })}</p>
      </div>

      <div role="group" aria-label={t("groupLabel")} className="grid grid-cols-3 gap-2.5">
        {subjects.map((s) => {
          const Icon = s.icon;
          return (
            <SelectableCard
              key={s.slug}
              orientation="vertical"
              title={s.name}
              selected={selected.has(s.slug)}
              onSelect={() => onToggle(s.slug)}
              media={<Icon />}
            />
          );
        })}
      </div>

      <p aria-live="polite" className="text-sm text-muted">
        {remaining > 0
          ? t.rich("remaining", {
              count: remaining,
              b: (chunks) => <span className="font-bold text-ink">{chunks}</span>,
            })
          : t.rich("selected", {
              count: selected.size,
              b: (chunks) => <span className="font-bold text-violet">{chunks}</span>,
            })}
      </p>
    </div>
  );
}