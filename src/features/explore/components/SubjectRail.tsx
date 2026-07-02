"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import { selectableSurface } from "@/components/ui/SelectableCard";
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
  const [showAll, setShowAll] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Checked subjects never fold away, so they don't count as hidden.
  const foldable = (from: number) =>
    SUBJECTS.filter((s, i) => i >= from && !selected.has(`subject:${s.slug}`)).length;
  const hidden = foldable(VISIBLE);
  const hiddenMobile = foldable(VISIBLE_MOBILE);

  return (
    <section className={cn("rail-in min-w-0 xl:sticky xl:top-6", className)}>
      <h2 className="text-lg font-bold">Subjects</h2>

      <div className="mt-3 flex flex-wrap gap-2 xl:flex-col xl:flex-nowrap xl:gap-1.5 xl:rounded-card xl:border xl:border-hairline xl:bg-surface xl:p-2">
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
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-hairline px-3.5 py-1.5 text-[13px] font-semibold text-violet transition-colors hover:border-violet hover:bg-lavender/40 active:scale-95 xl:hidden"
          >
            More ({hiddenMobile})
          </button>
        )}

        {/* xl vertical rail: inline fold control. */}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="hidden w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-violet transition-colors hover:bg-lavender/40 xl:flex"
          >
            {showAll ? "See less" : `See more (${hidden})`}
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", showAll && "rotate-180")} />
          </button>
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
  const Icon = subject.icon;
  return (
    <button
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
          "grid shrink-0 place-items-center rounded-full bg-mist transition-colors",
          fullWidth ? "h-8 w-8" : "h-6 w-6 xl:h-8 xl:w-8",
          checked ? "bg-violet text-white" : subject.color,
        )}
      >
        {checked ? (
          <Check className={cn("check-pop", fullWidth ? "h-4 w-4" : "h-3.5 w-3.5 xl:h-4 xl:w-4")} strokeWidth={3} aria-hidden />
        ) : (
          <Icon className={cn(fullWidth ? "h-4 w-4" : "h-3.5 w-3.5 xl:h-4 xl:w-4")} aria-hidden />
        )}
      </span>
      <span className={cn("whitespace-nowrap font-medium text-ink xl:flex-1 xl:truncate", fullWidth && "flex-1 truncate", checked && "font-semibold")}>
        {subject.name}
      </span>
      <span
        className={cn(
          "text-xs tabular-nums text-muted",
          // Counts crowd the compact mobile chips — keep them for the wide layouts only.
          fullWidth ? "inline" : "hidden xl:inline",
        )}
      >
        {subject.count.toLocaleString("en-US")}
      </span>
    </button>
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
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Choose subjects">
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="drawer-left absolute inset-y-0 left-0 flex w-[96%] max-w-2xl flex-col rounded-r-2xl bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <h2 className="text-lg font-bold">Subjects</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close subjects"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-lavender active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
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

        <div className="border-t border-hairline p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-violet font-semibold text-white transition-transform hover:bg-violet-dark active:scale-[0.98]"
          >
            {count > 0 ? `Done · ${count} selected` : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
