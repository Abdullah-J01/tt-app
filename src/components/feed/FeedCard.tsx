"use client";

import { motion } from "framer-motion";
import { Flame, Zap, BookOpen } from "lucide-react";
import type { FeedCardData } from "./feedData";

type Props = {
  card: FeedCardData;
  active: boolean;
};

export default function FeedCard({ card, active }: Props) {
  return (
    <div
      className="relative w-full h-full bg-plum-gradient overflow-hidden select-none"
      role="group"
      aria-roledescription="slide"
      aria-label={card.title}
    >
      {/* animated ambient blur blobs */}
      <motion.div
        aria-hidden="true"
        className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
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
        className="absolute w-72 h-72 rounded-full bg-white/5 blur-3xl"
        animate={
          active
            ? { x: [0, -40, 25, 0], y: [0, 30, -20, 0], opacity: [0.15, 0.3, 0.15, 0.15] }
            : {}
        }
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "-5rem", right: "-4rem" }}
      />

      {/* top badges */}
      <div className="absolute top-5 sm:top-7 inset-x-5 sm:inset-x-7 flex items-center justify-between z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-white text-xs font-medium"
        >
          <Flame size={13} className="text-amber fill-amber" />
          {card.streakDays}-day streak
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-white/90 text-xs font-medium"
        >
          <Zap size={12} className="fill-white/90" />
          {card.subject} · {card.grade}
        </motion.div>
      </div>

      {/* main content */}
      <div className="absolute inset-x-5 sm:inset-x-8 top-[38%] sm:top-[40%] -translate-y-1/2 z-10">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/55 text-[11px] font-semibold uppercase tracking-[0.15em] mb-3"
        >
          Did you know
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-white font-semibold text-2xl sm:text-3xl leading-snug mb-4"
        >
          {card.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="text-white/70 text-sm sm:text-[15px] leading-relaxed max-w-md"
        >
          {card.description}
        </motion.p>
      </div>

      {/* book author row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="absolute bottom-6 sm:bottom-8 inset-x-5 sm:inset-x-8 flex items-center gap-3 z-10"
      >
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <BookOpen size={17} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {card.bookTitle}
          </p>
          <p className="text-white/55 text-xs truncate">
            by {card.bookAuthor} · {card.bookSubject}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
