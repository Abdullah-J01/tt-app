"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { useCurrentLocale, localizeHref } from "@/i18n/Link";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { Button } from "@/components/ui/Button";
import { SlideControls } from "@/components/ui/SlideControls";
import {
  cardVariants,
  LOCK_MS,
  useSlideAxis,
  useSwipeNav,
  type SlideCustom,
} from "@/lib/cardSlide";
import { cn } from "@/lib/utils";
import type { Studybook } from "@/types";

/** Free cards shown before the preview stops and offers the full studybook. */
const PREVIEW_LIMIT = 3;

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
  const [dir, setDir] = useState(1);
  const lockRef = useRef(false);
  // Swipe is bound to the card, not the backdrop — the backdrop's click closes
  // the overlay, and a swipe ending there would close it mid-gesture.
  const cardRef = useRef<HTMLDivElement>(null);
  const axis = useSlideAxis();
  const slide: SlideCustom = { dir, axis };

  /** Locked while a card is in flight, so one gesture never skips two slides. */
  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(slideCount - 1, next));
      if (clamped === index) return;
      setDir(clamped > index ? 1 : -1);
      setIndex(clamped);
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, LOCK_MS);
    },
    [index, slideCount],
  );

  const goNext = useCallback(() => go(index + 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  useSwipeNav(cardRef, goNext, goPrev);

  const close = useCallback(() => {
    // Opening pushed a ?preview history entry — pop it so Back returns to the
    // page before the studybook, not a duplicate detail entry. Fall back to
    // replace when opened via a deep link with no in-app history.
    if (window.history.length > 1) router.back();
    else router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Seed the starting slide from ?card= when the overlay opens.
  useEffect(() => {
    if (!open) return;
    const raw = Number(params.get("card"));
    const start = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), previewCards.length) : 0;
    setIndex(start);
  }, [open, params, previewCards.length]);

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

  const isCta = index >= previewCards.length;
  const card = previewCards[index];

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
        className="pop-in bg-plum md:rounded-card md:shadow-soft relative flex h-[100svh] w-full max-w-md flex-col overflow-hidden text-white md:h-[80vh] md:max-h-[720px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: close on top, progress below */}
        <div className="flex flex-col gap-3 p-4">
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

        {/* Slide body — relative so popLayout can pull the outgoing slide out
            of flow while the incoming one takes its place. */}
        <div className="relative flex flex-1 flex-col px-6 pb-6">
          <AnimatePresence mode="popLayout" custom={slide} initial={false}>
            <motion.div
              key={index}
              custom={slide}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col justify-between gap-6"
            >
              {!isCta && card ? (
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
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  {book.cover ? (
                    <div className="shadow-soft relative h-28 w-20 overflow-hidden rounded-lg">
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
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
                  {/* replace: swap the ?preview history entry for /read, so Back
                      from the reader returns to the clean detail page instead of
                      reopening this overlay (which reads as "back is broken").
                      Gated: guests get the login popup instead of navigating. */}
                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-6 w-full max-w-xs"
                    onClick={() =>
                      requireAuth(
                        () => router.replace(localizeHref(`/studybook/${book.slug}/read`, locale)),
                        t("loginToLearn"),
                      )
                    }
                  >
                    {t("startLearning")}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next stops at the CTA slide — unlike the reader, there's nothing past it. */}
        <SlideControls
          index={index}
          onPrev={goPrev}
          onNext={goNext}
          disableNext={index >= slideCount - 1}
          labels={{ previous: t("previousCard"), next: t("nextCard"), hint: t("swipeHint") }}
          className="p-4"
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
