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
import { coverOrArt, type DeckBook } from "./deckBook";

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

/** Most catalogue books are free — only the gated ones carry a price pill. */
const formatPrice = (eur?: number) => (eur != null ? `${eur.toFixed(2)}€` : undefined);
/** Fallback art for books with no cover of their own (see `coverOrArt`). */
const BITE_ART = [1, 2, 3, 4].map((n) => `/images/demoData/demoImage${n}.jpg`);

function StackCard({
  book,
  index,
  total,
  progress,
  reduce,
}: {
  book: DeckBook;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const t = useTranslations("components_home_StackingStudyBites");
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
          href={`/studybook/${book.slug}`}
          title={book.title}
          description={book.synopsis}
          price={formatPrice(book.priceEur)}
          pricePrefix={t("pricePrefix")}
          className="shadow-soft"
          media={
            <Image
              src={coverOrArt(book, index, BITE_ART)}
              alt={book.title}
              fill
              sizes="(min-width: 640px) 112px, 96px"
            />
          }
          tags={[
            { label: book.category, icon: <Globe2 aria-hidden /> },
            { label: book.author },
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

export function StackingStudyBites({ books }: { books: DeckBook[] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // No books (an upstream hiccup) → no deck. The stack maths divides by `total`,
  // so an empty deck would be NaN transforms rather than an empty section.
  if (books.length === 0) return null;

  return (
    <div
      ref={container}
      className={cn("mx-auto max-w-2xl", !reduce && TAIL_CLASSES)}
    >
      {books.map((book, i) => (
        <StackCard
          key={book.id}
          book={book}
          index={i}
          total={books.length}
          progress={scrollYProgress}
          reduce={reduce}
        />
      ))}
    </div>
  );
}
