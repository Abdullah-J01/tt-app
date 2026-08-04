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
import { bodyTier, cardFromParam, chapterFromParam } from "@/lib/chapters";
import { useStatusBarColor } from "@/lib/statusBar";
import { cn } from "@/lib/utils";
import type { LibraryEntry } from "@/features/library/useLibrary";
import { useReadingProgress } from "@/features/reading-progress/useReadingProgress";
import { StreakCompletion } from "@/features/streak";
import { FREE_PREVIEW_CARDS, isFreeBook } from "@/features/studybook/freePreview";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/components/auth/useAuthModal";
import type { BodyTier } from "@/lib/chapters";
import type { Studybook, StudyCard } from "@/types";

/**
 * Font sizes scale with content length and viewport so every card fits without scrolling.
 * Values are tuned alongside `CARD_BODY_BUDGET`; changing one without the other can cause clipping.
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

export default function StudybookReader({ book }: { book: Studybook }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("components_feed_StudybookReader");
  const chapters = book.chapters;
  const total = book.cards.length;
  const chapterParam = params.get("chapter");
  const cardParamRaw = params.get("card");
  const [chapterIndex, setChapterIndex] = useState(() => chapterFromParam(book, chapterParam));
  const [index, setIndex] = useState(() =>
    cardFromParam(book.chapters[chapterFromParam(book, chapterParam)], cardParamRaw),
  );
  const [done, setDone] = useState(false);

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

  const containerRef = useRef<HTMLElement>(null);
  const { turn, begin, end } = useCardTurn();
  const { setProgress } = useReadingProgress();


  const lastUrlPositionRef = useRef(`${chapterParam}:${cardParamRaw}`);
  useEffect(() => {
    const urlPosition = `${chapterParam}:${cardParamRaw}`;
    if (urlPosition === lastUrlPositionRef.current) return;
    lastUrlPositionRef.current = urlPosition;
    const nextChapter = chapterFromParam(book, chapterParam);
    setChapterIndex(nextChapter);
    setIndex(cardFromParam(book.chapters[nextChapter], cardParamRaw));
    setChapterMenuOpen(false);
    setActionsMenuOpen(false);
    end();
  }, [chapterParam, cardParamRaw, book, end]);

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

  // Persist "how far into this book" as the reader moves — the seam Home's
  // Continue section reads back (src/features/reading-progress).
  useEffect(() => {
    setProgress(book, chapterIndex, index, activeGlobal);
  }, [book, chapterIndex, index, activeGlobal, setProgress]);

  
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authStatus = useAppSelector((s) => s.auth.status);
  const openAuth = useAuthModal((s) => s.openAuth);
  const guestGated = authStatus !== "loading" && !isAuthenticated && isFreeBook(book);


  const move = useCallback(
    (toChapter: number, toCard: number, kind: "card" | "chapter") => {
      if (lockRef.current || dragBusyRef.current) return;
      if (toChapter === chapterIndex && toCard === index) return;
      const from = (offsets[chapterIndex] ?? 0) + index;
      const to = (offsets[toChapter] ?? 0) + toCard;

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


  const anyMenuOpen = chapterMenuOpen || actionsMenuOpen;

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

  // An open studybook is immersive, so it tints the status bar to this card's
  // own plum gradient; the tabbed screens keep the app-wide white default.
  useStatusBarColor("var(--color-plum-start)");

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

  const renderCard = (global: number) => {
    const c = book.cards[global];
    if (!c) return null;
    const tier = TIER_STYLES[bodyTier(c.body)];
    return (
      <>
        <div className="absolute inset-x-0 top-[calc(150px+env(safe-area-inset-top))] bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] flex items-start overflow-hidden px-5 sm:top-[calc(128px+env(safe-area-inset-top))] sm:bottom-[4.5rem] sm:px-8">
          <div className="w-full max-w-md">
            <h2 className={cn("font-display leading-tight font-bold text-white", tier.heading)}>
              {c.heading}
            </h2>

            {/* Per-card artwork — optional. Without it the text just flows, no
                empty placeholder box. */}
            {c.image && (
              <div
                className={cn(
                  "relative my-4 overflow-hidden rounded-2xl max-w-[300px] bg-white/[0.06]",
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

  const pair = turn
    ? turnKind === "chapter"
      ? chapterPair(turn.dir)
      : transitionPair("y", turn.dir)
    : null;

  const STRIDE = "(100% - var(--content-top) - var(--peek))";
  const offsetBy = (steps: -1 | 0 | 1, px: number) =>
    `translateY(calc(${steps} * ${STRIDE} + ${px}px))`;

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

        <div className="bg-plum-gradient lg:shadow-glow relative h-full w-full touch-none overflow-hidden text-white select-none [--content-top:calc(150px+env(safe-area-inset-top))] [--peek:3.5rem] sm:rounded-[2.25rem] sm:[--content-top:calc(128px+env(safe-area-inset-top))] lg:rounded-[2.75rem]">

          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_calc(100%_-_4.5rem),rgba(0,0,0,0.3)_calc(100%_-_3.25rem),transparent_calc(100%_-_1.75rem))] [-webkit-mask-image:linear-gradient(to_bottom,#000_calc(100%_-_4.5rem),rgba(0,0,0,0.3)_calc(100%_-_3.25rem),transparent_calc(100%_-_1.75rem))]">

            <div
              onAnimationEnd={(e) => e.target === e.currentTarget && end()}
              className={cn("absolute inset-0", pair?.incoming)}
              style={slotStyle(0)}
            >
              {renderCard(activeGlobal)}
            </div>

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

          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
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

          <div className="absolute inset-x-0 top-[calc(68px+env(safe-area-inset-top))] z-20 px-5">
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
