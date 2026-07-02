"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import BackgroundGradient from "@/components/home/BackgroundGradient";

const sections = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: [
      "We collect the information you give us directly — your name, email address, and any reading preferences you set up when you create a StudyBooks account.",
      "We also collect usage data automatically: which cards you read, how long you spend on them, and your streak history. This helps us build a feed that actually fits how you learn.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    body: [
      "Your data powers the core product: personalizing your feed, tracking your streak, and syncing your progress across devices.",
      "We use aggregated, de-identified usage data to improve card design and decide which studybooks to license next. We never sell your personal data to advertisers.",
    ],
  },
  {
    id: "sharing",
    title: "When we share information",
    body: [
      "We share data with service providers who help us run StudyBooks — hosting, analytics, and customer support tools — under contracts that limit what they can do with it.",
      "We may disclose information if required by law, or to protect the rights, property, or safety of StudyBooks, our users, or the public.",
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    body: [
      "You can access, correct, or delete your account data at any time from Settings, or by contacting us directly.",
      "Depending on where you live, you may have additional rights under laws like the GDPR or CCPA — including the right to data portability and the right to object to certain processing.",
    ],
  },
  {
    id: "security",
    title: "How we protect your data",
    body: [
      "We use industry-standard encryption in transit and at rest, and limit internal access to personal data on a need-to-know basis.",
      "No method of transmission or storage is 100% secure, so while we work hard to protect your information, we can't guarantee absolute security.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We'll update this page if our practices change, and for material changes we'll let you know via email or an in-app notice before they take effect.",
    ],
  },
];

export default function PrivacyPage() {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative min-h-screen bg-white">
      <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pt-40 pb-16 sm:px-8 sm:pt-48">
        <BackgroundGradient />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-violet-tint mb-5 flex h-12 w-12 items-center justify-center rounded-full"
        >
          <ShieldCheck size={20} className="text-violet" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-h1 text-ink sm:text-[3rem]"
        >
          Privacy Policy
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-body text-muted mt-4 max-w-lg"
        >
          Last updated July 1, 2026. This explains what we collect, why, and the choices you have.
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="relative block py-2 pl-4 text-sm">
                  {active === s.id && (
                    <motion.span
                      layoutId="privacy-toc-indicator"
                      className="bg-violet absolute top-0 bottom-0 left-0 w-0.5 rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 32 }}
                    />
                  )}
                  <span
                    className={
                      active === s.id
                        ? "text-ink font-medium"
                        : "text-muted hover:text-ink transition-colors"
                    }
                  >
                    {s.title}
                  </span>
                </a>
              ))}
            </div>
          </aside>

          {/* Sections */}
          <div className="max-w-2xl space-y-16">
            {sections.map((s, i) => (
              <motion.section
                key={s.id}
                id={s.id}
                ref={(el) => {
                  refs.current[s.id] = el;
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-32"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-caption text-violet w-6 font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-h2 text-ink sm:text-2xl">{s.title}</h2>
                </div>
                <div className="space-y-3 pl-9">
                  {s.body.map((p, pi) => (
                    <p key={pi} className="text-body text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="border-border border-t pt-4 pl-9"
            >
              <p className="text-caption text-muted">
                Questions about this policy? Reach us at{" "}
                <a href="/contact" className="text-violet hover:underline">
                  our contact page
                </a>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </section>

    </main>
  );
}
