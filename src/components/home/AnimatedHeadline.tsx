"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const headlines = [
  "Learn something new in the time it takes to scroll.",
  "Understand difficult ideas in seconds, not hours.",
  "Master concepts quickly, one card at a time.",
  "Build a reading habit that actually sticks.",
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.014 },
  },
  exit: {
    transition: { staggerChildren: 0.008, staggerDirection: -1 },
  },
};

const letter = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(8px)",
    transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] },
  },
};

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % headlines.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const words = headlines[index].split(" ");

  return (
    <h1 className="font-display text-h1 sm:text-[3.25rem] text-ink max-w-xl min-h-[7.5rem] sm:min-h-[8.5rem]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          className="inline"
        >
          {words.map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {word.split("").map((char, ci) => (
                <motion.span
                  key={ci}
                  variants={letter}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}
