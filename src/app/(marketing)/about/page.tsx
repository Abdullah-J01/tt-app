"use client";

import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Sparkles, Target, Users, BookOpenCheck, Quote } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import BackgroundGradient from "@/components/home/BackgroundGradient";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1.6, bounce: 0 });
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`;
    });
  }, [display, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function AboutPage() {
  const t = useTranslations("app_marketing_about_page");

  const stats = [
    { label: t("statLearners"), value: 12000, suffix: "+" },
    { label: t("statStudybooks"), value: 4300, suffix: "+" },
    { label: t("statCards"), value: 86000, suffix: "+" },
    { label: t("statStreak"), value: 11, suffix: t("daysSuffix") },
  ];

  const values = [
    {
      icon: Sparkles,
      title: t("value1Title"),
      body: t("value1Body"),
    },
    {
      icon: Target,
      title: t("value2Title"),
      body: t("value2Body"),
    },
    {
      icon: BookOpenCheck,
      title: t("value3Title"),
      body: t("value3Body"),
    },
    {
      icon: Users,
      title: t("value4Title"),
      body: t("value4Body"),
    },
  ];

  const timeline = [
    {
      year: "2022",
      title: t("timeline1Title"),
      body: t("timeline1Body"),
    },
    {
      year: "2023",
      title: t("timeline2Title"),
      body: t("timeline2Body"),
    },
    {
      year: "2024",
      title: t("timeline3Title"),
      body: t("timeline3Body"),
    },
    {
      year: "2026",
      title: t("timeline4Title"),
      body: t("timeline4Body"),
    },
  ];

  return (
    <main className="relative min-h-screen bg-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-40 pb-24 sm:px-6 sm:pt-48 lg:px-8">
        <BackgroundGradient />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-caption text-violet mb-4 font-semibold tracking-widest uppercase"
        >
          {t("eyebrow")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-h1 text-ink max-w-3xl sm:text-[3.25rem]"
        >
          {t("titleMain")}
          <span className="text-gradient-violet"> {t("titleAccent")}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-body text-muted mt-6 max-w-xl"
        >
          {t("subtitle")}
        </motion.p>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl2 border-border shadow-soft border bg-white p-5 sm:p-6"
            >
              <p className="font-display text-ink text-2xl font-semibold sm:text-3xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-caption text-muted mt-1.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-h2 text-ink mb-10 sm:text-3xl"
        >
          {t("valuesHeading")}
        </motion.h2>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-xl2 border-border bg-violet-tint/40 hover:shadow-lift border p-6 transition-shadow duration-400 sm:p-7"
            >
              <div className="bg-violet/10 mb-4 flex h-10 w-10 items-center justify-center rounded-full">
                <v.icon size={18} className="text-violet" />
              </div>
              <h3 className="font-display text-h3 text-ink mb-1.5">{v.title}</h3>
              <p className="text-body text-muted">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-h2 text-ink mb-10 sm:text-3xl"
        >
          {t("timelineHeading")}
        </motion.h2>
        <div className="relative pl-8 sm:pl-10">
          <div className="bg-border absolute top-2 bottom-2 left-[7px] w-px sm:left-[9px]" />
          {timeline.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative pb-12 last:pb-0"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.15, type: "spring" }}
                className="bg-violet ring-violet-tint absolute top-1 -left-8 h-4 w-4 rounded-full ring-4 sm:-left-10"
              />
              <p className="text-caption text-violet mb-1 font-semibold tracking-wider uppercase">
                {item.year}
              </p>
              <h3 className="font-display text-h3 text-ink mb-1.5">{item.title}</h3>
              <p className="text-body text-muted max-w-xl">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-4 pb-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="rounded-xl3 bg-plum-gradient relative overflow-hidden p-8 text-center sm:p-12"
        >
          <motion.div
            aria-hidden="true"
            className="absolute h-56 w-56 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "-3rem", left: "-3rem" }}
          />
          <Quote className="mx-auto mb-4 text-white/50" size={28} />
          <p className="font-display relative z-10 mx-auto max-w-2xl text-xl leading-snug text-white sm:text-2xl">
            {t("quote")}
          </p>
          <p className="text-caption relative z-10 mt-4 text-white/60">
            {t("quoteAuthor")}
          </p>
        </motion.div>
      </section>
    </main>
  );
}
