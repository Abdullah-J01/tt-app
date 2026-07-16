"use client";

import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/ui/IconBadge";
import { SelectableCard } from "@/components/ui/SelectableCard";
import type { Grade } from "@/config/subjects";

interface StepGradeProps {
  /** Grade options (already filtered — no "All"). */
  grades: Grade[];
  selected: string | null;
  onSelect: (slug: string) => void;
}

/** Onboarding step 1 — single-select grade cards (UI brief §6.1). */
export function StepGrade({ grades, selected, onSelect }: StepGradeProps) {
  const t = useTranslations("components_onboarding_StepGrade");
  const tCat = useTranslations("catalog");
  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <div>
        <h1 className="font-display text-ink text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm sm:mt-1.5 sm:text-base">{t("subtitle")}</p>
      </div>

      <div role="group" aria-label={t("groupLabel")} className="flex flex-col gap-2 sm:gap-3">
        {grades.map((g, i) => {
          const Icon = g.icon;
          const isSelected = selected === g.slug;
          return (
            // Staggered entrance: each card rises in ~70ms after the previous.
            <div key={g.slug} className="anim-item-in" style={{ animationDelay: `${i * 70}ms` }}>
              <SelectableCard
                orientation="horizontal"
                className="p-3 sm:p-4"
                title={tCat(`target.${g.slug}`)}
                subtitle={t(`subtitle_${g.slug}`)}
                selected={isSelected}
                onSelect={() => onSelect(g.slug)}
                media={
                  Icon ? (
                    <IconBadge
                      icon={<Icon />}
                      shape="rounded"
                      variant={isSelected ? "violet" : "grey"}
                      className={cn("max-sm:h-10 max-sm:w-10", isSelected && "bg-surface")}
                    />
                  ) : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
