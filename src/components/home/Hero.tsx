"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import AnimatedHeadline from "./AnimatedHeadline";
import PhoneMockup from "./PhoneMockup";
import FloatingCircle from "./FloatingCircle";
import BackgroundGradient from "./BackgroundGradient";

export default function Hero() {
  return (
    <section className="relative pt-36 sm:pt-44 pb-20 px-5 sm:px-8 max-w-7xl mx-auto overflow-hidden">
      <BackgroundGradient />
      {/* <FloatingCircle /> */}

      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left column */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-caption font-semibold uppercase tracking-widest text-violet mb-4"
          >
            Bite-sized learning
          </motion.p>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-body text-muted max-w-md mt-6"
          >
            A vertical feed of short, beautifully designed cards drawn from real
            studybooks. Save what matters. Build a daily habit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <button className="group inline-flex items-center gap-2 text-ink font-medium text-sm hover:text-violet transition-colors">
              <PlayCircle
                size={20}
                className="group-hover:rotate-[20deg] transition-transform duration-300"
              />
              How it works
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-10 text-caption text-muted"
          >
            12,000+ learners building streaks
          </motion.div>
        </div>

        {/* Right column */}
        <div className="relative">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
