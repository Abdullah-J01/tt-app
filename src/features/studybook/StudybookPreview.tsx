"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lock, X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { useCurrentLocale, localizeHref } from "@/i18n/Link";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { Button } from "@/components/ui/Button";
import { SlideControls } from "@/components/ui/SlideControls";
import {
  LOCK_MS,
  transitionPair,
  useCardTurn,
  useSlideAxis,
  useSwipeNav,
  useWheelNav,
} from "@/lib/cardSlide";
import { chapterFromParam, chapterParam } from "@/lib/chapters";
import { cn } from "@/lib/utils";
import { isFreeBook } from "./freePreview";
import type { Studybook } from "@/types";

/**
 * Walk a studybook's chapters without opening the full reader (UI brief §6.3):
 * one chapter per slide — title, artwork, summary, card count — then a closing
 * CTA. Driven by ?preview= in the URL so the banner button and the chapter tiles
 * can both open it (and it's deep-linkable / shareable), with ?chapter= picking
 * the chapter to land on.
 */
export function StudybookPreview({ book }: { book: Studybook }) {
  const t = useTranslations("features_studybook_StudybookPreview");
  const router = useRouter();
  const locale = useCurrentLocale();
  const { requireAuth } = useAuthGuard();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.has("preview");

  const chapters = book.chapters;
  const totalCards = book.cards.length;
  const slideCount = chapters.length + 1; // + final CTA slide

  const [index, setIndex] = useState(0);
  const lockRef = useRef(false);
  // Swipe is bound to the card, not the backdrop — the backdrop's click closes
  // the overlay, and a swipe ending there would close it mid-gesture.
  const cardRef = useRef<HTMLDivElement>(null);
  const axis = useSlideAxis();
  const { turn, begin, end } = useCardTurn();

  /** Locked while a card is in flight, so one gesture never skips two slides. */
  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(slideCount - 1, next));
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
    [index, slideCount, begin],
  );

  const goNext = useCallback(() => go(index + 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  // `open` gates both: the card only exists while the overlay is rendered, and a
  // ref can't announce that it mounted (see useSwipeNav). One axis here — every
  // slide is already a chapter, so there's nothing for a horizontal swipe to mean.
  useSwipeNav(cardRef, goNext, goPrev, { enabled: open });
  useWheelNav(cardRef, goNext, goPrev, { enabled: open, isLocked: () => lockRef.current });

  const close = useCallback(() => {
    // Opening pushed a ?preview history entry — pop it so Back returns to the
    // page before the studybook, not a duplicate detail entry. Fall back to
    // replace when opened via a deep link with no in-app history.
    if (window.history.length > 1) router.back();
    else router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Seed the starting slide from ?chapter= when the overlay opens. Jumping
  // straight there shouldn't turn a page, so any in-flight one is dropped.
  useEffect(() => {
    if (!open) return;
    setIndex(chapterFromParam(book, params.get("chapter")));
    end();
  }, [open, params, book, end]);

  // Lock page scroll + wire Escape / arrow keys while open. Lenis drives the
  // scroll and ignores `overflow: hidden`, so freeze it too (and lock <html>
  // overflow for the reduced-motion case where Lenis isn't running) — otherwise
  // the page keeps scrolling behind the open preview.
  useEffect(() => {
    if (!open) return;
    const lenis = window.__lenis;
    lenis?.stop();
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    // Match the iOS safe-area status-bar band (layout.tsx) to this card's own
    // plum gradient instead of the app-wide violet, while the preview is open.
    document.documentElement.style.setProperty("--status-bar-bg", "var(--color-plum-1)");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Up/Down included to match the reader's keys and the vertical swipe.
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      document.documentElement.style.removeProperty("--status-bar-bg");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, goNext, goPrev]);

  if (!open) return null;

  /**
   * Open the reader, optionally at a given chapter.
   *
   * replace: swap the ?preview history entry for /read, so Back from the reader
   * returns to the clean detail page instead of reopening this overlay (which
   * reads as "back is broken"). Free books let guests into the reader (it gates
   * after a few cards); paid books require login.
   */
  const startReading = (chapterIndex?: number) => {
    const query = chapterIndex != null ? `?chapter=${chapterParam(chapterIndex)}` : "";
    const openReader = () =>
      router.replace(localizeHref(`/studybook/${book.slug}/read${query}`, locale));
    if (isFreeBook(book)) openReader();
    else requireAuth(openReader, t("loginToLearn"));
  };

  /** One page's contents. Rendered twice while a page is mid-turn. */
  const renderSlide = (i: number) => {
    const chapter = chapters[i];
    if (chapter) {
      const art = chapter.cover ?? book.cover;
      return (
        <>
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {t("chapterLabel", { current: i + 1, total: chapters.length })}
          </span>
          <div className="min-h-0">
            {art && (
              <div className="relative mb-4 h-32 overflow-hidden rounded-2xl bg-white/10 sm:h-40">
                <Image
                  src={art}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-contain p-2"
                />
              </div>
            )}
            <h2 className="text-2xl leading-tight font-bold text-white sm:text-3xl">
              {chapter.title}
            </h2>
            <p className="mt-3 leading-relaxed text-white/90">{chapter.summary}</p>
            <p className="mt-3 text-sm text-white/60">
              {t("chapterCards", { count: chapter.cards.length })}
            </p>
          </div>
          <Button size="md" variant="secondary" onClick={() => startReading(i)}>
            {t("startChapter")}
          </Button>
        </>
      );
    }
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {book.cover ? (
          <div className="shadow-soft relative h-28 w-20 overflow-hidden rounded-lg">
            <Image src={book.cover} alt={book.title} fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur">
            <Lock className="h-8 w-8" />
          </span>
        )}
        <h2 className="mt-5 text-2xl font-bold text-white">
          {t("chaptersInside", { chapters: chapters.length, cards: totalCards })}
        </h2>
        <p className="mt-2 max-w-xs text-white/80">
          {book.priceEur != null
            ? t("unlockPrice", { price: book.priceEur.toFixed(2) })
            : t("keepGoing")}
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="mt-6 w-full max-w-xs"
          onClick={() => startReading()}
        >
          {t("startLearning")}
        </Button>
      </div>
    );
  };

  const pair = turn ? transitionPair(axis, turn.dir) : null;
  // Content sits where the old header/controls used to hold it in flow. The
  // bottom differs by breakpoint because the chevrons are taller than the hint.
  const CONTENT =
    "absolute inset-x-0 top-[calc(108px+env(safe-area-inset-top))] bottom-[72px] flex flex-col justify-between gap-6 px-6 pb-6 lg:bottom-[76px]";

  return (
    <div
      // z-[60]: above the fixed MobileNav (z-50, later in the DOM), which
      // otherwise sits on top of this dialog and swallows taps on the
      // Prev/Next controls at the bottom of the sheet.
      className="fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("previewOf", { title: book.title })}
      onClick={close}
    >
      <div
        ref={cardRef}
        // touch-none, like the reader: without it the browser claims a vertical
        // drag as a pan/overscroll and cancels the gesture, so the swipe never
        // lands. Safe here because the slide content is absolutely positioned
        // and never needs to scroll.
        className="pop-in bg-plum md:rounded-card md:shadow-soft relative h-[100svh] w-full max-w-md touch-none overflow-hidden text-white select-none md:h-[80vh] md:max-h-[720px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cards. Both copies stay transparent, so only the content travels and
            the card's gradient sits still behind them. Kept below the chrome
            (z-20) so the progress bar and buttons hold their position. */}
        <div
          onAnimationEnd={(e) => e.target === e.currentTarget && end()}
          className={cn("absolute inset-0", pair?.incoming)}
        >
          <div className={CONTENT}>{renderSlide(index)}</div>
        </div>

        {turn && pair && (
          <div
            // Keyed so a fresh transition remounts and restarts the animation
            // rather than reusing the element mid-flight.
            key={`${turn.from}:${turn.dir}`}
            onAnimationEnd={(e) => e.target === e.currentTarget && end()}
            className={cn("pointer-events-none absolute inset-0", pair.outgoing)}
          >
            <div className={CONTENT}>{renderSlide(turn.from)}</div>
          </div>
        )}

        {/* Chrome — pinned above the pages so it never turns with them. */}
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4">
          <div className="flex justify-end">
            <Button
              unstyled
              type="button"
              onClick={close}
              aria-label={t("closePreview")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Bars + count, laid out like the reader's header — the count lives
              here rather than beside the chevrons, which touch never sees. */}
          <div>
            <div
              className="flex gap-1"
              aria-label={t("slideOf", { current: index + 1, total: slideCount })}
            >
              {Array.from({ length: slideCount }).map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-white" : "bg-white/30")}
                />
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-white/55">
              {Math.min(index + 1, chapters.length)} / {chapters.length}
            </p>
          </div>
        </div>

        {/* Next stops at the CTA slide — unlike the reader, there's nothing past it. */}
        <SlideControls
          index={index}
          onPrev={goPrev}
          onNext={goNext}
          disableNext={index >= slideCount - 1}
          labels={{
            previous: t("previousChapter"),
            next: t("nextChapter"),
            hint: t("swipeChapterHint"),
          }}
          className="absolute inset-x-0 bottom-0 z-20 p-4"
        />
      </div>
    </div>
  );
}

/** Cover thumb + title/author, shown at the foot of each preview card. */
function BookAttribution({ book }: { book: Studybook }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-white/20">
        {book.cover && <Image src={book.cover} alt="" fill sizes="44px" className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{book.title}</p>
        <p className="truncate text-sm text-white/70">{book.author}</p>
      </div>
    </div>
  );
}
