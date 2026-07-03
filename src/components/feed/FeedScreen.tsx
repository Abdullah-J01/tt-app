"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
// import FeedNavbar from "./FeedNavbar";
import Navbar from "@/components/layout/Navbar";
import FeedCard from "./FeedCard";
import NavControls from "./NavControls";
import SideActions from "./SideActions";
import { getForYouFeed, type FeedItem } from "@/lib/api";
import type { FeedCardData } from "./feedData";

const TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
const INSTANT = { duration: 0 };
const LOCK_MS = 620;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function toCardData({ card, book }: FeedItem, slug: string): FeedCardData {
  return {
    id: card.id,
    slug,
    streakDays: 7,
    subject: book.subjectSlug,
    grade: book.grade,
    title: card.heading,
    description: card.body,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookSubject: book.subjectSlug,
    likes: "",
    shares: "",
  };
}

/**
 * Map feed items to cards, giving each a unique, readable slug. Headings can
 * repeat across studybooks (e.g. "Why it matters"), so collisions get a numeric
 * suffix — keeping every card's `?slug=` deep-link unique.
 */
function withSlugs(items: FeedItem[]): FeedCardData[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = slugify(item.card.heading) || item.card.id;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return toCardData(item, n === 1 ? base : `${base}-${n}`);
  });
}

/** Read the active-card slug from the current URL. */
function slugFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("slug");
}

export default function FeedScreen() {
  const [cards, setCards] = useState<FeedCardData[]>([]);
  const [index, setIndex] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  // Gate the scroll transition so the initial slug-restore lands instantly (no
  // scroll-through), then enable smooth animation for user navigation.
  const [ready, setReady] = useState(false);
  const lockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const total = cards.length;

  // Load the feed, then restore the active card from ?slug= (default: first).
  useEffect(() => {
    let active = true;
    getForYouFeed().then((items) => {
      if (!active) return;
      const mapped = withSlugs(items);
      setCards(mapped);
      const slug = slugFromUrl();
      const found = slug ? mapped.findIndex((c) => c.slug === slug) : -1;
      const start = found >= 0 ? found : 0;
      setIndex(start);
      if (mapped[start]) {
        // Normalize the URL to the resolved card without adding a history entry.
        window.history.replaceState(null, "", `?slug=${mapped[start].slug}`);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = trackWrapRef.current;
    if (!el) return;
    const update = () => setTrackHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Once the restored card is positioned (cards + height known), enable smooth
  // transitions on the next frame — the restore itself stays instant.
  useEffect(() => {
    if (ready || total === 0 || trackHeight === 0) return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [ready, total, trackHeight]);

  const goTo = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === index) return;
      lockRef.current = true;
      setIndex(clamped);
      const slug = cards[clamped]?.slug;
      if (slug) {
        // Push a history entry per card so Back/Forward moves between cards.
        window.history.pushState(null, "", `?slug=${slug}`);
      }
      window.setTimeout(() => {
        lockRef.current = false;
      }, LOCK_MS);
    },
    [cards, index, total],
  );

  // Sync the active card when the user hits Back/Forward (popstate → no push).
  useEffect(() => {
    function onPopState() {
      const slug = slugFromUrl();
      const found = slug ? cards.findIndex((c) => c.slug === slug) : -1;
      lockRef.current = false;
      setIndex(found >= 0 ? found : 0);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [cards]);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Wheel navigation (desktop)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (lockRef.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      if (e.deltaY > 0) goNext();
      else goPrev();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  // Touch navigation (mobile/tablet)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (Math.abs(delta) < 45) return;
      if (delta > 0) goNext();
      else goPrev();
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev]);

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  return (
    <main className="relative flex h-[85dvh] flex-col overflow-hidden">
      {/* <FeedNavbar streak={7} /> */}
      <Navbar />

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Study cards feed"
      >
        {/* live region for screen readers */}
        <p className="sr-only" aria-live="polite">
          Card {index + 1} of {total}: {cards[index]?.title}
        </p>

        <NavControls index={index} total={total} onPrev={goPrev} onNext={goNext} onSelect={goTo} />

        <div className="relative flex h-full w-full items-center justify-center py-4 sm:py-6 lg:py-8">
          <div className="relative h-full w-full max-w-full sm:h-[92%] lg:h-[94%] lg:max-w-[400px] xl:max-w-[420px]">
            <div
              ref={trackWrapRef}
              className="lg:shadow-glow relative h-full w-full overflow-hidden rounded-none shadow-none sm:rounded-[2.25rem] lg:rounded-[2.75rem]"
            >
              <motion.div
                className="absolute inset-x-0 top-0"
                animate={{ y: -index * trackHeight }}
                transition={ready ? TRANSITION : INSTANT}
              >
                {cards.map((card, i) => (
                  <div key={card.id} style={{ height: trackHeight || "100%" }} className="w-full">
                    <FeedCard card={card} active={i === index} />
                  </div>
                ))}
              </motion.div>
            </div>

            <SideActions />
          </div>
        </div>
      </div>
    </main>
  );
}
