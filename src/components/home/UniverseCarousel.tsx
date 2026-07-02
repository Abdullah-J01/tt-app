"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { CardRail, ContentCard, Pill } from "@/components/ui";
import type { Studybook } from "@/types";

/**
 * "Freshly digitized" as a scroll-spun 3D spiral. Cards wind around a vertical
 * axis like a helix — fanning out horizontally and climbing vertically — and the
 * stage pins while you scroll a tall track. Scroll drives a floating `focus`
 * index; each card sits on the helix relative to it, so one card sweeps up to the
 * flat, front-centered focus while its neighbours spiral away and fade.
 *
 * The horizontal spread is responsive: tight on mobile (cards stay near centre),
 * wide and fanned on desktop. Under `prefers-reduced-motion` → plain rail.
 */

/** How many covers ride the spiral (maps 1:1 to cardImage1-5). */
const COUNT = 5;
/** Scroll distance (vh) to advance the spiral by one card. */
const PER_CARD_VH = 36;

// --- Helix geometry (all easily tunable) --------------------------------------
const CARD_W = 300; // px — focused card face
const CARD_H = 410;
const ANGLE = 40; // deg of revolution between adjacent cards
const DEPTH = 200; // px — how far the ring bows back
const PITCH = 74; // px — vertical climb per card (the "spiral")
const ROTY = 1; // 0 = faces flat, 1 = fully tangent (coverflow tilt)
const SCALE_STEP = 0.12;
const OPACITY_STEP = 0.3;

const cardImage = (i: number) => `/images/demoData/cardImage${(i % 5) + 1}.jpg`;
const formatPrice = (eur?: number) => (eur != null ? `${eur.toFixed(2)}€` : undefined);

function DrumCard({
  book,
  index,
  focus,
  spreadX,
}: {
  book: Studybook;
  index: number;
  focus: MotionValue<number>;
  /** Responsive horizontal radius of the helix. */
  spreadX: number;
}) {
  const transform = useTransform(focus, (f) => {
    const d = index - f; // signed distance from focus: 0 = centred
    const rad = (d * ANGLE * Math.PI) / 180;
    const x = Math.sin(rad) * spreadX; // fan out sideways
    const z = (Math.cos(rad) - 1) * DEPTH; // bow away from the viewer
    const y = d * PITCH; // climb → the spiral
    const roty = -d * ANGLE * ROTY; // face tangent to the ring
    const scale = Math.max(0.5, 1 - Math.abs(d) * SCALE_STEP);
    return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${roty}deg) scale(${scale})`;
  });
  const opacity = useTransform(focus, (f) =>
    Math.max(0, 1 - Math.abs(index - f) * OPACITY_STEP),
  );
  const zIndex = useTransform(focus, (f) => Math.round(100 - Math.abs(index - f) * 10));
  // Only the (near-)focused card is clickable, so dim cards don't swallow taps.
  const pointerEvents = useTransform(focus, (f) =>
    Math.abs(index - f) < 0.5 ? "auto" : "none",
  );

  const price = formatPrice(book.priceEur);

  return (
    <motion.div
      style={{
        transform,
        opacity,
        zIndex,
        width: CARD_W,
        height: CARD_H,
        left: "50%",
        top: "50%",
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
      }}
      className="absolute [transform-style:preserve-3d]"
    >
      <motion.div style={{ pointerEvents }} className="h-full w-full">
        <Link
          href={`/studybook/${book.slug}`}
          className="group relative block h-full w-full overflow-hidden rounded-card bg-ink shadow-lift ring-1 ring-black/5"
        >
          <Image
            src={cardImage(index)}
            alt={book.title}
            fill
            sizes="300px"
            className="object-cover"
          />
          {/* legibility scrim */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-display line-clamp-2 text-lg font-bold text-white">
              {book.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {price && (
                <Pill variant="solid">
                  <span className="font-medium opacity-80">from</span>
                  {price}
                </Pill>
              )}
              <span className="text-xs font-medium text-white/70">{book.category}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/** Motion-free fallback: the original horizontal rail of vertical cards. */
function Rail({ books }: { books: Studybook[] }) {
  return (
    <CardRail itemWidth="w-40 sm:w-48" label="Freshly digitized">
      {books.map((book, i) => (
        <ContentCard
          key={book.id}
          layout="vertical"
          href={`/studybook/${book.slug}`}
          title={book.title}
          description={book.synopsis}
          price={formatPrice(book.priceEur)}
          media={<Image src={cardImage(i)} alt={book.title} fill sizes="192px" />}
          tags={[
            { label: book.category, icon: <BookOpen aria-hidden /> },
            { label: book.author },
          ]}
        />
      ))}
    </CardRail>
  );
}

export function UniverseCarousel({ books }: { books: Studybook[] }) {
  const items = books.slice(0, COUNT);
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  // Horizontal radius of the helix — tight on mobile, wide on desktop.
  const [spreadX, setSpreadX] = useState(200);

  useEffect(() => {
    const compute = () =>
      setSpreadX(Math.max(120, Math.min(window.innerWidth * 0.3, 430)));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });
  // Small lead-in/out (hold the first & last card briefly), then smooth the spin.
  const raw = useTransform(scrollYProgress, [0.08, 0.92], [0, items.length - 1], {
    clamp: true,
  });
  const focus = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });

  useMotionValueEvent(focus, "change", (v) => {
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(v)));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  if (reduce) return <Rail books={books} />;

  return (
    <div
      ref={container}
      style={{ height: `calc(100vh + ${(items.length - 1) * PER_CARD_VH}vh)` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden [perspective:1300px]">
        {/* "universe" backdrop — a single soft violet glow (no hard ring). */}
        <div
          aria-hidden
          className="bg-violet/12 pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        />

        {/* the spiral stage */}
        <div className="relative h-0 w-0 [transform-style:preserve-3d]">
          {items.map((book, i) => (
            <DrumCard key={book.id} book={book} index={i} focus={focus} spreadX={spreadX} />
          ))}
        </div>

        {/* focused-card indicator */}
        <div
          className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 sm:flex"
          aria-hidden
        >
          {items.map((book, i) => (
            <span
              key={book.id}
              className={
                "h-2 w-2 rounded-full transition-all duration-300 " +
                (i === active ? "bg-violet scale-125" : "bg-ink/15")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
