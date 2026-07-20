"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Bookmark, Zap } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { slugify } from "./feedData";
import { SlideControls } from "@/components/ui/SlideControls";
import { LOCK_MS, transitionPair, useCardTurn, useSlideAxis, useSwipeNav } from "@/lib/cardSlide";
import { cn } from "@/lib/utils";
import { useSubjectName } from "@/i18n/useSubjectName";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";
import { StreakCompletion } from "@/features/streak";
import { FREE_PREVIEW_CARDS, isFreeBook } from "@/features/studybook/freePreview";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/components/auth/useAuthModal";
import type { Studybook, StudyCard } from "@/types";

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
 * One card at a time on a dark gradient. Navigation matches StudybookPreview —
 * swipe on touch, Prev/Next chevrons on desktop (see @/lib/cardSlide) — plus
 * wheel and arrow keys throughout.
 * The Save/Like/Share rail and the top Save both fire the shared "Saved" toast.
 */
export default function StudybookReader({ book }: { book: Studybook }) {
  const router = useRouter();
  const t = useTranslations("components_feed_StudybookReader");
  const cards = book.cards;
  const total = cards.length;
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);
  // The whole overlay (backdrop included) — wheel/swipe anywhere navigates, not
  // just over the narrow card surface (matters on desktop where the cursor
  // usually sits on the backdrop or the action rail).
  const containerRef = useRef<HTMLElement>(null);
  const subjectName = useSubjectName();
  // Only the slide axis reads the viewport — SlideControls shows/hides in CSS,
  // so it renders server-side and can't mismatch on hydration.
  const axis = useSlideAxis();
  const { turn, begin, end } = useCardTurn();

  const subject = subjectName(book.subjectSlug);
  const active = cards[index];

  // Free-book guests may read the first FREE_PREVIEW_CARDS cards, then hit the
  // login gate. Paid books never reach the reader as a guest (gated at the
  // "Start learning" button), so only free books need the in-reader gate. Auth
  // state comes from the same Redux slice the auth guards read.
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authStatus = useAppSelector((s) => s.auth.status);
  const openAuth = useAuthModal((s) => s.openAuth);
  const guestGated = authStatus !== "loading" && !isAuthenticated && isFreeBook(book);

  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === index) return;
      setIndex(clamped);
      // begin() declines under reduced motion — nothing animates, so there's
      // nothing for the lock to wait on either.
      if (!begin(index, clamped > index ? 1 : -1)) return;
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, LOCK_MS);
    },
    [index, total, begin],
  );

  const goNext = useCallback(() => {
    // Guests reading a free book get a few cards, then must sign in to continue.
    if (guestGated && index + 1 >= FREE_PREVIEW_CARDS) {
      openAuth("login", { reason: t("loginToContinue") });
      return;
    }
    if (index >= total - 1) {
      setDone(true);
      return;
    }
    go(index + 1);
  }, [go, index, total, guestGated, openAuth, t]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push(`/studybook/${book.slug}`);
  }, [router, book.slug]);

  // Wheel (desktop). Deltas accumulate per gesture (a pause resets them), so a
  // mouse-wheel notch advances instantly while trackpad momentum can't fire a
  // second advance right after the lock releases.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let accum = 0;
    let reset: number | undefined;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        accum = 0;
      }, 150);
      if (lockRef.current) {
        // Mid-transition momentum shouldn't queue another advance.
        accum = 0;
        return;
      }
      accum += e.deltaY;
      if (Math.abs(accum) < 40) return;
      const delta = accum;
      accum = 0;
      if (delta > 0) goNext();
      else goPrev();
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(reset);
    };
  }, [goNext, goPrev]);

  // Touch (mobile/tablet)
  useSwipeNav(containerRef, goNext, goPrev);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Left/Right included to match the chevrons (and StudybookPreview, which
      // is Left/Right only); Up/Down stay for the vertical swipe mental model.
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowRight" ||
        e.key === "PageDown" ||
        e.key === " "
      ) {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

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

  if (!active) return null;

  /** One card's contents. Rendered twice while a transition is in flight. */
  const renderCard = (i: number) => {
    const c = cards[i];
    if (!c) return null;
    return (
      // Insets keep it clear of the header (bars + meta) above and the controls
      // below. Centering comes from my-auto on the card (not items-center): auto
      // margins collapse to 0 when the card is taller than the area, so it
      // top-aligns and overflows downward instead of riding up under the header.
      <div className="absolute inset-x-0 top-[112px] bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] flex px-6 sm:top-[104px] sm:bottom-20 sm:px-8">
        <div className="my-auto w-full max-w-md pr-16">
          <h2 className="font-display text-2xl leading-tight font-bold text-white sm:text-3xl">
            {c.heading}
          </h2>

          {/* Book cover — optional media; without it the text just flows, no
              empty placeholder box. */}
          {book.cover && (
            <div className="relative my-5 h-36 overflow-hidden rounded-2xl bg-white/[0.06] sm:my-4">
              <Image
                src={book.cover}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 90vw, 420px"
                className="object-contain p-2"
              />
            </div>
          )}

          <p className={`text-[15px] leading-relaxed text-white/75 ${book.cover ? "" : "mt-5"}`}>
            {c.body}
          </p>
        </div>
      </div>
    );
  };

  const pair = turn ? transitionPair(axis, turn.dir) : null;

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
            {renderCard(index)}
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

          {/* Top bar: back · book title · save */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 pt-5">
            <button
              type="button"
              onClick={goBack}
              aria-label={t("backToStudybook")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex max-w-[60%] items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-white/90" />
              <span className="truncate">{book.title}</span>
            </div>
            <TopSave book={book} />
          </div>

          {/* Progress + meta — fixed header block, stays put while cards swipe:
              bars, then card count (left) and category (right) on one row. */}
          <div className="absolute inset-x-0 top-[68px] z-20 px-5">
            <div className="flex gap-1">
              {cards.map((c, i) => (
                <span
                  key={c.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-xs font-medium text-white/55">
                {t("cardProgress", { current: index + 1, total })}
              </p>
              <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                {subject}
              </p>
            </div>
          </div>

          {/* Next stays enabled on the last card — there it opens the streak
              completion, so it doubles as "finish the book".
              Mobile: the bottom nav is hidden on the reader, so this sits just
              above the home-indicator safe area; sm+ the reader is a windowed
              card, so back to bottom-8. */}
          <SlideControls
            index={index}
            onPrev={goPrev}
            onNext={goNext}
            labels={{ previous: t("previousCard"), next: t("nextCard"), hint: t("swipeHint") }}
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
