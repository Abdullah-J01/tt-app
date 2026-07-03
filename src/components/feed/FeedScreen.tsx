"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
// import FeedNavbar from "./FeedNavbar";
import Navbar from "@/components/layout/Navbar";
import FeedCard from "./FeedCard";
import NavControls from "./NavControls";
import SideActions from "./SideActions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createFilterPredicate } from "@/features/explore/filters";
import { FilterDrawer } from "@/features/explore/components/FilterDrawer";
import { FilterPanel } from "@/features/explore/components/FilterPanel";
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
    bookSlug: book.slug,
    cover: book.cover,
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

/** Feed items whose studybook matches the checked filters, mapped to cards. */
function filteredCards(items: FeedItem[], selected: ReadonlySet<string>): FeedCardData[] {
  if (selected.size === 0) return withSlugs(items);
  const matches = createFilterPredicate(selected);
  return withSlugs(items.filter((item) => matches(item.book)));
}

export default function FeedScreen() {
  const [items, setItems] = useState<FeedItem[]>([]);
  // Applied filters drive the feed; the draft only lives while the drawer is
  // open and commits on "Show results" (backdrop/X discards it).
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  // Gate the scroll transition so the initial slug-restore lands instantly (no
  // scroll-through), then enable smooth animation for user navigation.
  const [ready, setReady] = useState(false);
  const lockRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => filteredCards(items, applied), [items, applied]);
  const total = cards.length;
  /** Live count for the drawer — what the feed will show if the draft commits. */
  const draftCount = useMemo(() => filteredCards(items, draft).length, [items, draft]);

  // Load the feed, then restore the active card from ?slug= (default: first).
  useEffect(() => {
    let active = true;
    getForYouFeed().then((loaded) => {
      if (!active) return;
      setItems(loaded);
      // No filters are applied at load, so the visible cards are all items.
      const mapped = withSlugs(loaded);
      const slug = slugFromUrl();
      const found = slug ? mapped.findIndex((c) => c.slug === slug) : -1;
      const start = found >= 0 ? found : 0;
      setIndex(start);
      if (mapped[start]) {
        // Normalize the URL to the resolved card without adding a history entry.
        // Pass null (Next's documented pattern) so Next's patched replaceState
        // syncs the router's canonical URL/tree. Passing window.history.state
        // carries Next's `__NA` flag, which makes Next treat this as an internal
        // call and skip that sync — corrupting router.back() after you leave the feed.
        window.history.replaceState(null, "", `?slug=${mapped[start].slug}`);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const openFilters = useCallback(() => {
    setDraft(new Set(applied));
    setFiltersOpen(true);
  }, [applied]);

  const toggleDraft = useCallback((key: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  /** Commit the draft: refilter the feed, jump to its first card. */
  const applyFilters = useCallback(() => {
    setApplied(new Set(draft));
    setFiltersOpen(false);
    setIndex(0);
    const first = filteredCards(items, draft)[0];
    if (first) window.history.replaceState(null, "", `?slug=${first.slug}`);
  }, [draft, items]);

  const clearApplied = useCallback(() => {
    setApplied(new Set());
    setDraft(new Set());
    setIndex(0);
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
        // Pass null so Next's patched pushState copies its internal state into the
        // new entry AND syncs the router URL/tree. Passing window.history.state
        // carries `__NA`, which makes Next skip that sync and breaks router.back()
        // after you leave the feed for a detail page.
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
      touchStartY.current = e.touches[0]?.clientY ?? null;
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartY.current === null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;
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

  // Keyboard navigation (paused while the filter drawer is open)
  useEffect(() => {
    if (filtersOpen) return;
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
  }, [goNext, goPrev, filtersOpen]);

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

        {total > 0 && (
          <NavControls index={index} total={total} onPrev={goPrev} onNext={goNext} onSelect={goTo} />
        )}

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
                    <FeedCard
                      card={card}
                      active={i === index}
                      onOpenFilters={openFilters}
                      filterCount={applied.size}
                    />
                  </div>
                ))}
              </motion.div>

              {/* Filters excluded every card — keep the filter entry point reachable */}
              {items.length > 0 && total === 0 && (
                <div className="bg-surface absolute inset-0 grid place-items-center">
                  <EmptyState
                    icon={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
                    title="Nothing matches your filters"
                    description="Try removing a filter or two to see more cards."
                    action={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={openFilters}>
                          Edit filters
                        </Button>
                        <Button size="sm" onClick={clearApplied}>
                          Clear filters
                        </Button>
                      </div>
                    }
                  />
                </div>
              )}
            </div>

            {cards[index] && (
              <SideActions id={cards[index].id} shareTitle={cards[index].bookTitle} />
            )}
          </div>
        </div>
      </div>

      {/* Filter drawer: bottom sheet on mobile, right side panel on md+. The
          footer commits the draft; backdrop/X discards it. */}
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilters}
        resultCount={draftCount}
      >
        <FilterPanel
          resultCount={draftCount}
          selected={draft}
          onToggle={toggleDraft}
          onClear={() => setDraft(new Set())}
          searchable
        />
      </FilterDrawer>
    </main>
  );
}
