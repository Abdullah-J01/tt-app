"use client";

import { motion } from "framer-motion";

export default function FloatingCircle() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 top-10 sm:right-4 sm:top-16 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-white"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.6), 0 30px 80px rgba(108,76,227,0.25), 0 0 120px rgba(255,255,255,0.8)",
      }}
      animate={{
        y: [0, -28, 0, 18, 0],
        scale: [1, 1.06, 1, 0.97, 1],
        opacity: [0.9, 1, 0.95, 1, 0.9],
      }}
      transition={{
        duration: 11,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
