"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.has("preview");

  const previewCards = book.cards.slice(0, PREVIEW_LIMIT);
  const remaining = book.cards.length - previewCards.length;
  const slideCount = previewCards.length + 1; // + final CTA slide

  const [index, setIndex] = useState(0);

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
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, slideCount - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, slideCount]);

  if (!open) return null;

  const isCta = index >= previewCards.length;
  const card = previewCards[index];

  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${book.title}`}
      onClick={close}
    >
      <div
        className="pop-in bg-plum md:rounded-card md:shadow-soft relative flex h-[100svh] w-full max-w-md flex-col overflow-hidden text-white md:h-[80vh] md:max-h-[720px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: progress + close */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex flex-1 gap-1" aria-label={`Slide ${index + 1} of ${slideCount}`}>
            {Array.from({ length: slideCount }).map((_, i) => (
              <span
                key={i}
                className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-white" : "bg-white/30")}
              />
            ))}
          </div>
          <Button
            unstyled
            type="button"
            onClick={close}
            aria-label="Close preview"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Slide body */}
        <div className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6">
          {!isCta && card ? (
            <>
              <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                {book.category} · Preview
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
                {remaining > 0
                  ? `${remaining} more card${remaining === 1 ? "" : "s"} inside`
                  : "That's the preview"}
              </h2>
              <p className="mt-2 max-w-xs text-white/80">
                {book.priceEur != null
                  ? `Unlock the full studybook for €${book.priceEur.toFixed(2)}.`
                  : "Keep going in the full reader."}
              </p>
              <Link href={`/studybook/${book.slug}/read`} className="mt-6 w-full max-w-xs">
                <Button size="lg" variant="secondary" className="w-full">
                  Start learning
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-between p-4">
          <Button
            unstyled
            type="button"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            aria-label="Previous card"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-sm text-white/70">
            {Math.min(index + 1, previewCards.length)} / {previewCards.length}
          </span>
          <Button
            unstyled
            type="button"
            onClick={() => setIndex((i) => Math.min(i + 1, slideCount - 1))}
            disabled={index >= slideCount - 1}
            aria-label="Next card"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
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
