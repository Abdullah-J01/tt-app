"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/client";

/** Smooth scalloped ("wavy") ring path — subtle organic inner ring. */
function wavyPath(bumps = 8, rBase = 88, rBump = 5, size = 200) {
  const c = size / 2;
  const steps = bumps * 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = rBase + (i % 2 === 0 ? rBump : -rBump);
    pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r]);
  }
  const mid = (p: [number, number], q: [number, number]): [number, number] => [
    (p[0] + q[0]) / 2,
    (p[1] + q[1]) / 2,
  ];
  const n = pts.length;
  let d = `M ${mid(pts[n - 1]!, pts[0]!).join(" ")} `;
  for (let i = 0; i < n; i++) {
    const cur = pts[i]!;
    const m = mid(cur, pts[(i + 1) % n]!);
    d += `Q ${cur[0]} ${cur[1]} ${m[0]} ${m[1]} `;
  }
  return `${d}Z`;
}

const WAVY = wavyPath();

/**
 * Landing hero — a centred, layered wordmark over a soft violet glow, framed by
 * concentric rings (an organic wavy ring + a slowly rotating dashed ring with an
 * orbiting dot). Our take on the Deepstash-style hero, in the brand palette.
 */
export default function NoiseHero() {
  const t = useTranslations("components_home_NoiseHero");
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-surface px-6">
      {/* Soft violet glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(108,76,227,0.34) 0%, rgba(108,76,227,0.12) 42%, transparent 70%)",
        }}
      />

      {/* Concentric rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {/* Organic wavy inner ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2"
        >
          <path d={WAVY} fill="none" stroke="#6c4ce3" strokeOpacity={0.35} strokeWidth={1} />
        </svg>

        {/* Rotating dashed outer ring with an orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          className="relative h-[46rem] w-[46rem] rounded-full border border-dashed border-violet/25"
        >
          <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet shadow-[0_0_16px_rgba(108,76,227,0.6)]" />
        </motion.div>
      </div>

      {/* Layered headline */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center"
      >
        <h1 className="font-display font-extrabold uppercase leading-[0.82] tracking-tight">
          <span className="block text-5xl text-ink sm:text-7xl md:text-8xl">{t("learn")}</span>
          <span className="-mt-2 block text-5xl text-violet/25 sm:-mt-4 sm:text-7xl md:text-8xl">
            {t("somethingNew")}
          </span>
        </h1>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-muted sm:text-sm">
          {t("tagline")}
        </p>
      </motion.div>
    </section>
  );
}
