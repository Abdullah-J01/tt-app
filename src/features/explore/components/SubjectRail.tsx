"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
import { Check, ChevronDown, X } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import { selectableSurface } from "@/components/ui/SelectableCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Subjects shown before "See more" folds the rest (vertical xl rail). */
const VISIBLE = 12;
/** Compact chips kept inline on mobile/tablet before the "More" popup. */
const VISIBLE_MOBILE = 8;

interface SubjectRailProps {
  /** Composite keys "facetKey:value" that are checked. */
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
  className?: string;
}

/**
 * Subject picker synced to the "subject" facet. Mobile/tablet shows a compact
 * wrapped set of chips capped at VISIBLE_MOBILE, with a "More" chip that opens a
 * bottom-sheet with the full list; on xl it becomes a sticky vertical column
 * with an inline "See more" fold. Rows reuse the shared selectable surface.
 */
export function SubjectRail({ selected, onToggle, className }: SubjectRailProps) {
  const t = useTranslations("features_explore_components_SubjectRail");
  const [showAll, setShowAll] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Checked subjects never fold away, so they don't count as hidden.
  const foldable = (from: number) =>
    SUBJECTS.filter((s, i) => i >= from && !selected.has(`subject:${s.slug}`)).length;
  const hidden = foldable(VISIBLE);
  const hiddenMobile = foldable(VISIBLE_MOBILE);

  return (
    <section className={cn("rail-in min-w-0 xl:sticky xl:top-6", className)}>
      <h2 className="text-lg font-bold">{t("title")}</h2>

      <div className="xl:rounded-card xl:border-hairline xl:bg-surface mt-3 flex flex-wrap gap-2 xl:flex-col xl:flex-nowrap xl:gap-1.5 xl:border xl:p-2">
        {SUBJECTS.map((subject, i) => {
          const key = `subject:${subject.slug}`;
          const checked = selected.has(key);
          return (
            <SubjectChip
              key={subject.slug}
              subject={subject}
              checked={checked}
              onClick={() => onToggle(key)}
              index={i}
              className={cn(
                // Mobile/tablet: only the first VISIBLE_MOBILE stay inline (checked always).
                !checked && i >= VISIBLE_MOBILE && "hidden",
                // xl vertical rail shows up to VISIBLE, folding the rest behind "See more".
                i >= VISIBLE_MOBILE && i < VISIBLE && "xl:flex",
                i >= VISIBLE && showAll && "xl:flex",
              )}
            />
          );
        })}

        {/* Mobile/tablet: open the full-list bottom-sheet. */}
        {hiddenMobile > 0 && (
          <Button
            unstyled
            type="button"
            onClick={() => setSheetOpen(true)}
            className="border-hairline text-violet hover:border-violet hover:bg-lavender/40 flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors active:scale-95 xl:hidden"
          >
            {t("more", { count: hiddenMobile })}
          </Button>
        )}

        {/* xl vertical rail: inline fold control. */}
        {hidden > 0 && (
          <Button
            unstyled
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-violet hover:bg-lavender/40 hidden w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold transition-colors xl:flex"
          >
            {showAll ? t("seeLess") : t("seeMore", { count: hidden })}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", showAll && "rotate-180")}
            />
          </Button>
        )}
      </div>

      <SubjectSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selected={selected}
        onToggle={onToggle}
      />
    </section>
  );
}

type SubjectItem = (typeof SUBJECTS)[number];

/** One selectable subject row/chip. Compact on mobile, full row on xl + in the sheet. */
function SubjectChip({
  subject,
  checked,
  onClick,
  index,
  fullWidth,
  className,
}: {
  subject: SubjectItem;
  checked: boolean;
  onClick: () => void;
  index?: number;
  /** Force the wide row layout (used inside the sheet). */
  fullWidth?: boolean;
  className?: string;
}) {
  const subjectName = useSubjectName();
  const Icon = subject.icon;
  return (
    <Button
      unstyled
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      style={index != null ? { animationDelay: `${100 + Math.min(index, 12) * 45}ms` } : undefined}
      className={cn(
        "group flex shrink-0 items-center gap-2 px-2.5 py-1.5 text-left text-[13px]",
        "xl:w-full xl:shrink xl:gap-2.5 xl:px-3 xl:py-2 xl:text-sm",
        fullWidth ? "w-full gap-2.5 px-3 py-2 text-sm" : "anim-item-in",
        selectableSurface(checked),
        className,
      )}
    >
      <span
        className={cn(
          "bg-mist grid shrink-0 place-items-center rounded-full transition-colors",
          fullWidth ? "h-8 w-8" : "h-6 w-6 xl:h-8 xl:w-8",
          checked ? "bg-violet text-white" : subject.color,
        )}
      >
        {checked ? (
          <Check
            className={cn("check-pop", fullWidth ? "h-4 w-4" : "h-3.5 w-3.5 xl:h-4 xl:w-4")}
            strokeWidth={3}
            aria-hidden
          />
        ) : (
          <Icon className={cn(fullWidth ? "h-4 w-4" : "h-3.5 w-3.5 xl:h-4 xl:w-4")} aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "text-ink font-medium whitespace-nowrap xl:flex-1 xl:truncate",
          fullWidth && "flex-1 truncate",
          checked && "font-semibold",
        )}
      >
        {subjectName(subject.slug, subject.name)}
      </span>
      <span
        className={cn(
          "text-muted text-xs tabular-nums",
          // Counts crowd the compact mobile chips — keep them for the wide layouts only.
          fullWidth ? "inline" : "hidden xl:inline",
        )}
      >
        {subject.count.toLocaleString("en-US")}
      </span>
    </Button>
  );
}

/** Bottom-sheet with the complete subject list (mobile/tablet "More"). */
function SubjectSheet({
  open,
  onClose,
  selected,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
}) {
  const t = useTranslations("features_explore_components_SubjectRail");
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const count = [...selected].filter((k) => k.startsWith("subject:")).length;

  return (
    <div
      className="fixed inset-0 z-50 xl:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("chooseSubjects")}
    >
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="drawer-left bg-surface absolute inset-y-0 left-0 flex w-[96%] max-w-2xl flex-col rounded-r-2xl">
        <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">{t("title")}</h2>
          <Button
            unstyled
            type="button"
            onClick={onClose}
            aria-label={t("closeSubjects")}
            className="hover:bg-lavender grid h-9 w-9 place-items-center rounded-full active:scale-95"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUBJECTS.map((subject) => {
              const key = `subject:${subject.slug}`;
              return (
                <SubjectChip
                  key={subject.slug}
                  subject={subject}
                  checked={selected.has(key)}
                  onClick={() => onToggle(key)}
                  fullWidth
                />
              );
            })}
          </div>
        </div>

        <div className="border-hairline border-t p-4">
          <Button
            unstyled
            type="button"
            onClick={onClose}
            className="bg-violet hover:bg-violet-dark h-11 w-full rounded-xl font-semibold text-white transition-transform active:scale-[0.98]"
          >
            {count > 0 ? t("doneCount", { count }) : t("done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
