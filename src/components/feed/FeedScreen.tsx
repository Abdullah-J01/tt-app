"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
// import FeedNavbar from "./FeedNavbar";
import Navbar from "@/components/layout/Navbar";
import FeedCard from "./FeedCard";
import FeedTopBar from "./FeedTopBar";
import { FeedCardSkeleton, NavControlsSkeleton, SideActionsSkeleton } from "@/components/skeletons";
import NavControls from "./NavControls";
import SideActions, { type SideActionsHandle } from "./SideActions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createFilterPredicate } from "@/features/explore/filters";
import { FilterDrawer } from "@/features/explore/components/FilterDrawer";
import { FilterPanel } from "@/features/explore/components/FilterPanel";
import type { FeedItem } from "@/lib/api";
import { feedPath, withSlugs, type FeedCardData } from "./feedData";
import { stripLocale, localizeHref } from "@/i18n/Link";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

const TRANSITION = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };
const INSTANT = { duration: 0 };
// Slightly above the slide duration so a new gesture can land right as it settles.
const LOCK_MS = 420;

/**
 * Read the active-card slug from the current URL. The path is locale-prefixed
 * and slug-translated (`/en/feed/x`, `/et/voog/x`), so canonicalize it first.
 */
function slugFromUrl(): string | null {
  const slug = stripLocale(window.location.pathname).match(/^\/feed\/([^/]+)/)?.[1];
  return slug ? decodeURIComponent(slug) : null;
}

/** Active locale from the current URL, defaulting when unprefixed. */
function localeFromUrl(): Locale {
  const seg = window.location.pathname.split("/")[1];
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/**
 * Locale-prefixed deep-link for the browser URL (`/en/feed/x`, `/et/voog/x`).
 * Keeping the locale segment is what stops the language from silently resetting
 * to the default when the feed rewrites the URL via the History API.
 */
function feedUrl(slug: string): string {
  return localizeHref(feedPath(slug), localeFromUrl());
}

/** Feed items whose studybook matches the checked filters, mapped to cards. */
function filteredCards(items: FeedItem[], selected: ReadonlySet<string>): FeedCardData[] {
  if (selected.size === 0) return withSlugs(items);
  const matches = createFilterPredicate(selected);
  return withSlugs(items.filter((item) => matches(item.book)));
}

/**
 * Studybooks fetched per request — each contributes its cards, so a page of 6
 * lands roughly 18 cards. Enough to swipe through while the next page loads.
 */
const BOOKS_PER_PAGE = 6;
/** How close to the last loaded card we get before pulling the next page. */
const PREFETCH_WITHIN = 4;
/** Safety net for the deep-link scan so a bad slug can't page the whole catalogue. */
const MAX_DEEPLINK_PAGES = 20;

interface FeedPage {
  items: FeedItem[];
  nextCursor?: string;
}

async function fetchFeedPage(cursor?: string): Promise<FeedPage> {
  const params = new URLSearchParams({ books: String(BOOKS_PER_PAGE) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/feed?${params}`);
  if (!res.ok) throw new Error(`GET /api/feed → ${res.status}`);
  return (await res.json()) as FeedPage;
}

export default function FeedScreen() {
  const t = useTranslations("components_feed_FeedScreen");
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Cursor for the next unloaded page; undefined once the feed is exhausted.
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  // Ref (not state) so the append effect can guard re-entry without re-running.
  const loadingMoreRef = useRef(false);
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
  const sideActionsRef = useRef<SideActionsHandle>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  const cards = useMemo(() => filteredCards(items, applied), [items, applied]);
  const total = cards.length;
  /** Live count for the drawer — what the feed will show if the draft commits. */
  const draftCount = useMemo(() => filteredCards(items, draft).length, [items, draft]);

  // Load the feed from /api/feed (data stays server-side — the upstream fetch
  // cache applies there), then restore the active card from /feed/[slug]
  // (default: first).
  //
  // The feed pages rather than loading the whole catalogue: the first card must
  // paint without waiting on every other one, and each loaded card is a live DOM
  // node in the track below, so an unpaged feed also costs swipe smoothness.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // A deep-link may point at a card beyond the first page, so keep paging
        // until it resolves. Direct navigation to /feed/[slug] is the rare path;
        // the common one (no slug) settles after a single request.
        const wanted = slugFromUrl();
        const loaded: FeedItem[] = [];
        let next: string | undefined;
        let found = -1;

        for (let i = 0; i < MAX_DEEPLINK_PAGES; i++) {
          const page = await fetchFeedPage(next);
          if (!active) return;
          loaded.push(...page.items);
          next = page.nextCursor;

          if (!wanted) break;
          found = withSlugs(loaded).findIndex((c) => c.slug === wanted);
          if (found >= 0 || !next) break;
        }
        if (!active) return;

        setLoading(false);
        setItems(loaded);
        setCursor(next);

        // No filters are applied at load, so the visible cards are all items.
        const mapped = withSlugs(loaded);
        const start = found >= 0 ? found : 0;
        setIndex(start);
        if (mapped[start]) {
          // Normalize the URL to the resolved card without adding a history entry.
          // Pass null (Next's documented pattern) so Next's patched replaceState
          // syncs the router's canonical URL/tree. Passing window.history.state
          // carries Next's `__NA` flag, which makes Next treat this as an internal
          // call and skip that sync — corrupting router.back() after you leave the feed.
          window.history.replaceState(null, "", feedUrl(mapped[start].slug));
        }
      } catch (err) {
        // Leave the feed empty rather than crash; the EmptyState covers the UI.
        console.error("Failed to load feed:", err);
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Append the next page as the active card nears the end of what's loaded, so
   * the swipe never waits on the network.
   *
   * Keyed on the *unfiltered* `items` length: filters run client-side over
   * loaded items only, so an active filter can shrink `cards` well below the
   * loaded count and would otherwise stall paging.
   * TODO(team): once TT filters the feed server-side, pass the checked facets
   * to /api/feed and drop the client-side predicate.
   */
  useEffect(() => {
    if (!cursor || loadingMoreRef.current) return;
    if (items.length === 0) return;
    const nearEnd = index >= cards.length - PREFETCH_WITHIN;
    if (!nearEnd) return;

    let active = true;
    loadingMoreRef.current = true;
    fetchFeedPage(cursor)
      .then((page) => {
        if (!active) return;
        setItems((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      })
      .catch((err) => {
        // Non-fatal: the reader keeps the cards already loaded.
        console.error("Failed to load more feed cards:", err);
      })
      .finally(() => {
        loadingMoreRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [cursor, index, cards.length, items.length]);

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
    if (first) window.history.replaceState(null, "", feedUrl(first.slug));
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
        window.history.pushState(null, "", feedUrl(slug));
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

  const goNextRef = useRef(goNext);
  const goPrevRef = useRef(goPrev);
  useEffect(() => {
    goNextRef.current = goNext;
    goPrevRef.current = goPrev;
  }, [goNext, goPrev]);

  const goBack = useCallback(() => router.push("/explore"), [router]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let accum = 0;
    let consumed = false;
    let reset: number | undefined;

    function armReset() {
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        if (lockRef.current) {
          armReset();
          return;
        }
        accum = 0;
        consumed = false;
      }, 70);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      armReset();
      if (consumed || lockRef.current) {
        // This gesture already advanced a card (or a transition is in flight) —
        // swallow the leftover trackpad momentum instead of queuing another.
        accum = 0;
        return;
      }
      accum += e.deltaY;
      if (Math.abs(accum) < 40) return;
      const delta = accum;
      accum = 0;
      // Lock out the rest of this gesture until its events stop arriving.
      consumed = true;
      if (delta > 0) goNextRef.current();
      else goPrevRef.current();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(reset);
    };
    // Mount once and never tear down — the callbacks are read from refs so the
    // per-gesture accumulator/`consumed` guard survive across card changes.
  }, []);

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

  // Instagram-style like gesture on the card area: double click (desktop) or
  // double tap (touch). Taps on buttons/links inside the card are ignored, and
  // the tiny tap movement never reaches the swipe handler's 45px threshold, so
  // the two gestures don't conflict. SideActions owns the actual like + heart
  // flight (it knows the session state and the Like button's live position).
  useEffect(() => {
    const el = trackWrapRef.current;
    if (!el) return;

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && target.closest("button, a") !== null;

    function onDoubleClick(e: MouseEvent) {
      if (isInteractive(e.target)) return;
      // Double click also selects text — clear it so the gesture feels clean.
      window.getSelection()?.removeAllRanges();
      sideActionsRef.current?.likeAt(e.clientX, e.clientY);
    }

    function onTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];
      if (!touch || isInteractive(e.target)) return;
      const now = performance.now();
      const prev = lastTap.current;
      lastTap.current = { t: now, x: touch.clientX, y: touch.clientY };
      const isDoubleTap =
        prev &&
        now - prev.t < 300 &&
        Math.hypot(touch.clientX - prev.x, touch.clientY - prev.y) < 24;
      if (isDoubleTap) {
        lastTap.current = null;
        sideActionsRef.current?.likeAt(touch.clientX, touch.clientY);
      }
    }

    el.addEventListener("dblclick", onDoubleClick);
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("dblclick", onDoubleClick);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

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

  // Mobile: opt out of AppChrome's pt-20 spacer (-mt-20) and fill the whole
  // viewport. The bottom nav is hidden on the feed (MobileNav bails on immersive
  // routes), so the card claims that space too — only the home-indicator safe
  // area is reserved. md+ keeps the original 85dvh stage.
  return (
    <main className="relative -mt-20 flex h-[calc(100dvh-env(safe-area-inset-bottom))] flex-col overflow-hidden md:mt-0 md:h-[85dvh]">
      {/* <FeedNavbar streak={7} /> */}
      {/* Desktop-only: mobile keeps the immersive full-screen card (no header) */}
      <div className="max-md:hidden">
        <Navbar />
      </div>

      {/* data-lenis-prevent: the page-level Lenis smooth scroll would otherwise
          also react to wheel events here and drag the page while cards change. */}
      <div
        ref={containerRef}
        data-lenis-prevent
        className="relative min-h-0 flex-1 overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label={t("carouselLabel")}
      >
        {/* live region for screen readers */}
        <p className="sr-only" aria-live="polite">
          {loading
            ? t("loading")
            : t("cardPosition", { index: index + 1, total, title: cards[index]?.title ?? "" })}
        </p>

        {loading && <NavControlsSkeleton />}
        {total > 0 && (
          <NavControls
            index={index}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={goTo}
          />
        )}

        <div className="relative flex h-full w-full items-center justify-center sm:pb-6 lg:pb-8">
          <div className="relative h-full w-full max-w-full sm:h-[92%] lg:h-[94%] lg:max-w-[400px] xl:max-w-[420px]">
            <div
              ref={trackWrapRef}
              className="lg:shadow-glow relative h-full w-full overflow-hidden rounded-none shadow-none sm:rounded-[2.25rem] lg:rounded-[2.75rem]"
            >
              {loading && <FeedCardSkeleton />}
              <motion.div
                className="absolute inset-x-0 top-0 will-change-transform"
                animate={{ y: -index * trackHeight }}
                transition={ready ? TRANSITION : INSTANT}
              >
                {cards.map((card, i) => (
                  <div key={card.id} style={{ height: trackHeight || "100%" }} className="w-full">
                    <FeedCard
                      card={card}
                      active={i === index}
                      // Active card + neighbours: eager cover fetch + ambient blobs,
                      // so the next swipe lands fully dressed.
                      near={Math.abs(i - index) <= 1}
                      index={i}
                      total={total}
                    />
                  </div>
                ))}
              </motion.div>

              {/* One fixed top bar over the stage on every breakpoint — a copy
                  inside FeedCard would swipe along with the card track. Mobile
                  gets the back arrow; desktop has the Navbar above instead. */}
              {total > 0 && (
                <>
                  <FeedTopBar
                    className="md:hidden"
                    onBack={goBack}
                    onOpenFilters={openFilters}
                    filterCount={applied.size}
                  />
                  <FeedTopBar
                    className="max-md:hidden"
                    onOpenFilters={openFilters}
                    filterCount={applied.size}
                  />
                </>
              )}

              {/* Filters excluded every card — keep the filter entry point reachable */}
              {items.length > 0 && total === 0 && (
                <div className="bg-surface absolute inset-0 grid place-items-center">
                  <EmptyState
                    icon={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
                    title={t("emptyTitle")}
                    description={t("emptyBody")}
                    action={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={openFilters}>
                          {t("editFilters")}
                        </Button>
                        <Button size="sm" onClick={clearApplied}>
                          {t("clearFilters")}
                        </Button>
                      </div>
                    }
                  />
                </div>
              )}
            </div>

            {loading && <SideActionsSkeleton />}
            {cards[index] && <SideActions ref={sideActionsRef} card={cards[index]} />}
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
