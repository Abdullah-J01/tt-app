"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, SlidersHorizontal } from "lucide-react";
import type { FeedCardData } from "./feedData";

type Props = {
  card: FeedCardData;
  active: boolean;
  /** Opens the feed filter drawer; the icon only renders as a button when set. */
  onOpenFilters?: () => void;
  /** Number of applied filters — shown as a badge on the filter button. */
  filterCount?: number;
};

export default function FeedCard({ card, active, onOpenFilters, filterCount = 0 }: Props) {
  return (
    <div
      className="bg-plum-gradient relative h-full w-full overflow-hidden select-none"
      role="group"
      aria-roledescription="slide"
      aria-label={card.title}
    >
      {/* animated ambient blur blobs */}
      <motion.div
        aria-hidden="true"
        className="absolute h-64 w-64 rounded-full bg-white/10 blur-3xl"
        animate={
          active ? { x: [0, 50, -20, 0], y: [0, -40, 20, 0], opacity: [0.25, 0.4, 0.2, 0.25] } : {}
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-4rem", left: "-3rem" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute h-72 w-72 rounded-full bg-white/5 blur-3xl"
        animate={
          active ? { x: [0, -40, 25, 0], y: [0, 30, -20, 0], opacity: [0.15, 0.3, 0.15, 0.15] } : {}
        }
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "-5rem", right: "-4rem" }}
      />

      {/* top badges */}
      <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between sm:inset-x-7 sm:top-7">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
        >
          <Flame size={13} className="text-amber fill-amber" />
          {card.streakDays}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md"
        >
          <Zap size={12} className="fill-white/90" />
          {card.subject} · {card.grade}
        </motion.div>
      </div>

      {/* main content */}
      <div className="absolute inset-x-5 top-[38%] z-10 -translate-y-1/2 sm:inset-x-8 sm:top-[40%]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-white/55 uppercase"
        >
          Did you know
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mb-4 text-2xl leading-snug font-semibold text-white sm:text-3xl"
        >
          {card.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]"
        >
          {card.description}
        </motion.p>
      </div>

      {/* book author row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="absolute inset-x-5 bottom-6 z-10 flex items-center gap-3 sm:inset-x-8 sm:bottom-8"
      >
        <div className="relative flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15 shadow-md">
          {card.cover ? (
            <Image
              src={card.cover}
              alt={card.bookTitle}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <BookOpen size={18} className="text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{card.bookTitle}</p>
          <p className="truncate text-xs text-white/55">
            by {card.bookAuthor} · {card.bookSubject}
          </p>
        </div>
      </motion.div>

      {/* Whole-card link → studybook detail (same page an Explore card opens).
          Only the active (in-view) card is focusable/clickable. */}
      <Link
        href={`/studybook/${card.bookSlug}`}
        aria-label={`Open ${card.bookTitle}`}
        tabIndex={active ? 0 : -1}
        className={`absolute inset-0 z-20 ${active ? "" : "pointer-events-none"}`}
      />
    </div>
  );
}