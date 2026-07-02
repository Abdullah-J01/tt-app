"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { GRADES, SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";
import {
  applyFilters,
  createFilterPredicate,
  effectiveSubjectSlugs,
  toggleSubjectSlug,
} from "../filters";
import { ActiveFilters } from "./ActiveFilters";
import { CoverCard } from "./CoverCard";
import { FilterDrawer } from "./FilterDrawer";
import { FilterPanel } from "./FilterPanel";
import { Pagination } from "./Pagination";
import { SortMenu, sortBooks, type Sort } from "./SortMenu";
import { StudybiteCard } from "./StudybiteCard";
import { SubjectRail } from "./SubjectRail";
import type { Studybite } from "../data";
import type { Studybook } from "@/types";

type Tab = "books" | "bites";
type View = "grid" | "list";

interface ExploreViewProps {
  books: Studybook[];
  studybites: Studybite[];
}

/**
 * Explore landing (UI brief §6.4), TT-style three-panel catalog. Mobile-first:
 * everything stacks (filters in a drawer, subjects as a scroll rail); from lg
 * the filter sidebar docks left; from xl the subject rail becomes a sticky
 * middle column. One selection set drives the chips, rail, panel and results.
 */
export function ExploreView({ books, studybites }: ExploreViewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("books");
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<View>("grid");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Every control that changes what's listed starts back at page 1.
  const toggle = (key: string) => {
    setPage(1);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const clear = () => {
    setPage(1);
    setSelected(new Set());
  };
  /** "All" chip = no Target Group values checked. */
  const clearTarget = () => {
    setPage(1);
    setSelected((prev) => new Set([...prev].filter((k) => !k.startsWith("target:"))));
  };
  const anyTarget = [...selected].some((k) => k.startsWith("target:"));
  /** The subject rail is contextual — it appears once a subject filter is checked. */
  const showRail = [...selected].some((k) => k.startsWith("subject:"));

  /** Rail highlight state: checked groups count as all their member subjects. */
  const railSelected = useMemo(() => {
    const expanded = new Set(selected);
    for (const slug of effectiveSubjectSlugs(selected)) expanded.add(`subject:${slug}`);
    return expanded;
  }, [selected]);

  /** Rail toggles go through the group-aware helper (a group dissolves into siblings). */
  const toggleRailSubject = (key: string) => {
    setPage(1);
    setSelected((prev) => toggleSubjectSlug(prev, key.slice("subject:".length)));
  };

  const booksF = useMemo(
    () => sortBooks(applyFilters(books, selected), sort),
    [books, selected, sort],
  );
  const bitesF = useMemo(() => {
    if (selected.size === 0) return studybites;
    const matches = createFilterPredicate(selected);
    return studybites.filter((s) => matches(s.book));
  }, [studybites, selected]);

  const resultCount = tab === "books" ? booksF.length : bitesF.length;

  // ~4 rows per page (page size follows the column count of the active layout).
  const pageSize = tab === "bites" ? 12 : view === "list" ? 8 : showRail ? 12 : 16;
  const totalPages = Math.max(1, Math.ceil(resultCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageBooks = booksF.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageBites = bitesF.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goToPage = (p: number) => {
    setPage(p);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:py-10 md:pb-12">
      {/* Sticky header on mobile — search lives in the TopNav on md+, so mobile
          only gets a compact shortcut to the full-screen search screen */}
      <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-hairline bg-surface/95 px-4 pb-3 pt-6 backdrop-blur md:static md:mx-0 md:block md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
        <h1 className="text-2xl font-bold">Explore</h1>

        <Link
          href="/explore/search"
          aria-label="Search"
          className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-lavender/50 text-muted transition-colors hover:border-violet md:hidden"
        >
          <Search className="h-4 w-4" />
        </Link>
      </div>

      {/* Grade quick-chips (Target Group facet) — the sidebar covers this on lg+ */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {GRADES.map((g) =>
          g.slug === "all" ? (
            <Chip key={g.slug} selected={!anyTarget} onClick={clearTarget} className="shrink-0">
              {g.label}
            </Chip>
          ) : (
            <Chip
              key={g.slug}
              selected={selected.has(`target:${g.slug}`)}
              onClick={() => toggle(`target:${g.slug}`)}
              className="shrink-0"
            >
              {g.label}
            </Chip>
          ),
        )}
      </div>

      <div
        className={cn(
          "mt-2 lg:mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-x-6 lg:gap-y-2",
          showRail && "xl:grid-cols-[280px_300px_minmax(0,1fr)]",
        )}
      >
        {/* Desktop: sticky TT-style filter sidebar */}
        <aside className="hidden lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:block lg:sticky lg:top-6">
          <FilterPanel
            resultCount={resultCount}
            selected={selected}
            onToggle={toggle}
            onClear={clear}
            searchable
          />
        </aside>

        {/* Subjects: contextual rail, shown once a subject filter is checked.
            Horizontal on mobile → sticky vertical column on xl. */}
        {showRail && (
          <SubjectRail
            selected={railSelected}
            onToggle={toggleRailSubject}
            className="mt-4 lg:col-start-2 lg:row-start-1 lg:mt-0"
          />
        )}

        {/* Results */}
        <div
          ref={resultsRef}
          className={cn(
            "mt-6 scroll-mt-24 lg:col-start-2 lg:mt-0 lg:scroll-mt-6",
            showRail
              ? "lg:row-start-2 lg:mt-2 xl:col-start-3 xl:row-start-1 xl:mt-0"
              : "lg:row-start-1",
          )}
        >
          {/* Tabs + toolbar */}
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b border-hairline">
            <div role="tablist" aria-label="Catalog content" className="flex gap-5">
              <TabButton
                label="Studybooks"
                count={booksF.length}
                active={tab === "books"}
                onClick={() => {
                  setTab("books");
                  setPage(1);
                }}
              />
              <TabButton
                label="Studybites"
                count={bitesF.length}
                active={tab === "bites"}
                onClick={() => {
                  setTab("bites");
                  setPage(1);
                }}
              />
            </div>

            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-9 items-center gap-2 rounded-full border border-hairline px-3 text-sm font-medium transition-colors hover:border-violet hover:bg-lavender active:scale-95 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                <span>Filters</span>
                {selected.size > 0 && (
                  <span
                    key={selected.size}
                    className="pill-in grid h-5 min-w-5 place-items-center rounded-full bg-violet px-1 text-xs font-semibold text-white"
                  >
                    {selected.size}
                  </span>
                )}
              </button>

              {tab === "books" && (
                <>
                  <SortMenu
                    sort={sort}
                    onChange={(s) => {
                      setSort(s);
                      setPage(1);
                    }}
                  />
                  <div className="flex overflow-hidden rounded-full border border-hairline">
                    <ViewButton
                      label="Grid view"
                      active={view === "grid"}
                      onClick={() => {
                        setView("grid");
                        setPage(1);
                      }}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                    </ViewButton>
                    <ViewButton
                      label="List view"
                      active={view === "list"}
                      onClick={() => {
                        setView("list");
                        setPage(1);
                      }}
                    >
                      <List className="h-4 w-4" aria-hidden />
                    </ViewButton>
                  </div>
                </>
              )}
            </div>
          </div>

          <ActiveFilters selected={selected} onToggle={toggle} onClear={clear} />

          {/* keyed so cards re-stagger when the tab, view or page changes */}
          <div key={`${tab}-${view}-${safePage}`} className="mt-4">
            {resultCount === 0 ? (
              <EmptyState />
            ) : tab === "bites" ? (
              <div className={cn("grid gap-3 sm:grid-cols-2", !showRail && "xl:grid-cols-3")}>
                {pageBites.map((bite, i) => (
                  <div key={bite.card.id} className="anim-item-in" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <StudybiteCard bite={bite} />
                  </div>
                ))}
              </div>
            ) : view === "grid" ? (
              <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3", !showRail && "xl:grid-cols-4")}>
                {pageBooks.map((book, i) => (
                  <div key={book.id} className="anim-item-in" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <CoverCard book={book} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pageBooks.map((book, i) => (
                  <div key={book.id} className="anim-item-in" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <BookRow book={book} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={goToPage} className="mt-8" />
        </div>
      </div>

      {/* Mobile / tablet filter drawer */}
      <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} resultCount={resultCount}>
        <FilterPanel
          resultCount={resultCount}
          selected={selected}
          onToggle={toggle}
          onClear={clear}
          searchable
        />
      </FilterDrawer>
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative pb-3 text-sm font-semibold transition-colors",
        active ? "text-ink" : "text-muted hover:text-ink",
      )}
    >
      {label}
      <span
        className={cn(
          "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums transition-colors",
          active ? "bg-violet text-white" : "bg-mist text-slate",
        )}
      >
        {count}
      </span>
      {active && <span className="pill-in absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
    </button>
  );
}

function ViewButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid h-9 w-9 place-items-center transition-colors",
        active ? "bg-violet text-white" : "text-slate hover:bg-lavender",
      )}
    >
      {children}
    </button>
  );
}

/** List-view row: cover thumb, title/author, synopsis snippet, price + subject pills. */
function BookRow({ book }: { book: Studybook }) {
  const subject = SUBJECTS.find((s) => s.slug === book.subjectSlug)?.name ?? book.subjectSlug;
  return (
    <Link
      href={`/studybook/${book.slug}`}
      className="hover-lift group flex gap-3 rounded-card border border-hairline bg-surface p-3"
    >
      <div className="bg-plum relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg">
        {book.cover && (
          <Image src={book.cover} alt={book.title} fill sizes="64px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-semibold leading-snug group-hover:text-violet">{book.title}</p>
        <p className="line-clamp-1 text-sm text-muted">{book.author}</p>
        <p className="mt-1 line-clamp-1 text-sm text-muted">{book.synopsis}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {book.priceEur != null ? (
            <Pill>€{book.priceEur.toFixed(2)}</Pill>
          ) : (
            <Pill className="bg-brand-green/10 text-brand-green">Free</Pill>
          )}
          <Pill className="bg-lavender">{subject}</Pill>
          <span className="text-xs text-muted">{book.cards.length} cards</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <p className="rounded-card border border-dashed border-hairline p-8 text-center text-sm text-muted">
      Nothing here for this filter yet. Try removing a filter or two.
    </p>
  );
}
