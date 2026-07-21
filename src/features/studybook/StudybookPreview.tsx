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
import { cn } from "@/lib/utils";
import { FREE_PREVIEW_CARDS, isFreeBook } from "./freePreview";
import type { Studybook } from "@/types";

/** Free cards shown before the preview stops and offers the full studybook. */
const PREVIEW_LIMIT = FREE_PREVIEW_CARDS;

/**
 * Peek at the first few cards of a studybook without opening the full reader
 * (UI brief §6.3). Driven by ?preview= in the URL so the banner button and the
 * "Cards preview" tiles can both open it (and it's deep-linkable / shareable).
 */
export function StudybookPreview({ book }: { book: Studybook }) {
  const t = useTranslations("features_studybook_StudybookPreview");
  const router = useRouter();
  const locale = useCurrentLocale();
  const { requireAuth } = useAuthGuard();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.has("preview");

  const previewCards = book.cards.slice(0, PREVIEW_LIMIT);
  const remaining = book.cards.length - previewCards.length;
  const slideCount = previewCards.length + 1; // + final CTA slide

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
  // ref can't announce that it mounted (see useSwipeNav).
  useSwipeNav(cardRef, goNext, goPrev, open);
  useWheelNav(cardRef, goNext, goPrev, { enabled: open, isLocked: () => lockRef.current });

  const close = useCallback(() => {
    // Opening pushed a ?preview history entry — pop it so Back returns to the
    // page before the studybook, not a duplicate detail entry. Fall back to
    // replace when opened via a deep link with no in-app history.
    if (window.history.length > 1) router.back();
    else router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Seed the starting slide from ?card= when the overlay opens. Jumping straight
  // there shouldn't turn a page, so any in-flight one is dropped.
  useEffect(() => {
    if (!open) return;
    const raw = Number(params.get("card"));
    const start = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), previewCards.length) : 0;
    setIndex(start);
    end();
  }, [open, params, previewCards.length, end]);

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
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, goNext, goPrev]);

  if (!open) return null;

  /** One page's contents. Rendered twice while a page is mid-turn. */
  const renderSlide = (i: number) => {
    const card = previewCards[i];
    if (card) {
      return (
        <>
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {t("categoryPreview", { category: book.category })}
          </span>
          <div>
            <h2 className="text-3xl leading-tight font-bold text-white">{card.heading}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90">{card.body}</p>
          </div>
          <BookAttribution book={book} />
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
          {remaining > 0 ? t("moreCardsInside", { count: remaining }) : t("previewEnd")}
        </h2>
        <p className="mt-2 max-w-xs text-white/80">
          {book.priceEur != null
            ? t("unlockPrice", { price: book.priceEur.toFixed(2) })
            : t("keepGoing")}
        </p>
        {/* replace: swap the ?preview history entry for /read, so Back from the
            reader returns to the clean detail page instead of reopening this
            overlay (which reads as "back is broken"). Free books let guests into
            the reader (it gates after a few cards); paid books require login. */}
        <Button
          size="lg"
          variant="secondary"
          className="mt-6 w-full max-w-xs"
          onClick={() => {
            const openReader = () =>
              router.replace(localizeHref(`/studybook/${book.slug}/read`, locale));
            if (isFreeBook(book)) openReader();
            else requireAuth(openReader, t("loginToLearn"));
          }}
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
    "absolute inset-x-0 top-[108px] bottom-[72px] flex flex-col justify-between gap-6 px-6 pb-6 lg:bottom-[76px]";

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
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4">
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
              {Math.min(index + 1, previewCards.length)} / {previewCards.length}
            </p>
          </div>
        </div>

        {/* Next stops at the CTA slide — unlike the reader, there's nothing past it. */}
        <SlideControls
          index={index}
          onPrev={goPrev}
          onNext={goNext}
          disableNext={index >= slideCount - 1}
          labels={{ previous: t("previousCard"), next: t("nextCard"), hint: t("swipeHint") }}
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
