"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/client";
import { Globe2 } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ContentCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { STUDY_BITES, type StudyBite } from "@/config/studyBites";

/**
 * "New study bites" as a scroll-stacked deck: each card pins near the top, and
 * as the next card scrolls up to cover it the covered card recedes (scale + a
 * soft scrim), leaving its top edge peeking. Built on CSS `position: sticky` +
 * framer-motion scroll progress — no pinning/DOM re-parenting, and the whole
 * effect is dropped under `prefers-reduced-motion` (cards become a plain list).
 */

/** Scroll travel between each card joining the stack — tight, so cards stay in
 *  view together (and you see them un-stack again on the way back up). Tighter
 *  on mobile, where tall viewports would turn vh gaps into big empty stretches. */
const GAP_CLASSES = "mb-[6vh] sm:mb-[14vh]";
/** Trailing scrub room after the last card. Keeps the container taller than the
 *  viewport (so scroll progress spans 0→1 on any screen) without padding the gap
 *  between every card — the one empty stretch sits below the fully-formed deck. */
const TAIL_CLASSES = "pb-[8vh] sm:pb-[18vh]";
/** Sticky offset: clear the fixed navbar (base) + step down per card (peek). */
const TOP_BASE = "6.5rem";
const TOP_STEP_REM = 1.25;

const formatPrice = (eur: number) => `${eur.toFixed(2)}€`;

function StackCard({
  bite,
  index,
  total,
  progress,
  reduce,
}: {
  bite: StudyBite;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const t = useTranslations("components_home_StackingStudyBites");
  const tb = useTranslations("studyBites");
  const tCat = useTranslations("catalog");
  const title = tb(`${bite.slug}.title`);
  const description = tb(`${bite.slug}.description`);
  const isLast = index === total - 1;
  // Deeper in the deck → recedes to a smaller final scale; the top card stays 1.
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  // A soft ink scrim fades in over covered cards for depth (never the top card).
  const scrim = useTransform(progress, [index / total, 1], [0, isLast ? 0 : 0.14]);

  return (
    <div
      className={
        reduce
          ? "mb-5"
          : cn("sticky flex justify-center", !isLast && GAP_CLASSES)
      }
      style={
        reduce
          ? undefined
          : { top: `calc(${TOP_BASE} + ${index * TOP_STEP_REM}rem)` }
      }
    >
      <motion.div
        style={reduce ? undefined : { scale }}
        className="relative w-full origin-top"
      >
        <ContentCard
          layout="horizontal"
          href={`/studybook/${bite.slug}`}
          title={title}
          description={description}
          price={formatPrice(bite.priceEur)}
          pricePrefix={t("pricePrefix")}
          className="shadow-soft"
          media={
            bite.image ? (
              <Image src={bite.image} alt={title} fill sizes="112px" />
            ) : undefined
          }
          tags={[
            { label: tCat("category.studyBite"), icon: <Globe2 aria-hidden /> },
            { label: bite.publisher },
          ]}
        />
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ opacity: scrim }}
            className="rounded-card bg-ink pointer-events-none absolute inset-0"
          />
        )}
      </motion.div>
    </div>
  );
}

export function StackingStudyBites() {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={container}
      className={cn("mx-auto max-w-2xl", !reduce && TAIL_CLASSES)}
    >
      {STUDY_BITES.map((bite, i) => (
        <StackCard
          key={bite.slug}
          bite={bite}
          index={i}
          total={STUDY_BITES.length}
          progress={scrollYProgress}
          reduce={reduce}
        />
      ))}
    </div>
  );
}
