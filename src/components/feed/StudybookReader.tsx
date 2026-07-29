"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Bookmark, Check, ChevronDown, Zap } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { slugify } from "./feedData";
import { SlideControls } from "@/components/ui/SlideControls";
import {
  LOCK_MS,
  chapterPair,
  transitionPair,
  useCardTurn,
  useSlideAxis,
  useSwipeNav,
  useWheelNav,
} from "@/lib/cardSlide";
import { bodyTier, chapterFromParam } from "@/lib/chapters";
import { cn } from "@/lib/utils";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";
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
 */
const TIER_STYLES: Record<BodyTier, { heading: string; body: string; media: string }> = {
  short: {
    heading: "text-3xl sm:text-4xl",
    body: "text-lg leading-relaxed sm:text-xl",
    media: "h-44 sm:h-48",
  },
  medium: {
    heading: "text-2xl sm:text-3xl",
    body: "text-base leading-relaxed sm:text-lg",
    media: "h-36 sm:h-40",
  },
  long: {
    heading: "text-xl sm:text-2xl",
    body: "text-[15px] leading-relaxed sm:text-base",
    media: "h-28 sm:h-32",
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
 * The Save/Like/Share rail and the top Save both fire the shared "Saved" toast.
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
  /** Which kind of move is in flight — cards and chapters animate differently. */
  const [turnKind, setTurnKind] = useState<"card" | "chapter">("card");
  const lockRef = useRef(false);
  // The whole overlay (backdrop included) — wheel/swipe anywhere navigates, not
  // just over the narrow card surface (matters on desktop where the cursor
  // usually sits on the backdrop or the action rail).
  const containerRef = useRef<HTMLElement>(null);
  // Only the slide axis reads the viewport — SlideControls shows/hides in CSS,
  // so it renders server-side and can't mismatch on hydration.
  const axis = useSlideAxis();
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
      if (lockRef.current) return;
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

  // Wheel (desktop) + touch (mobile/tablet), shared with StudybookPreview —
  // cards only. Chapter navigation is the picker below, not a gesture: a click
  // sets state directly, so there's nothing left for a swipe to disagree with.
  // Both pause while the picker is open so a tap/scroll inside it can't also
  // read as a card swipe.
  useWheelNav(containerRef, goNext, goPrev, {
    enabled: !chapterMenuOpen,
    isLocked: () => lockRef.current,
  });
  useSwipeNav(containerRef, goNext, goPrev, { enabled: !chapterMenuOpen });

  // Keyboard: Up/Down (and Space/PageUp/PageDown) walk the cards; Escape closes
  // the chapter picker when it's open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && chapterMenuOpen) {
        setChapterMenuOpen(false);
        return;
      }
      if (chapterMenuOpen) return;
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
  }, [goNext, goPrev, chapterMenuOpen]);

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
   * render a card from the chapter we just left. Rendered twice mid-transition.
   */
  const renderCard = (global: number) => {
    const c = book.cards[global];
    if (!c) return null;
    const tier = TIER_STYLES[bodyTier(c.body)];
    return (
      // Insets clear the header (bars + meta) above and the controls below.
      // Centering comes from my-auto on the card (not items-center): auto
      // margins split the leftover space evenly above and below a short card
      // instead of dumping it all at the bottom, but they collapse to 0 the
      // moment content is taller than the area, so a long card still starts
      // right under the header rather than riding up underneath it.
      // overflow-hidden is the backstop for the no-scroll rule — nothing should
      // ever reach it.
      <div className="absolute inset-x-0 top-[100px] bottom-[calc(env(safe-area-inset-bottom)+3.25rem)] flex overflow-hidden px-6 sm:top-24 sm:bottom-[4.5rem] sm:px-8">
        <div className="my-auto w-full max-w-md pr-16 lg:pr-0">
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
    );
  };

  // Cards follow the input axis; chapters are always horizontal (and travel
  // further), so a chapter jump can't be mistaken for the next card on desktop.
  const pair = turn
    ? turnKind === "chapter"
      ? chapterPair(turn.dir)
      : transitionPair(axis, turn.dir)
    : null;
  const activeGlobal = (offsets[chapterIndex] ?? 0) + index;

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-[100dvh] touch-none items-center justify-center overflow-x-clip bg-black/60 backdrop-blur-sm lg:py-8"
    >
      {/* Positioning frame — NOT clipped, so the rail can sit outside on desktop
          (same pattern as the feed on desktop). */}
      <div className="relative h-[100dvh] w-full max-w-full sm:h-[80vh] sm:max-h-[720px] sm:max-w-md">
        {/* Phone-style reader surface — clipped, rounded on larger screens */}
        <div className="bg-plum-gradient lg:shadow-glow relative h-full w-full touch-none overflow-hidden text-white select-none sm:rounded-[2.25rem] lg:rounded-[2.75rem]">
          {/* Cards. Both copies stay transparent, so only the content travels and
              the card's gradient sits still behind them. Kept under the header and
              controls (z-20) so those hold their position while cards move. */}
          <div
            onAnimationEnd={(e) => e.target === e.currentTarget && end()}
            className={cn("absolute inset-0", pair?.incoming)}
          >
            {renderCard(activeGlobal)}
          </div>

          {turn && pair && (
            <div
              // Keyed so a fresh transition remounts and restarts the animation
              // rather than reusing the element mid-flight.
              key={`${turn.from}:${turn.dir}`}
              onAnimationEnd={(e) => e.target === e.currentTarget && end()}
              className={cn("pointer-events-none absolute inset-0", pair.outgoing)}
            >
              {renderCard(turn.from)}
            </div>
          )}

          {/* Top bar: back · CHAPTER (opens the picker) · save. The chapter name
              lives here because it's what changes when you pick a different one;
              the book title moved down to the meta row, which is stable.
              Chapter navigation is a click on this chip, not a swipe or a key —
              a single onClick sets chapterIndex directly, so the chip, the meta
              counter below and the progress bar (all driven by that one value)
              move together by construction; there's no gesture-timing path for
              them to disagree on. */}
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
              onClick={() => setChapterMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={chapterMenuOpen}
              aria-label={t("chapterOf", {
                current: chapterIndex + 1,
                total: chapters.length,
                title: chapter.title,
              })}
              className="flex min-w-0 max-w-[60%] items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/15"
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

            <TopSave book={book} />

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
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="shrink-0 text-xs font-medium text-white/55">
                {t("chapterProgress", { current: chapterIndex + 1, total: chapters.length })} ·{" "}
                {t("cardProgress", { current: index + 1, total: cardCount })}
              </p>
              <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                {book.title}
              </p>
            </div>
          </div>

          {/* Next stays enabled on the last card — there it rolls into the next
              chapter, or opens the streak completion on the last one, so it
              doubles as "finish the book". On that last card the label says which,
              so the end of a chapter is never a surprise.
              Mobile: the bottom nav is hidden on the reader, so this sits just
              above the home-indicator safe area; sm+ the reader is a windowed
              card, so back to bottom-8. */}
          <SlideControls
            index={index}
            onPrev={goPrev}
            onNext={goNext}
            // Card 1 of chapter 2+ still has somewhere to go back to: the last
            // card of the chapter before it.
            disablePrev={chapterIndex === 0 && index === 0}
            nextHint={onLastCard ? (nextChapter ? t("nextChapter") : t("finish")) : undefined}
            labels={{
              previous: t("previousCard"),
              next: onLastCard ? (nextChapter ? t("nextChapter") : t("finish")) : t("nextCard"),
              hint: onLastCard
                ? nextChapter
                  ? t("nextChapterHint", { title: nextChapter.title })
                  : t("finishHint")
                : t("swipeHint"),
            }}
            className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-20 px-8 sm:bottom-8"
          />
        </div>

        {/* Action rail (Save / Like / Share) — sibling of the frame so it sits
            inside the card on mobile and outside it on desktop, like the feed. */}
        <div className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom)+3rem)] z-30 sm:bottom-32 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-full lg:ml-5 lg:-translate-y-1/2">
          <ActionRail entry={toEntry(active, book)} shareTitle={book.title} />
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

/** Top-bar save toggle — persists the whole book to the library (Studybooks tab). */
function TopSave({ book }: { book: Studybook }) {
  const router = useRouter();
  const t = useTranslations("components_feed_StudybookReader");
  const { status } = useSession();
  const { isBookSaved, toggleBook } = useLibrary();
  const saved = isBookSaved(book.slug);

  const toggle = () => {
    // Saving requires a session — send guests to login and back here.
    // Taps while the session is still resolving are ignored (no login bounce,
    // no writes under the anonymous storage key).
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/studybook/${book.slug}/read`)}`);
      return;
    }
    toggleBook({
      bookSlug: book.slug,
      bookTitle: book.title,
      bookAuthor: book.author,
      subject: book.subjectSlug,
      grade: book.grade,
      cover: book.cover,
      savedAt: 0, // stamped by the store on insert
    });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? t("saved") : t("save")}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
    >
      <Bookmark className={`h-5 w-5 ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
