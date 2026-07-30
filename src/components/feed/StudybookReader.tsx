"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Zap } from "lucide-react";
import { CardActionsMenu } from "./CardActionsMenu";
import { slugify } from "./feedData";
import {
  DRAG_SETTLE_MS,
  LOCK_MS,
  chapterPair,
  transitionPair,
  useCardTurn,
  useDragNav,
  useWheelNav,
} from "@/lib/cardSlide";
import { bodyTier, chapterFromParam } from "@/lib/chapters";
import { cn } from "@/lib/utils";
import type { LibraryEntry } from "@/features/library/useLibrary";
import { StreakCompletion } from "@/features/streak";
import { FREE_PREVIEW_CARDS, isFreeBook } from "@/features/studybook/freePreview";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/components/auth/useAuthModal";
import type { BodyTier } from "@/lib/chapters";
import type { Studybook, StudyCard } from "@/types";

/**
 * Type scale by body length. A card never scrolls, so instead of one size that
 * has to survive the longest body, each length gets the size that fills the card:
 * a one-line bite reads large, a dense one shrinks to fit. Content is generated
 * (and TT content clamped) inside these budgets — see src/lib/chapters.ts.
 *
 * Three axes, because the box the text has to fit changes shape in two ways:
 * - base = a phone in portrait (the card is the whole viewport)
 * - `sm:` = the card becomes a FIXED 80vh/720px frame, so it has *less* room
 *   than a tall phone even on a big monitor — the type steps DOWN here, it
 *   doesn't step up
 * - `short-card:` (max-height: 740px, defined in globals.css) = short viewports
 *   — an SE-sized phone, or a laptop window with devtools open
 * Every size here is tuned jointly with CARD_BODY_BUDGET; changing one without
 * the other is what makes a card clip.
 */
const TIER_STYLES: Record<BodyTier, { heading: string; body: string; media: string }> = {
  short: {
    heading: "text-3xl short-card:text-2xl",
    body: "text-lg leading-relaxed short-card:text-[15px] sm:text-[17px]",
    media: "h-44 short-card:h-28 sm:h-40",
  },
  medium: {
    heading: "text-2xl short-card:text-xl",
    body: "text-base leading-relaxed short-card:text-[13px] sm:text-[15px]",
    media: "h-36 short-card:h-24 sm:h-32",
  },
  long: {
    heading: "text-xl short-card:text-lg",
    body: "text-[15px] leading-relaxed short-card:text-[12px] sm:text-[14px]",
    media: "h-28 short-card:h-20 sm:h-28",
  },
};

/** Library snapshot for the active card — lets the rail's like/save persist. */
function toEntry(card: StudyCard, book: Studybook): LibraryEntry {
  return {
    cardId: card.id,
    cardSlug: slugify(card.heading) || card.id,
    heading: card.heading,
    body: card.body,
    bookSlug: book.slug,
    bookTitle: book.title,
    bookAuthor: book.author,
    subject: book.subjectSlug,
    grade: book.grade,
    cover: book.cover,
    savedAt: 0, // stamped by the store on insert
  };
}

/**
 * Immersive studybook reader opened from "Start learning" on the detail page.
 * One card at a time on a dark gradient.
 *
 * Two axes, two meanings: **vertical** (swipe up/down, wheel, Up/Down keys, the
 * Prev/Next chevrons) moves through the cards of the open chapter; **horizontal**
 * (swipe left/right, Left/Right keys) moves between chapters, left being forward.
 * Running off the end of a chapter with Next rolls into the next one, which is
 * why the last card advertises it beside the arrow.
 *
 * Like/Save/Share live behind the top bar's actions menu (`CardActionsMenu`),
 * which fires the shared "Saved"/"Liked" toasts.
 */
export default function StudybookReader({ book }: { book: Studybook }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("components_feed_StudybookReader");
  const chapters = book.chapters;
  const total = book.cards.length;
  const chapterParam = params.get("chapter");
  // Deep link support: /read?chapter=2 opens that chapter (1-based in the URL).
  // Seeded once as initial state, then kept in sync below — swiping itself must
  // NOT push history entries, or Back stops meaning "leave the reader".
  const [chapterIndex, setChapterIndex] = useState(() => chapterFromParam(book, chapterParam));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  /** Chapter picker — replaces horizontal swipe/Left-Right as the way to jump
   * chapters: a single click sets state directly, so the chip, the meta counter
   * and the progress bar (all driven by the same `chapterIndex`) can't drift
   * apart the way a gesture-based path could. */
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);
  /** Top-bar Like/Save/Share popover — same controlled-open pattern as the
   * chapter picker, so it shares Escape-to-close and swipe-suppression below. */
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  /** Which kind of move is in flight — cards and chapters animate differently. */
  const [turnKind, setTurnKind] = useState<"card" | "chapter">("card");
  const lockRef = useRef(false);
  /** Mirrors whether a drag gesture (or its settle) is in flight — keeps the
   * discrete inputs (wheel, keys, chevrons) from starting a CSS turn on top. */
  const dragBusyRef = useRef(false);
  // The whole overlay (backdrop included) — wheel/swipe anywhere navigates, not
  // just over the narrow card surface (matters on desktop where the cursor
  // usually sits on the backdrop or the action rail).
  const containerRef = useRef<HTMLElement>(null);
  const { turn, begin, end } = useCardTurn();

  // Re-sync if the URL's ?chapter= changes under an ALREADY-MOUNTED reader — e.g.
  // tapping a different chapter tile on the detail page reuses this component
  // (same route, only the query differs) rather than remounting it, so the
  // useState initializer above never runs again. Keyed on the raw param so an
  // in-flight swipe (which never touches the URL) can't be fought by this.
  const lastUrlChapterRef = useRef(chapterParam);
  useEffect(() => {
    if (chapterParam === lastUrlChapterRef.current) return;
    lastUrlChapterRef.current = chapterParam;
    setChapterIndex(chapterFromParam(book, chapterParam));
    setIndex(0);
    setChapterMenuOpen(false);
    setActionsMenuOpen(false);
    end();
  }, [chapterParam, book, end]);

  /** Global index of each chapter's first card, so a position flattens to one number. */
  const offsets = useMemo(() => {
    let running = 0;
    return chapters.map((c) => {
      const start = running;
      running += c.cards.length;
      return start;
    });
  }, [chapters]);

  const chapter = chapters[chapterIndex];
  const cards = chapter?.cards ?? [];
  const cardCount = cards.length;
  const active = cards[index];
  const nextChapter = chapters[chapterIndex + 1];
  const onLastCard = index >= cardCount - 1;
  /** The position as one number over the flat list — what the transition copies
   * and the drag gesture are both addressed by. */
  const activeGlobal = (offsets[chapterIndex] ?? 0) + index;

  // Free-book guests may read the first FREE_PREVIEW_CARDS cards, then hit the
  // login gate. Paid books never reach the reader as a guest (gated at the
  // "Start learning" button), so only free books need the in-reader gate. Auth
  // state comes from the same Redux slice the auth guards read.
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authStatus = useAppSelector((s) => s.auth.status);
  const openAuth = useAuthModal((s) => s.openAuth);
  const guestGated = authStatus !== "loading" && !isAuthenticated && isFreeBook(book);

  /**
   * The one way the position changes. Both copies of the card are addressed by a
   * *global* index, so a chapter jump and a card step are the same move to the
   * transition — only `kind` differs, and that picks the animation.
   */
  const move = useCallback(
    (toChapter: number, toCard: number, kind: "card" | "chapter") => {
      if (lockRef.current || dragBusyRef.current) return;
      if (toChapter === chapterIndex && toCard === index) return;
      const from = (offsets[chapterIndex] ?? 0) + index;
      const to = (offsets[toChapter] ?? 0) + toCard;
      // Guests reading a free book get a few cards, then must sign in to
      // continue — checked on the global position so skipping ahead by chapter
      // can't walk around it.
      if (guestGated && to >= FREE_PREVIEW_CARDS) {
        openAuth("login", { reason: t("loginToContinue") });
        return;
      }
      setChapterIndex(toChapter);
      setIndex(toCard);
      setTurnKind(kind);
      // begin() declines under reduced motion — nothing animates, so there's
      // nothing for the lock to wait on either.
      if (!begin(from, to > from ? 1 : -1)) return;
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, LOCK_MS);
    },
    [chapterIndex, index, offsets, begin, guestGated, openAuth, t],
  );

  const goNext = useCallback(() => {
    if (!onLastCard) {
      move(chapterIndex, index + 1, "card");
      return;
    }
    // End of a chapter: roll into the next one, or finish the book.
    if (nextChapter) move(chapterIndex + 1, 0, "chapter");
    else setDone(true);
  }, [move, chapterIndex, index, onLastCard, nextChapter]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      move(chapterIndex, index - 1, "card");
      return;
    }
    // Back off the front of a chapter lands on the last card of the previous one.
    const previous = chapters[chapterIndex - 1];
    if (previous) move(chapterIndex - 1, previous.cards.length - 1, "chapter");
  }, [move, chapters, chapterIndex, index]);

  /** Jump straight to a chapter — the chapter picker's only mutation. */
  const selectChapter = useCallback(
    (target: number) => {
      setChapterMenuOpen(false);
      if (target !== chapterIndex) move(target, 0, "chapter");
    },
    [move, chapterIndex],
  );

  const goBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push(`/studybook/${book.slug}`);
  }, [router, book.slug]);

  // Drag + wheel navigate at EVERY size. They used to be off at lg+, where the
  // SlideControls chevrons were the only way to move — with those gone, leaving
  // them off would leave desktop with keyboard-only navigation. The gesture is
  // vertical-only regardless: horizontal is reserved for the chapter picker.
  // Everything pauses while a popover is open so a tap/scroll inside it can't
  // read as a swipe.
  const anyMenuOpen = chapterMenuOpen || actionsMenuOpen;

  /**
   * TikTok-style drag: the card follows the finger, the next card rides in
   * behind it, and release settles the pair before `onCommit` swaps the state
   * (deliberately WITHOUT `begin()` — the settle already animated the move, so
   * the CSS turn would replay it). `canReveal` keeps the guest gate airtight:
   * a gated card is never rendered mid-drag, the pull rubber-bands and the
   * login popup opens instead via `onBlocked`.
   */
  const drag = useDragNav(containerRef, {
    enabled: !anyMenuOpen,
    isLocked: () => lockRef.current,
    canReveal: (dir) => {
      const target = activeGlobal + dir;
      if (target < 0 || target >= total) return false;
      return !(guestGated && target >= FREE_PREVIEW_CARDS);
    },
    onCommit: (dir) => {
      const target = activeGlobal + dir;
      // Global → chapter/card, the inverse of `offsets`.
      let ch = 0;
      for (let i = 0; i < offsets.length; i++) if ((offsets[i] ?? 0) <= target) ch = i;
      setChapterIndex(ch);
      setIndex(target - (offsets[ch] ?? 0));
    },
    onBlocked: (dir) => {
      if (dir !== 1) return;
      if (guestGated && activeGlobal + 1 >= FREE_PREVIEW_CARDS) {
        openAuth("login", { reason: t("loginToContinue") });
      } else if (activeGlobal + 1 >= total) {
        setDone(true);
      }
    },
  });
  useEffect(() => {
    dragBusyRef.current = drag !== null;
  }, [drag]);
  useWheelNav(containerRef, goNext, goPrev, {
    enabled: !anyMenuOpen,
    isLocked: () => lockRef.current || dragBusyRef.current,
  });

  // Keyboard: Up/Down (and Space/PageUp/PageDown) walk the cards; Escape closes
  // whichever popover (chapter picker or actions menu) is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && anyMenuOpen) {
        setChapterMenuOpen(false);
        setActionsMenuOpen(false);
        return;
      }
      if (anyMenuOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, anyMenuOpen]);

  useEffect(() => {
    const lenis = window.__lenis;
    const prevScroll = window.scrollY;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.stop();
    } else {
      window.scrollTo(0, 0);
    }
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("reader-open");
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove("reader-open");
      if (lenis) {
        lenis.start();
      } else {
        window.scrollTo(0, prevScroll);
      }
    };
  }, []);

  if (!chapter || !active) return null;

  /**
   * One card's contents, addressed by its GLOBAL index so the outgoing copy can
   * render a card from the chapter we just left. Several copies are on screen at
   * once — see STRIDE below.
   */
  const renderCard = (global: number) => {
    const c = book.cards[global];
    if (!c) return null;
    const tier = TIER_STYLES[bodyTier(c.body)];
    return (
      <>
        {/* Insets clear the header (bars + meta) above and the controls below.
            Content is TOP-aligned (items-start), not centred: every card then
            starts its heading at the same y, so stepping through a chapter
            doesn't bounce the text up and down as bodies change length. A short
            card leaves its slack at the bottom rather than splitting it above
            and below the text.
            overflow-hidden is the backstop for the no-scroll rule — nothing
            should ever reach it. */}
        <div className="absolute inset-x-0 top-[150px] bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] flex items-start overflow-hidden px-5 sm:top-24 sm:bottom-[4.5rem] sm:px-8">
          <div className="w-full max-w-md">
            <h2 className={cn("font-display leading-tight font-bold text-white", tier.heading)}>
              {c.heading}
            </h2>

            {/* Per-card artwork — optional. Without it the text just flows, no
                empty placeholder box. */}
            {c.image && (
              <div
                className={cn(
                  "relative my-4 overflow-hidden rounded-2xl bg-white/[0.06]",
                  tier.media,
                )}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, 420px"
                  className="object-contain p-2"
                />
              </div>
            )}

            <p className={cn("text-white/75", tier.body, c.image ? "" : "mt-4")}>{c.body}</p>
          </div>
        </div>
      </>
    );
  };

  // Cards always travel vertically now — the drag is vertical at every size, so
  // a keyboard/wheel turn has to move the same way or the same step animates
  // sideways with a key and upward with a finger. (This used to read the
  // viewport axis, because at lg+ the chevrons drove it horizontally.) Chapters
  // stay horizontal and travel further, so a chapter jump can't be mistaken for
  // the next card.
  const pair = turn
    ? turnKind === "chapter"
      ? chapterPair(turn.dir)
      : transitionPair("y", turn.dir)
    : null;

  /**
   * Distance between one card's content-top and the next one's — the whole
   * reader is a strip of card copies spaced by this, and a swipe scrolls the
   * strip by exactly one stride.
   *
   * It is a card height MINUS the content inset and the peek band, not a full
   * card: the next card rests with its first `--peek` of content already showing
   * above the bottom edge, which is the swipe affordance. Because it's the real
   * copy sitting there (not a summary of it), dragging up just carries that text
   * to where the current card's text is now — nothing is hidden and swapped
   * mid-gesture. Expressed in CSS so it needs no measurement: the copies are
   * `inset-0`, so `100%` is the card height, and `--content-top`/`--peek` are
   * set on the card surface (and re-set at `sm:`, where the inset changes).
   */
  const STRIDE = "(100% - var(--content-top) - var(--peek))";
  const offsetBy = (steps: -1 | 0 | 1, px: number) =>
    `translateY(calc(${steps} * ${STRIDE} + ${px}px))`;

  // Finger-following transforms. Not settling: every copy sits `delta` px along
  // from its resting slot. Settling: the same inline styles pick up a transition
  // and jump to their end slots, so the browser animates the remainder; the
  // hook's timeout then commits/clears. Drag and `turn` are mutually exclusive
  // (each blocks the other via its lock), so `pair` is never set here.
  const settleEase = `transform ${DRAG_SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  /** Where the copy resting at `slot` should sit for the current drag state. */
  const slotStyle = (slot: -1 | 0 | 1): React.CSSProperties | undefined => {
    if (!drag) return slot === 0 ? undefined : { transform: offsetBy(slot, 0) };
    // A commit shifts every copy one slot toward the card being committed to.
    const shift = drag.settling === "commit" ? -drag.dir : 0;
    const settled = drag.settling !== null;
    return {
      transform: offsetBy((slot + shift) as -1 | 0 | 1, settled ? 0 : drag.delta),
      transition: settled ? settleEase : "none",
    };
  };

  // The card below always renders — that resting peek IS the affordance. It is
  // withheld only when the gate would stop you reaching it, so a guest can never
  // read past the free preview by looking at the bottom of the last free card.
  const nextGlobal = activeGlobal + 1;
  const showNext = nextGlobal < total && !(guestGated && nextGlobal >= FREE_PREVIEW_CARDS) && !turn;
  // The card above only exists mid-gesture — nothing rests off the top edge.
  const showPrev = drag?.reveal === true && drag.dir === -1;
  return (
    <main
      ref={containerRef}
      className="relative flex min-h-[100dvh] touch-none items-center justify-center overflow-x-clip bg-black/60 backdrop-blur-sm lg:py-8"
    >
      {/* Positioning frame — NOT clipped, so the rail can sit outside on desktop
          (same pattern as the feed on desktop). */}
      <div className="relative h-[100dvh] w-full max-w-full sm:h-[80vh] sm:max-h-[720px] sm:max-w-md">
        {/* Phone-style reader surface — clipped, rounded on larger screens.
            `--content-top` must track the content box's own top inset and
            `--peek` how much of the next card shows at rest; STRIDE is derived
            from the pair, so they have to be changed together. */}
        <div className="bg-plum-gradient lg:shadow-glow relative h-full w-full touch-none overflow-hidden text-white select-none [--content-top:150px] [--peek:3.5rem] sm:rounded-[2.25rem] sm:[--content-top:96px] lg:rounded-[2.75rem]">
          {/* Every card copy lives inside this masked layer, which does NOT move
              — so the fade stays pinned to the card's bottom edge while content
              slides under it. The peek dissolves into the background instead of
              being cut off by it.
              A mask, not a coloured scrim: the card behind is `bg-plum-gradient`,
              so any solid "fade to purple" overlay would be the wrong purple at
              some scroll positions. Masking makes the text itself go
              transparent, whatever is behind it. It starts below the content
              box's own bottom inset (4.5rem), so a full-length body stays fully
              opaque and only the peeking next card fades. */}
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_calc(100%_-_4.5rem),rgba(0,0,0,0.3)_calc(100%_-_3.25rem),transparent_calc(100%_-_1.75rem))] [-webkit-mask-image:linear-gradient(to_bottom,#000_calc(100%_-_4.5rem),rgba(0,0,0,0.3)_calc(100%_-_3.25rem),transparent_calc(100%_-_1.75rem))]">
            {/* Cards. Every copy stays transparent, so only the content travels
                and the card's gradient sits still behind them. Kept under the
                header (z-20/z-30) so that holds position while cards move.
                During a drag each copy carries the finger-following inline
                transform instead of an animation class. */}
            <div
              onAnimationEnd={(e) => e.target === e.currentTarget && end()}
              className={cn("absolute inset-0", pair?.incoming)}
              style={slotStyle(0)}
            >
              {renderCard(activeGlobal)}
            </div>

            {/* The card BELOW, resting one stride down so its first `--peek` of
                content shows past the bottom edge. It is on screen before the
                gesture starts and the same element travels up into place, so a
                swipe moves the text you were already reading rather than hiding
                a summary and revealing the real thing behind it. */}
            {showNext && (
              <div className="pointer-events-none absolute inset-0" style={slotStyle(1)}>
                {renderCard(nextGlobal)}
              </div>
            )}

            {/* The card ABOVE — only while a backward drag is pulling it down. */}
            {showPrev && (
              <div className="pointer-events-none absolute inset-0" style={slotStyle(-1)}>
                {renderCard(activeGlobal - 1)}
              </div>
            )}

            {turn && pair && (
              <div
                // Keyed so a fresh transition remounts and restarts the
                // animation rather than reusing the element mid-flight.
                key={`${turn.from}:${turn.dir}`}
                onAnimationEnd={(e) => e.target === e.currentTarget && end()}
                className={cn("pointer-events-none absolute inset-0", pair.outgoing)}
              >
                {renderCard(turn.from)}
              </div>
            )}
          </div>

          {/* Top bar: back · CHAPTER (opens the picker) · actions menu. The
              chapter name lives here because it's what changes when you pick a
              different one; the book title moved down to the meta row, which is
              stable. Chapter navigation is a click on this chip, not a swipe or
              a key — a single onClick sets chapterIndex directly, so the chip,
              the meta counter below and the progress bar (all driven by that
              one value) move together by construction; there's no
              gesture-timing path for them to disagree on. */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-4 pt-5">
            <button
              type="button"
              onClick={goBack}
              aria-label={t("backToStudybook")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActionsMenuOpen(false);
                setChapterMenuOpen((open) => !open);
              }}
              aria-haspopup="listbox"
              aria-expanded={chapterMenuOpen}
              aria-label={t("chapterOf", {
                current: chapterIndex + 1,
                total: chapters.length,
                title: chapter.title,
              })}
              className="flex max-w-[60%] min-w-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/15"
            >
              <Zap className="h-3.5 w-3.5 shrink-0 fill-white/90" />
              <span className="truncate">{chapter.title}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-white/60 transition-transform",
                  chapterMenuOpen && "rotate-180",
                )}
              />
            </button>

            <CardActionsMenu
              entry={toEntry(active, book)}
              shareTitle={book.title}
              open={actionsMenuOpen}
              onOpenChange={(next) => {
                if (next) setChapterMenuOpen(false);
                setActionsMenuOpen(next);
              }}
            />

            {chapterMenuOpen && (
              <>
                {/* Dismiss on outside tap. aria-hidden + tabIndex=-1: this button
                    exists only to catch a pointer, never to be reached by
                    keyboard or a screen reader — Escape (wired above) is that path. */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => setChapterMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div
                  role="listbox"
                  aria-label={t("chapters")}
                  aria-activedescendant={chapter.id}
                  className="absolute inset-x-4 top-full z-40 mt-2 max-h-[55vh] overflow-y-auto rounded-2xl bg-[#241736]/95 p-1.5 shadow-xl ring-1 ring-white/10 backdrop-blur"
                >
                  {chapters.map((c, i) => (
                    <button
                      key={c.id}
                      id={c.id}
                      type="button"
                      role="option"
                      aria-selected={i === chapterIndex}
                      onClick={() => selectChapter(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === chapterIndex ? "bg-white/15" : "hover:bg-white/10",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                          i === chapterIndex
                            ? "bg-white text-[#241736]"
                            : "bg-white/10 text-white/70",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {c.title}
                        </span>
                        <span className="block text-xs text-white/50">
                          {t("chapterCards", { count: c.cards.length })}
                        </span>
                      </span>
                      {i === chapterIndex && <Check className="h-4 w-4 shrink-0 text-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Progress + meta — fixed header block, stays put while cards swipe.
              The bars track the OPEN CHAPTER, not the whole book: a bar per card
              across 100+ cards is a hairline nobody can read. */}
          <div className="absolute inset-x-0 top-[68px] z-20 px-5">
            <div className="flex gap-[2px]">
              {cards.map((c, i) => (
                <span
                  key={c.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-baseline justify-end gap-3">
              <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                {book.title}
              </p>
            </div>
          </div>
          {/* No Prev/Next chevrons: the gesture IS the affordance — a drag pulls
              the real next card up behind the finger, so nothing has to sit at
              the bottom describing what a swipe would do. That also frees the
              band the controls used to reserve, which the card body now uses. */}
        </div>
      </div>

      <StreakCompletion
        open={done}
        onClose={() => setDone(false)}
        cardsLearned={total}
        onNextStudybook={goBack}
        onBackToFeed={() => router.push("/feed")}
      />
    </main>
  );
}
