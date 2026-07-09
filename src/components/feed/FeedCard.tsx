"use client";

import { memo } from "react";
import Link from "@/i18n/Link";
import Image from "next/image";
import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
import { motion } from "framer-motion";
import { Zap, BookOpen } from "lucide-react";
// import { cn } from "@/lib/utils"; // used by the progress strip (hidden for now)
import FeedTopBar from "./FeedTopBar";
import type { FeedCardData } from "./feedData";

/** Progress segments shown at the top — capped so long feeds stay legible (and cheap). */
// const MAX_SEGMENTS = 8; // used by the progress strip (hidden for now)

type Props = {
  card: FeedCardData;
  active: boolean;
  /** Active card or its neighbour — eager-loads the cover and renders the ambient blobs. */
  near?: boolean;
  /** 0-based position in the feed — drives the progress segments up top. */
  index: number;
  total: number;
  /** Opens the feed filter drawer; the icon only renders as a button when set. */
  onOpenFilters?: () => void;
  /** Number of applied filters — shown as a badge on the filter button. */
  filterCount?: number;
};

function FeedCard({
  card,
  active,
  near = false,
  // index + total stay in Props for the progress strip below (hidden for now).
  // index,
  // total,
  onOpenFilters,
  filterCount = 0,
}: Props) {
  const t = useTranslations("components_feed_FeedCard");
  const tCat = useTranslations("catalog");
  const subjectName = useSubjectName();
  // One segment per card for short feeds; proportional fill once the feed
  // outgrows the strip (hundreds of hairline slivers help nobody).
  // Kept for when the progress strip below is re-enabled.
  // const segments = Math.min(total, MAX_SEGMENTS);
  // const filled = total <= MAX_SEGMENTS ? index : Math.floor((index / (total - 1)) * (segments - 1));
  return (
    <div
      className="bg-plum-gradient relative h-full w-full overflow-hidden select-none"
      role="group"
      aria-roledescription="slide"
      aria-label={card.title}
    >
      {/* animated ambient blur blobs — only for the visible neighbourhood; offscreen
          cards skip them so the compositor isn't dragging hundreds of blurred layers */}
      {near && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute h-64 w-64 rounded-full bg-white/10 blur-3xl"
            animate={
              active
                ? { x: [0, 50, -20, 0], y: [0, -40, 20, 0], opacity: [0.25, 0.4, 0.2, 0.25] }
                : {}
            }
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "-4rem", left: "-3rem" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute h-72 w-72 rounded-full bg-white/5 blur-3xl"
            animate={
              active
                ? { x: [0, -40, 25, 0], y: [0, 30, -20, 0], opacity: [0.15, 0.3, 0.15, 0.15] }
                : {}
            }
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "-5rem", right: "-4rem" }}
          />
        </>
      )}

      {/* progress segments — which card of the feed you're on (hidden for now) */}
      {/* <div
        className="absolute inset-x-4 top-4 z-10 flex gap-1 sm:inset-x-6 sm:top-5"
        aria-label={`Card ${index + 1} of ${total}`}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full", i <= filled ? "bg-white" : "bg-white/25")}
          />
        ))}
      </div> */}

      {/* top badges: streak · For You · filter — md+ only; on mobile FeedScreen
          renders one fixed FeedTopBar over the stage so it doesn't swipe with
          the card. */}
      <FeedTopBar
        className="max-md:hidden"
        active={active}
        onOpenFilters={onOpenFilters}
        filterCount={filterCount}
      />

      {/* subject · grade */}
      <div className="absolute inset-x-4 top-19 z-10 flex items-center justify-start sm:inset-x-6 sm:top-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md"
        >
          <Zap size={12} className="fill-white/90" />
          {subjectName(card.subject, card.subject)} · {tCat(`target.${card.grade}`)}
        </motion.div>
      </div>

      {/* main content */}
      <div className="absolute inset-x-4 top-[38%] z-10 -translate-y-1/2 sm:inset-x-6 sm:top-[40%]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-white/55 uppercase"
        >
          {t("didYouKnow")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mb-4 text-2xl leading-snug font-semibold text-white sm:text-3xl"
        >
          {card.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]"
        >
          {card.description}
        </motion.p>
      </div>

      {/* book author row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="absolute inset-x-4 bottom-6 z-10 flex items-center gap-3 sm:inset-x-6 sm:bottom-8"
      >
        <div className="relative flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15 shadow-md">
          {card.cover ? (
            <Image
              src={card.cover}
              alt={card.bookTitle}
              fill
              sizes="44px"
              loading={near ? "eager" : undefined}
              className="object-cover"
            />
          ) : (
            <BookOpen size={18} className="text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{card.bookTitle}</p>
          <p className="truncate text-xs text-white/55">
            {t("byline", { author: card.bookAuthor, subject: card.bookSubject })}
          </p>
        </div>
      </motion.div>

      {/* Whole-card link → studybook detail (same page an Explore card opens).
          Only the active (in-view) card is focusable/clickable. */}
      <Link
        href={`/studybook/${card.bookSlug}`}
        aria-label={t("openBook", { title: card.bookTitle })}
        tabIndex={active ? 0 : -1}
        className={`absolute inset-0 z-20 ${active ? "" : "pointer-events-none"}`}
      />
    </div>
  );
}

// Memoized so navigating re-renders only the cards whose `active`/`near` flags
// flipped (~4) instead of the whole feed — keeps arrow/swipe response instant.
export default memo(FeedCard);
