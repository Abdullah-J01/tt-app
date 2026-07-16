"use client";

import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
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
  const subjectName = useSubjectName();
  const remaining = Math.max(0, min - selected.size);

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <div>
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm sm:mt-1.5 sm:text-base">{t("subtitle", { min })}</p>
      </div>

      <div role="group" aria-label={t("groupLabel")} className="grid grid-cols-3 gap-2.5">
        {subjects.map((s) => {
          const Icon = s.icon;
          return (
            <SelectableCard
              key={s.slug}
              orientation="vertical"
              className="p-3 sm:p-4"
              title={subjectName(s.slug, s.name)}
              selected={selected.has(s.slug)}
              onSelect={() => onToggle(s.slug)}
              media={<Icon />}
            />
          );
        })}
      </div>

      <p aria-live="polite" className="text-muted text-sm">
        {remaining > 0
          ? t.rich("remaining", {
              count: remaining,
              b: (chunks) => <span className="text-ink font-bold">{chunks}</span>,
            })
          : t.rich("selected", {
              count: selected.size,
              b: (chunks) => <span className="text-violet font-bold">{chunks}</span>,
            })}
      </p>
    </div>
  );
}
