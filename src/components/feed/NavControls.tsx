"use client";

import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
};

export default function NavControls({ index, total, onPrev, onNext, onSelect }: Props) {
  return (
    <div className="absolute top-1/2 left-6 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex xl:left-10">
      <motion.button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        whileHover={index !== 0 ? { scale: 1.08 } : {}}
        whileTap={index !== 0 ? { scale: 0.94 } : {}}
        aria-label="Previous card"
        className="shadow-lift text-ink flex h-11 w-11 items-center justify-center rounded-full bg-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronUp size={20} />
      </motion.button>

      {/* <div className="flex flex-col items-center gap-2 py-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Go to card ${i + 1}`}
            aria-current={i === index}
            className="relative w-2.5 h-2.5 flex items-center justify-center"
          >
            <motion.span
              animate={{
                scale: i === index ? 1 : 0.55,
                opacity: i === index ? 1 : 0.35,
              }}
              transition={{ duration: 0.3 }}
              className="w-2.5 h-2.5 rounded-full bg-ink block"
            />
          </button>
        ))}
      </div> */}

      <motion.button
        type="button"
        onClick={onNext}
        disabled={index === total - 1}
        whileHover={index !== total - 1 ? { scale: 1.08 } : {}}
        whileTap={index !== total - 1 ? { scale: 0.94 } : {}}
        aria-label="Next card"
        className="shadow-lift text-ink flex h-11 w-11 items-center justify-center rounded-full bg-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronDown size={20} />
      </motion.button>
    </div>
  );
}
