"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Portal } from "@/lib/Portal";
import { Button } from "@/components/ui/Button";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  /**
   * Called by the footer button instead of `onClose` — for draft-style filters
   * where backdrop/X dismisses but the footer commits (e.g. the feed).
   */
  onApply?: () => void;
  /** Drawer body — typically a <FilterPanel>. */
  children: ReactNode;
}

/**
 * "Filter materials" drawer shell: bottom sheet on mobile, right side panel on
 * desktop, with a sticky "Show N results" footer. Locks the page scroll behind
 * it while open. Shared by Explore and the subject page.
 */
export function FilterDrawer({ open, onClose, resultCount, onApply, children }: FilterDrawerProps) {
  const t = useTranslations("features_explore_components_FilterDrawer");
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    // Portaled to <body>: rendered inline, any transformed/animated ancestor
    // (page entrance animations) becomes the containing block for `fixed` and
    // shoves the sticky footer off-screen. z-[75] clears the mobile nav (z-70);
    // dvh (not vh) tracks the WebView's *visible* viewport.
    <Portal>
      <div
        className="fixed inset-0 z-[75]"
        role="dialog"
        aria-modal="true"
        aria-label={t("dialogLabel")}
      >
        <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="drawer-up md-drawer-right bg-surface absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-sm md:rounded-none md:rounded-l-2xl">
          <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-bold">{t("title")}</h2>
            <Button
              unstyled
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="hover:bg-lavender grid h-9 w-9 place-items-center rounded-full active:scale-95"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
          {/* Safe-area padding keeps the CTA above the Android gesture bar / iOS home indicator. */}
          <div className="border-hairline border-t p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
            <Button
              unstyled
              type="button"
              onClick={onApply ?? onClose}
              className="bg-violet hover:bg-violet-dark h-11 w-full rounded-xl font-semibold text-white transition-transform active:scale-[0.98]"
            >
              {t("showResults", { count: resultCount })}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
