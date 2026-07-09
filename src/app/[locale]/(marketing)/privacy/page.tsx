"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import BackgroundGradient from "@/components/home/BackgroundGradient";

export default function PrivacyPage() {
  const t = useTranslations("app_marketing_privacy_page");

  const sections = [
    {
      id: "information-we-collect",
      title: t("s1Title"),
      body: [t("s1Body1"), t("s1Body2")],
    },
    {
      id: "how-we-use-it",
      title: t("s2Title"),
      body: [t("s2Body1"), t("s2Body2")],
    },
    {
      id: "sharing",
      title: t("s3Title"),
      body: [t("s3Body1"), t("s3Body2")],
    },
    {
      id: "your-choices",
      title: t("s4Title"),
      body: [t("s4Body1"), t("s4Body2")],
    },
    {
      id: "security",
      title: t("s5Title"),
      body: [t("s5Body1"), t("s5Body2")],
    },
    {
      id: "changes",
      title: t("s6Title"),
      body: [t("s6Body1")],
    },
  ];

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
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-40 pb-16 sm:px-6 sm:pt-48 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
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
                {t.rich("questions", {
                  link: (chunks) => (
                    <Link href="/contact" className="text-violet hover:underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
