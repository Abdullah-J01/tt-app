"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import BackgroundGradient from "@/components/home/BackgroundGradient";
import { Button } from "@/components/ui/Button";

export default function TermsPage() {
  const t = useTranslations("app_marketing_terms_page");

  const terms = [
    { title: t("s1Title"), body: t("s1Body") },
    { title: t("s2Title"), body: t("s2Body") },
    { title: t("s3Title"), body: t("s3Body") },
    { title: t("s4Title"), body: t("s4Body") },
    { title: t("s5Title"), body: t("s5Body") },
    { title: t("s6Title"), body: t("s6Body") },
    { title: t("s7Title"), body: t("s7Body") },
    { title: t("s8Title"), body: t("s8Body") },
  ];

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="relative min-h-screen bg-white">
      {/* Reading progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="bg-violet fixed top-0 right-0 left-0 z-[60] h-1 origin-left"
      />

      <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pt-40 pb-16 sm:px-6 sm:pt-48 lg:px-8">
        <BackgroundGradient />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-violet-tint mb-5 flex h-12 w-12 items-center justify-center rounded-full"
        >
          <FileText size={20} className="text-violet" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-h1 text-ink sm:text-[3rem]"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-body text-muted mt-4 max-w-lg"
        >
          {t("subtitle")}
        </motion.p>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-28 sm:px-6 lg:px-8">
        <div className="rounded-xl3 border-border divide-border shadow-soft divide-y overflow-hidden border">
          {terms.map((t, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                className="bg-white"
              >
                <Button
                  unstyled
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="hover:bg-violet-tint/30 flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-h3 text-ink">{t.title}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-violet-tint flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  >
                    <ChevronDown size={15} className="text-violet" />
                  </motion.span>
                </Button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-body text-muted max-w-2xl px-6 pb-6">{t.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-caption text-muted mt-8"
        >
          {t.rich("questions", {
            link: (chunks) => (
              <Link href="/contact" className="text-violet hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </motion.p>
      </section>
    </main>
  );
}
