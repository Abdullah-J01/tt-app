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
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">What grade are you in?</h1>
        <p className="mt-1.5 text-muted">We&apos;ll tune your feed to the right level.</p>
      </div>

      <div role="group" aria-label="Grade" className="flex flex-col gap-3">
        {grades.map((g, i) => {
          const Icon = g.icon;
          const isSelected = selected === g.slug;
          return (
            // Staggered entrance: each card rises in ~70ms after the previous.
            <div key={g.slug} className="anim-item-in" style={{ animationDelay: `${i * 70}ms` }}>
              <SelectableCard
                orientation="horizontal"
                title={g.label}
                subtitle={g.subtitle}
                selected={isSelected}
                onSelect={() => onSelect(g.slug)}
                media={
                  Icon ? (
                    <IconBadge
                      icon={<Icon />}
                      shape="rounded"
                      variant={isSelected ? "violet" : "grey"}
                      className={isSelected ? "bg-surface" : undefined}
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
