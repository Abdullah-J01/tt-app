"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/client";
import { Flame, SlidersHorizontal } from "lucide-react";
import { useStreak } from "@/features/streak";
import { cn } from "@/lib/utils";

type Props = {
  /** Drives the entrance animation — pass the active-card flag, or omit to animate once. */
  active?: boolean;
  /** Opens the feed filter drawer; the icon only renders as a button when set. */
  onOpenFilters?: () => void;
  /** Number of applied filters — shown as a badge on the filter button. */
  filterCount?: number;
  className?: string;
};

/**
 * Feed overlay chrome: streak · "For You" · filter. Sits above the whole-card
 * link overlay (z-20) but stays click-transparent — only the filter button
 * re-enables pointer events, so the rest of the card still opens the book.
 *
 * Rendered twice, never both: on mobile FeedScreen mounts it once over the
 * stage so it holds still while cards swipe beneath; on md+ FeedCard mounts
 * it inside each card.
 */
export default function FeedTopBar({
  active = true,
  onOpenFilters,
  filterCount = 0,
  className,
}: Props) {
  const t = useTranslations("components_feed_FeedTopBar");
  const { streak } = useStreak();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-4 top-8 z-30 flex items-center justify-between sm:inset-x-6 sm:top-9",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
      >
        <Flame size={13} className="text-amber fill-amber" />
        {streak}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-white"
      >
        {t("forYou")}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={t("filterFeed")}
            className="pointer-events-auto relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/90 transition-transform hover:bg-white/15 active:scale-95"
          >
            <SlidersHorizontal size={20} className="fill-white/90" />
            {filterCount > 0 && (
              <span
                key={filterCount}
                className="pill-in bg-amber text-ink absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold"
              >
                {filterCount}
              </span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/90">
            <SlidersHorizontal size={20} className="fill-white/90" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
