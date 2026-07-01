"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Bookmark, Share2, Zap } from "lucide-react";

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

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} flex flex-col justify-between p-5 overflow-hidden`}
        >
          {/* animated moving blur blobs */}
          <motion.div
            aria-hidden="true"
            className="absolute w-40 h-40 rounded-full bg-white/20 blur-3xl"
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
            className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl"
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 24, -16, 0],
              opacity: [0.2, 0.4, 0.2, 0.2],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "-1rem", right: "-1rem" }}
          />

          {/* top: category */}
          <div className="relative z-10 flex items-center gap-1.5 text-white/90 text-xs font-medium">
            <Zap size={13} className="fill-white/90" />
            {card.category}
          </div>

          {/* middle: title */}
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1.5 font-medium">
              Did you know
            </p>
            <p className="text-white font-display font-semibold text-xl leading-snug">
              {card.title}
            </p>
          </div>

          {/* bottom: book + actions */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex items-center gap-2 max-w-[65%]">
              <div className="w-7 h-7 rounded-md bg-white/25 flex items-center justify-center text-[10px] text-white font-semibold shrink-0">
                {card.book[0]}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {card.book}
                </p>
                <p className="text-white/60 text-[10px] truncate">
                  {card.author}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                aria-label="Like"
                onClick={() => setLiked((v) => !v)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Heart
                  size={16}
                  className={liked ? "fill-rose-500 text-rose-500" : "text-ink"}
                />
              </button>
              <button
                aria-label="Bookmark"
                onClick={() => setSaved((v) => !v)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Bookmark
                  size={15}
                  className={saved ? "fill-white text-white" : "text-white"}
                />
              </button>
              <button
                aria-label="Share"
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Share2 size={15} className="text-white" />
              </button>
            </div>
          </div>

          {/* progress bar */}
          <div className="relative z-10 h-0.5 w-full bg-white/20 rounded-full overflow-hidden mt-3">
            <motion.div
              className="h-full bg-white rounded-full"
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
