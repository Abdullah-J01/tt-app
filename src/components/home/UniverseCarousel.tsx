"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/i18n/Link";
import Image from "next/image";
import { useTranslations } from "@/i18n/client";
import { BookOpen } from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { CardRail, ContentCard, Pill } from "@/components/ui";
import type { Studybook } from "@/types";

/**
 * "Freshly digitized" as a scroll-spun 3D spiral. Cards wind around a vertical
 * axis like a helix — fanning out horizontally and climbing vertically. Scroll
 * drives a floating `focus` index; each card sits on the helix relative to it,
 * so one card sweeps up to the flat, front-centered focus while its neighbours
 * spiral away and fade.
 *
 * Desktop: the stage pins (sticky) while every card cycles through focus fully
 * on-screen, then unpins — the track is stage + scrub, no full extra viewport.
 * Mobile: no pinning at all (a pinned short stage shows blank track below it) —
 * the deck spins as the section rides through the viewport, so the section is
 * exactly deck-sized and leaves no gap to the next section.
 *
 * Robust for any COUNT: cards that revolve past 90° show their back, which
 * `backface-visibility: hidden` clips — so only the front arc is ever visible,
 * no matter how many cards ride the spiral. Under reduced-motion → plain rail.
 */

/** How many covers ride the spiral (images cycle cardImage1-5). */
const COUNT = 5;
/** Vertical anchor of the deck inside the pinned stage. The stage is sized to
 *  fit the deck, so the deck sits centred in it. */
const ANCHOR = "50%";
/** Breathing room (px) above + below the fanned deck inside the stage. */
const STAGE_PAD = 48;

// --- Helix geometry (all easily tunable) --------------------------------------
const ANGLE = 40; // deg of revolution between adjacent cards
const DEPTH = 200; // px — how far the ring bows back
const ROTY = 1; // 0 = faces flat, 1 = fully tangent (coverflow tilt)
const SCALE_STEP = 0.12;
const OPACITY_STEP = 0.3;

const cardImage = (i: number) => `/images/demoData/cardImage${(i % 5) + 1}.jpg`;
const formatPrice = (eur?: number) => (eur != null ? `${eur.toFixed(2)}€` : undefined);

interface Dims {
  cardW: number;
  cardH: number;
  /** Horizontal radius of the helix — smaller = more overlap ("negative spacing"). */
  spreadX: number;
  /** Vertical climb (px) per card — the "spiral". Tighter on mobile. */
  pitch: number;
  /** Height (px) of the stage — just tall enough for the fanned deck. */
  stageH: number;
  /** Desktop: pin the stage and scrub `perCard` px per swap. Mobile: no pin. */
  pin: boolean;
  /** Scroll distance (px) per card swap while pinned (desktop only). */
  perCard: number;
  /** Viewport height (px) at last measure — for the pinned progress mapping. */
  vpH: number;
}

function DrumCard({
  book,
  index,
  focus,
  dims,
}: {
  book: Studybook;
  index: number;
  focus: MotionValue<number>;
  dims: Dims;
}) {
  const t = useTranslations("components_home_UniverseCarousel");
  const { cardW, cardH, spreadX, pitch } = dims;

  const transform = useTransform(focus, (f) => {
    const d = index - f; // signed distance from focus: 0 = centred
    const rad = (d * ANGLE * Math.PI) / 180;
    const x = Math.sin(rad) * spreadX; // fan out sideways
    const z = (Math.cos(rad) - 1) * DEPTH; // bow away from the viewer
    const y = d * pitch; // climb → the spiral
    const roty = -d * ANGLE * ROTY; // face tangent to the ring
    const scale = Math.max(0.5, 1 - Math.abs(d) * SCALE_STEP);
    return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${roty}deg) scale(${scale})`;
  });
  const opacity = useTransform(focus, (f) =>
    Math.max(0, 1 - Math.abs(index - f) * OPACITY_STEP),
  );
  const zIndex = useTransform(focus, (f) => Math.round(100 - Math.abs(index - f) * 10));
  // Every visible card is clickable (opens its studybook); z-index resolves overlaps,
  // so a click lands on whichever card is on top at that point. Hidden/back-facing
  // cards (far from focus) opt out so they don't swallow taps.
  const pointerEvents = useTransform(focus, (f) =>
    Math.abs(index - f) < 2 ? "auto" : "none",
  );

  const price = formatPrice(book.priceEur);

  return (
    <motion.div
      style={{
        transform,
        opacity,
        zIndex,
        pointerEvents,
        width: cardW,
        height: cardH,
        left: "50%",
        top: "50%",
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        backfaceVisibility: "hidden",
      }}
      className="absolute"
    >
      <Link
        href={`/studybook/${book.slug}`}
        className="group relative block h-full w-full overflow-hidden rounded-card bg-ink shadow-lift ring-1 ring-black/5"
      >
        <Image
          src={cardImage(index)}
          alt={book.title}
          fill
          sizes={`${cardW}px`}
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
                <span className="font-medium opacity-80">{t("from")}</span>
                {price}
              </Pill>
            )}
            <span className="text-xs font-medium text-white/70">{book.category}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Motion-free fallback: the original horizontal rail of vertical cards. */
function Rail({ books }: { books: Studybook[] }) {
  const t = useTranslations("components_home_UniverseCarousel");
  return (
    <CardRail itemWidth="w-40 sm:w-48" label={t("freshlyDigitized")}>
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
  // Responsive sizing — bigger, wider fan on desktop; compact on mobile.
  const [dims, setDims] = useState<Dims>({
    cardW: 300,
    cardH: 408,
    spreadX: 200,
    pitch: 58,
    stageH: 408 + 2 * 58 + STAGE_PAD * 2,
    pin: true,
    perCard: 160,
    vpH: 900,
  });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const mobile = w < 640;
      const cardW = mobile
        ? Math.min(Math.round(w * 0.5), 190) // mobile: compact card, fan inside the screen
        : Math.min(Math.max(Math.round(w * 0.26), 320), 380); // desktop: 320–380
      const cardH = Math.round(cardW * 1.36);
      const pitch = mobile ? 40 : 58; // tighter spiral climb on mobile
      const pad = mobile ? 20 : STAGE_PAD;
      setDims({
        cardW,
        cardH,
        spreadX: mobile ? Math.round(w * 0.24) : Math.max(120, Math.min(w * 0.3, 440)),
        pitch,
        // Deck extent ≈ focused card + the ±2-card spiral climb; never taller
        // than the viewport so the sticky pin stays clean.
        stageH: Math.min(cardH + 2 * pitch + pad * 2, window.innerHeight),
        pin: !mobile,
        perCard: 160,
        vpH: window.innerHeight,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const scrub = (items.length - 1) * dims.perCard;
  const trackH = dims.stageH + scrub;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });
  // Progress spans the container's full transit past the viewport (container +
  // viewport heights). Desktop (pinned): the stage pins after `vpH` scrolled and
  // unpins `scrub` later — the spin maps to exactly that slice, so every card
  // reaches focus fully on-screen before the page moves on. Mobile (no pin):
  // spin over the middle of the transit; the dead zones at the ends hold the
  // first/last card while the section barely peeks on screen.
  let spinStart = 0.18;
  let spinEnd = 0.82;
  if (dims.pin) {
    const total = trackH + dims.vpH;
    const pinStart = dims.vpH / total;
    const pinEnd = (dims.vpH + scrub) / total;
    const lead = 0.06 * (pinEnd - pinStart); // brief hold on the first/last card
    spinStart = pinStart + lead;
    spinEnd = pinEnd - lead;
  }
  const raw = useTransform(scrollYProgress, [spinStart, spinEnd], [0, items.length - 1], {
    clamp: true,
  });
  const focus = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });

  if (reduce) return <Rail books={books} />;

  const stage = (
    <div
      className="relative overflow-hidden [perspective:1300px]"
      style={{ height: dims.stageH, ["--anchor" as string]: ANCHOR }}
    >
      {/* "universe" backdrop — a single soft violet glow, behind the deck. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[var(--anchor)] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full "
      />

      {/* the spiral deck — zero-size anchor the cards position themselves around. */}
      <div className="absolute left-1/2 top-[var(--anchor)] h-0 w-0 [transform-style:preserve-3d]">
        {items.map((book, i) => (
          <DrumCard key={book.id} book={book} index={i} focus={focus} dims={dims} />
        ))}
      </div>
    </div>
  );

  return dims.pin ? (
    <div ref={container} style={{ height: trackH }}>
      <div className="sticky top-0">{stage}</div>
    </div>
  ) : (
    <div ref={container}>{stage}</div>
  );
}
