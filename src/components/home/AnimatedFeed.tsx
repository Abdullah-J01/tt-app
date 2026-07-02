"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Bookmark, Share2, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Card = {
  category: string;
  title: string;
  book: string;
  author: string;
  gradient: string;
  progress: number;
};

const cards: Card[] = [
  {
    category: "Physics",
    title: "Sunlight is 8½ minutes old when it reaches you.",
    book: "Everyday Astronomy",
    author: "E.V.F",
    gradient: "from-[#483666] to-[#7A6A9E]",
    progress: 62,
  },
  {
    category: "Biology",
    title: "Octopuses have three hearts and blue blood.",
    book: "Life Under the Sea",
    author: "R. Tamm",
    gradient: "from-[#2F8F4E] to-[#6BC98A]",
    progress: 34,
  },
  {
    category: "History",
    title: "The Great Wall isn't visible from space.",
    book: "Myths We Believe",
    author: "K. Isaac",
    gradient: "from-[#5A3ED0] to-[#9C85F0]",
    progress: 81,
  },
  {
    category: "Psychology",
    title: "Habits form faster when tied to an existing routine.",
    book: "The Shape of Habit",
    author: "M. Kask",
    gradient: "from-[#B0793B] to-[#F4A93B]",
    progress: 20,
  },
];

export default function AnimatedFeed() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % cards.length);
      setLiked(false);
      setSaved(false);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  const card = cards[index];
  if (!card) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} flex flex-col justify-between overflow-hidden p-5`}
        >
          {/* animated moving blur blobs */}
          <motion.div
            aria-hidden="true"
            className="absolute h-40 w-40 rounded-full bg-white/20 blur-3xl"
            animate={{
              x: [0, 40, -10, 0],
              y: [0, -30, 20, 0],
              opacity: [0.3, 0.5, 0.25, 0.3],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "-2rem", left: "-2rem" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute h-32 w-32 rounded-full bg-white/10 blur-2xl"
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 24, -16, 0],
              opacity: [0.2, 0.4, 0.2, 0.2],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "-1rem", right: "-1rem" }}
          />

          {/* top: category */}
          <div className="relative z-10 flex items-center gap-1.5 text-xs font-medium text-white/90">
            <Zap size={13} className="fill-white/90" />
            {card.category}
          </div>

          {/* middle: title */}
          <div className="relative z-10">
            <p className="mb-1.5 text-[10px] font-medium tracking-wider text-white/60 uppercase">
              Did you know
            </p>
            <p className="font-display text-xl leading-snug font-semibold text-white">
              {card.title}
            </p>
          </div>

          {/* bottom: book + actions */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex max-w-[65%] items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/25 text-[10px] font-semibold text-white">
                {card.book[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{card.book}</p>
                <p className="truncate text-[10px] text-white/60">{card.author}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                unstyled
                aria-label="Like"
                onClick={() => setLiked((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-90"
              >
                <Heart size={16} className={liked ? "fill-rose-500 text-rose-500" : "text-ink"} />
              </Button>
              <Button
                unstyled
                aria-label="Bookmark"
                onClick={() => setSaved((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform active:scale-90"
              >
                <Bookmark size={15} className={saved ? "fill-white text-white" : "text-white"} />
              </Button>
              <Button
                unstyled
                aria-label="Share"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform active:scale-90"
              >
                <Share2 size={15} className="text-white" />
              </Button>
            </div>
          </div>

          {/* progress bar */}
          <div className="relative z-10 mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${card.progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
