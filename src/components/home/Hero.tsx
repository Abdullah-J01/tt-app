"use client";
import Link from "next/link";
import { useTranslations } from "@/i18n/client";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AnimatedHeadline from "./AnimatedHeadline";
import PhoneMockup from "./PhoneMockup";
import FloatingCircle from "./FloatingCircle";
import BackgroundGradient from "./BackgroundGradient";

export default function Hero() {
  const t = useTranslations("components_home_Hero");
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
            {t("badge")}
          </motion.p>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-body text-muted mt-6 max-w-md"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/onboarding">
              <Button size="lg">{t("getStarted")}</Button>
            </Link>
            <Link href="/feed">
              <Button size="lg" variant="secondary">
                {t("seeFeed")}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <Button
              unstyled
              className="group text-ink hover:text-violet inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <PlayCircle
                size={20}
                className="transition-transform duration-300 group-hover:rotate-[20deg]"
              />
              {t("howItWorks")}
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="text-caption text-muted mt-10"
          >
            {t("socialProof")}
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
