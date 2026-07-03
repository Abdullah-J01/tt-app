"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Bookmark, ChevronUp, Zap } from "lucide-react";
import { ActionRail } from "./ActionRail";
import { SUBJECTS } from "@/config/subjects";
import { usePersistedFlag } from "@/lib/usePersistedFlag";
import { toastSaved } from "@/components/ui/Toaster";
import type { Studybook } from "@/types";

const LOCK_MS = 500;

const cardVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 64 : -64 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -64 : 64 }),
};

/**
 * Immersive studybook reader opened from "Start learning" on the detail page.
 * One card at a time on a dark gradient; swipe up / wheel / arrow keys advance.
 * The Save/Like/Share rail and the top Save both fire the shared "Saved" toast.
 */
export default function StudybookReader({ book }: { book: Studybook }) {
  const router = useRouter();
  const cards = book.cards;
  const total = cards.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const lockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const subject = SUBJECTS.find((s) => s.slug === book.subjectSlug)?.name ?? book.subjectSlug;
  const active = cards[index];

  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === index) return;
      setDir(clamped > index ? 1 : -1);
      setIndex(clamped);
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, LOCK_MS);
    },
    [index, total],
  );

  const goNext = useCallback(() => go(index + 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push(`/studybook/${book.slug}`);
  }, [router, book.slug]);

  // Wheel (desktop)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      if (e.deltaY > 0) goNext();
      else goPrev();
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  // Touch (mobile/tablet)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onStart(e: TouchEvent) {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    }
    function onEnd(e: TouchEvent) {
      if (touchStartY.current === null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(delta) < 45) return;
      if (delta > 0) goNext();
      else goPrev();
    }
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [goNext, goPrev]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-x-clip bg-black/60 backdrop-blur-sm lg:py-8">
      {/* Positioning frame — NOT clipped, so the rail can sit outside on desktop
          (same pattern as the feed on desktop). */}
      <div className="relative h-[100dvh] w-full max-w-full sm:h-[80vh] sm:max-h-[720px] sm:max-w-md">
        {/* Phone-style reader surface — clipped, rounded on larger screens */}
        <div
          ref={containerRef}
          className="bg-plum-gradient lg:shadow-glow relative h-full w-full touch-none overflow-hidden text-white select-none sm:rounded-[2.25rem] lg:rounded-[2.75rem]"
        >
          {/* Top bar: back · book title · save */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 pt-5">
            <button
              type="button"
              onClick={goBack}
              aria-label="Back to studybook"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex max-w-[60%] items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-white/90" />
              <span className="truncate">{book.title}</span>
            </div>
            <TopSave slug={book.slug} />
          </div>

          {/* Progress */}
          <div className="absolute inset-x-0 top-[68px] z-20 px-5">
            <div className="flex gap-1">
              {cards.map((c, i) => (
                <span
                  key={c.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-white/55">
              Card {index + 1} of {total}
            </p>
          </div>

          {/* Card content */}
          <div className="absolute inset-0 flex items-center px-6 sm:top-[104px] sm:bottom-20 sm:px-8">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={active.id}
                custom={dir}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md pr-16"
              >
                <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                  {subject}
                </p>
                <h2 className="font-display text-3xl leading-tight font-bold text-white sm:text-3xl">
                  {active.heading}
                </h2>

                {/* Book cover */}
                <div className="relative my-6 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] sm:my-4 sm:h-36">
                  {book.cover ? (
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 90vw, 420px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-white/40" />
                  )}
                </div>

                <p className="text-[15px] leading-relaxed text-white/75">{active.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Swipe hint */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next card"
            className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-1 text-white/60"
          >
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronUp className="h-5 w-5" />
            </motion.span>
            <span className="text-xs font-medium">Swipe up · next card</span>
          </button>
        </div>

        {/* Action rail (Save / Like / Share) — sibling of the frame so it sits
            inside the card on mobile and outside it on desktop, like the feed. */}
        <div className="absolute right-4 bottom-28 z-30 sm:bottom-32 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-full lg:ml-5 lg:-translate-y-1/2">
          <ActionRail id={active.id} shareTitle={book.title} />
        </div>
      </div>
    </main>
  );
}

/** Top-bar save toggle — persisted per book, fires the shared "Saved" toast. */
function TopSave({ slug }: { slug: string }) {
  const [saved, setSaved] = usePersistedFlag(`tt:save:${slug}`);
  const toggle = () => {
    const next = !saved;
    setSaved(next);
    if (next) toastSaved(() => setSaved(false));
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Saved" : "Save"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
    >
      <Bookmark className={`h-5 w-5 ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
