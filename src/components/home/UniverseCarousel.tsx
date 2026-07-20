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
import { coverOrArt, type DeckBook } from "./deckBook";
import { COUNT, HOLD, PER_CARD, trackHeight, trackMargin } from "./universeTrack";

/**
 * "Freshly digitized" as a scroll-spun 3D spiral. Cards wind around a vertical
 * axis like a helix — fanning out horizontally and climbing vertically. Scroll
 * drives a floating `focus` index; each card sits on the helix relative to it,
 * so one card sweeps up to the flat, front-centered focus while its neighbours
 * spiral away and fade.
 *
 * Pinning is identical on every breakpoint — the stage sticks for one viewport
 * height while the deck spins, then releases. Mobile used to skip the pin and
 * map the spin to the section's transit through the viewport, which meant card 0
 * was already part-spun while the deck was still entering and the last card never
 * settled before the section scrolled away. The pin plus the `HOLD` margins below
 * are what guarantee the first and last card are each seen fully centred, at rest.
 *
 * Robust for any COUNT: cards that revolve past 90° show their back, which
 * `backface-visibility: hidden` clips — so only the front arc is ever visible,
 * no matter how many cards ride the spiral. Under reduced-motion → plain rail.
 */

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

/** Fallback art for books with no cover of their own (see `coverOrArt`). */
const SPIRAL_ART = [1, 2, 3, 4, 5].map((n) => `/images/demoData/cardImage${n}.jpg`);
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
  /** Opacity lost per card away from focus. Steeper on mobile, where the fan is
   *  narrow relative to the card and gentle fading reads as translucent mush. */
  fade: number;
}

function DrumCard({
  book,
  index,
  focus,
  dims,
}: {
  book: DeckBook;
  index: number;
  focus: MotionValue<number>;
  dims: Dims;
}) {
  const t = useTranslations("components_home_UniverseCarousel");
  const { cardW, cardH, spreadX, pitch, fade } = dims;

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
  const opacity = useTransform(focus, (f) => Math.max(0, 1 - Math.abs(index - f) * fade));
  const zIndex = useTransform(focus, (f) => Math.round(100 - Math.abs(index - f) * 10));
  // Every visible card is clickable (opens its studybook); z-index resolves overlaps,
  // so a click lands on whichever card is on top at that point. Hidden/back-facing
  // cards (far from focus) opt out so they don't swallow taps.
  const pointerEvents = useTransform(focus, (f) => (Math.abs(index - f) < 2 ? "auto" : "none"));
  // Only the focused card is captioned. Fading the whole card is not enough:
  // a neighbour's title and price pill land at the same baseline as the focused
  // card's, and two sets of legible text across overlapping covers is what reads
  // as the cards "mixing". Gone by half a step out, so it never competes.
  const captionOpacity = useTransform(focus, (f) =>
    Math.max(0, Math.min(1, 1 - Math.abs(index - f) / 0.5)),
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
        className="group rounded-card bg-ink shadow-lift relative block h-full w-full overflow-hidden ring-1 ring-black/5"
      >
        <Image
          src={coverOrArt(book, index, SPIRAL_ART)}
          alt={book.title}
          fill
          sizes={`${cardW}px`}
          className="object-cover"
        />
        {/* legibility scrim */}
        <div
          aria-hidden
          className="from-ink/90 via-ink/25 absolute inset-0 bg-gradient-to-t to-transparent"
        />
        <motion.div className="absolute inset-x-0 bottom-0 p-4" style={{ opacity: captionOpacity }}>
          <h3 className="font-display line-clamp-2 text-lg font-bold text-white">{book.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Not every studybook is paid, and a pill that simply vanishes on the
                free ones makes the deck look like it failed to load. Say "free". */}
            <Pill variant="solid">
              {price ? (
                <>
                  <span className="font-medium opacity-80">{t("from")}</span>
                  {price}
                </>
              ) : (
                t("free")
              )}
            </Pill>
            <span className="text-xs font-medium text-white/70">{book.category}</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/** Motion-free fallback: the original horizontal rail of vertical cards. */
function Rail({ books }: { books: DeckBook[] }) {
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
          media={
            <Image src={coverOrArt(book, i, SPIRAL_ART)} alt={book.title} fill sizes="192px" />
          }
          tags={[{ label: book.category, icon: <BookOpen aria-hidden /> }, { label: book.author }]}
        />
      ))}
    </CardRail>
  );
}

export function UniverseCarousel({ books }: { books: DeckBook[] }) {
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
    fade: 0.3,
  });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const mobile = w < 640;
      const cardW = mobile
        ? Math.min(Math.round(w * 0.5), 200) // mobile: readable, but leaves room for the fan
        : Math.min(Math.max(Math.round(w * 0.26), 320), 380); // desktop: 320–380
      const cardH = Math.round(cardW * 1.36);
      const pitch = mobile ? 40 : 58; // tighter spiral climb on mobile
      const pad = mobile ? 20 : STAGE_PAD;
      setDims({
        cardW,
        cardH,
        // The fan has to scale with the *card*, not the screen: keyed to width
        // alone, neighbours landed ~63px from centre under a 230px card and the
        // deck read as one smeared, see-through pile. ~0.64·spreadX is the
        // sideways offset one card out (sin 40°), so this keeps ~2/3 of a card
        // clear. Overhanging the screen edge is fine — the stage clips it.
        spreadX: mobile ? cardW : Math.max(120, Math.min(w * 0.3, 440)),
        pitch,
        // Deck extent ≈ focused card + the ±2-card spiral climb; never taller
        // than the viewport so the sticky pin stays clean.
        stageH: Math.min(cardH + 2 * pitch + pad * 2, window.innerHeight),
        fade: mobile ? 0.45 : 0.3,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const scrub = (items.length - 1) * PER_CARD;
  const pinned = scrub + HOLD * 2; // pinned scroll: hold, spin, hold

  // The track is one viewport tall plus the pinned distance, and the stage is a
  // full-viewport sticky box inside it — so `start start → end end` spans exactly
  // the pinned stretch, with no viewport height in the math. (The old mapping
  // divided by a JS-measured `vpH`, which drifts on Android every time the URL
  // bar hides.) Progress clamps at both ends, so the deck rides in and out of
  // view resting on card 0 / the last card.
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });
  const raw = useTransform(
    scrollYProgress,
    [HOLD / pinned, (HOLD + scrub) / pinned],
    [0, items.length - 1],
    { clamp: true },
  );
  const focus = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });

  if (reduce) return <Rail books={books} />;

  const stage = (
    <div
      className="relative w-full overflow-hidden [perspective:1300px]"
      style={{ height: dims.stageH, ["--anchor" as string]: ANCHOR }}
    >
      {/* "universe" backdrop — a single soft violet glow, behind the deck. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[var(--anchor)] left-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      {/* the spiral deck — zero-size anchor the cards position themselves around. */}
      <div className="absolute top-[var(--anchor)] left-1/2 h-0 w-0 [transform-style:preserve-3d]">
        {items.map((book, i) => (
          <DrumCard key={book.id} book={book} index={i} focus={focus} dims={dims} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={container}
      style={{ height: trackHeight(pinned), marginBlock: trackMargin(`${dims.stageH}px`) }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {stage}
      </div>
    </div>
  );
}
