"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import BackgroundGradient from "@/components/home/BackgroundGradient";

const terms = [
  {
    title: "1. Using StudyBooks",
    body: "You must be at least 13 years old to create a StudyBooks account. You're responsible for keeping your login credentials secure and for all activity that happens under your account. Don't use StudyBooks for anything illegal, or in a way that disrupts the service for other learners.",
  },
  {
    title: "2. Your content and our license",
    body: "Any notes, highlights, or lists you create remain yours. By using StudyBooks, you grant us a limited license to store and display that content back to you, and — only if you explicitly choose to share it — to other users.",
  },
  {
    title: "3. Studybook licensing",
    body: "Card content is drawn from studybooks we've licensed from authors and publishers. You may not copy, redistribute, or resell card content outside the app. Screenshots for personal, non-commercial sharing are fine.",
  },
  {
    title: "4. Subscriptions and billing",
    body: "Premium plans renew automatically at the end of each billing cycle unless cancelled beforehand. Prices are shown in your local currency at checkout and may change with 30 days' notice for existing subscribers.",
  },
  {
    title: "5. Cancellations and refunds",
    body: "You can cancel anytime from Settings — you'll keep access until the end of your current billing period. Refunds are handled case-by-case; contact support within 14 days of a charge if something went wrong.",
  },
  {
    title: "6. Termination",
    body: "We may suspend or terminate accounts that violate these terms, misuse the platform, or attempt to extract card content at scale. You can delete your account at any time from Settings.",
  },
  {
    title: "7. Disclaimers",
    body: 'StudyBooks is provided "as is." We work hard to keep the catalog accurate, but we don\'t guarantee that every summary is complete or error-free — cards are meant to spark curiosity, not replace the full studybook.',
  },
  {
    title: "8. Changes to these terms",
    body: "We may update these terms as the product evolves. We'll notify you of material changes by email or in-app notice before they take effect.",
  },
];

export default function TermsPage() {
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

      <section className="relative mx-auto max-w-4xl overflow-hidden px-5 pt-40 pb-16 sm:px-8 sm:pt-48">
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
          Terms of Service
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-body text-muted mt-4 max-w-lg"
        >
          Last updated July 1, 2026. The short version: be decent, don&apos;t resell our content,
          and we&apos;ll keep building the best five minutes of your day.
        </motion.p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-28 sm:px-8">
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
                <button
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
                </button>
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
          Questions about these terms? Reach us at{" "}
          <a href="/contact" className="text-violet hover:underline">
            our contact page
          </a>
          .
        </motion.p>
      </section>

    </main>
  );
}
