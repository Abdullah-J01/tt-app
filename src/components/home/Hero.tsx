"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AnimatedHeadline from "./AnimatedHeadline";
import PhoneMockup from "./PhoneMockup";
import FloatingCircle from "./FloatingCircle";
import BackgroundGradient from "./BackgroundGradient";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pt-36 pb-20 sm:px-8 sm:pt-44">
      <BackgroundGradient />
      {/* <FloatingCircle /> */}

      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Left column */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-caption bg-violet-tint text-violet mb-5 inline-block rounded-full px-3 py-1 font-semibold tracking-widest uppercase"
          >
            Bite-sized learning
          </motion.p>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-body text-muted mt-6 max-w-md"
          >
            A vertical feed of short, beautifully designed cards drawn from real studybooks. Save
            what matters. Build a daily habit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/onboarding">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/feed">
              <Button size="lg" variant="secondary">
                See the feed
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <button className="group text-ink hover:text-violet inline-flex items-center gap-2 text-sm font-medium transition-colors">
              <PlayCircle
                size={20}
                className="transition-transform duration-300 group-hover:rotate-[20deg]"
              />
              How it works
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="text-caption text-muted mt-10"
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
