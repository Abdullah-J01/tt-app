"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { GRADES, SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";
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
import { Pagination } from "@/components/ui/Pagination";
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
  const t = useTranslations("features_explore_components_ExploreView");
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
  // Below sm everything is 1–2 columns, so cap pages at 8 cards — the pager
  // should arrive after a short scroll, not a long one.
  const isMobile = useMediaQuery("(max-width: 639px)");
  const pageSize = isMobile ? 8 : tab === "bites" ? 12 : view === "list" ? 8 : showRail ? 12 : 16;
  const totalPages = Math.max(1, Math.ceil(resultCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageBooks = booksF.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageBites = bitesF.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goToPage = (p: number) => {
    setPage(p);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl overflow-x-clip px-4 pb-24 sm:px-6 md:py-10 md:pb-12 lg:px-8">
      {/* Static header — the fixed navbar pill floats above the page, so a
          sticky bar here would slide under it and look cropped. Search lives in
          the navbar on md+; mobile gets a shortcut to the full-screen search */}
      <div className="flex items-center justify-between pt-6 md:block md:pt-0">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <Link
          href="/explore/search"
          aria-label={t("search")}
          className="border-hairline bg-lavender/50 text-muted hover:border-violet grid h-10 w-10 place-items-center rounded-full border transition-colors md:hidden"
        >
          <Search className="h-4 w-4" />
        </Link>
      </div>

      {/* Grade quick-chips (Target Group facet) — the sidebar covers this on lg+.
          The row stays horizontally scrollable; the outer clip + pb/-mb pushes the
          scrollbar below the visible area so it's hidden even in webviews that
          ignore `::-webkit-scrollbar` styling. */}
      <div className="-mx-4 mt-6 overflow-hidden sm:-mx-6 lg:hidden">
        <div className="no-scrollbar -mb-4 flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
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
      </div>

      <div
        className={cn(
          "mt-2 lg:mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-x-6 lg:gap-y-2",
          showRail && "xl:grid-cols-[280px_300px_minmax(0,1fr)]",
        )}
      >
        {/* Desktop: sticky TT-style filter sidebar */}
        <aside className="hidden lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block">
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
          <div className="border-hairline flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b">
            <div role="tablist" aria-label={t("catalogContent")} className="flex gap-5">
              <TabButton
                label={t("studybooks")}
                count={booksF.length}
                active={tab === "books"}
                onClick={() => {
                  setTab("books");
                  setPage(1);
                }}
              />
              <TabButton
                label={t("studybites")}
                count={bitesF.length}
                active={tab === "bites"}
                onClick={() => {
                  setTab("bites");
                  setPage(1);
                }}
              />
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Button
                unstyled
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="border-hairline hover:border-violet hover:bg-lavender flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors active:scale-95 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                <span>{t("filters")}</span>
                {selected.size > 0 && (
                  <span
                    key={selected.size}
                    className="pill-in bg-violet grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-semibold text-white"
                  >
                    {selected.size}
                  </span>
                )}
              </Button>

              {/* Sort + view controls only apply to Studybooks. From md they stay
                  mounted and fade out toward the right on Studybites so the
                  toolbar keeps its width/height (no layout shift on tab switch);
                  below md they simply hide. `visibility` rides the transition so
                  the controls drop out of the tab/a11y order once faded. */}
              <div
                className={cn(
                  "flex items-center gap-2 motion-safe:transition-[opacity,transform,visibility] motion-safe:duration-300 motion-safe:ease-out",
                  tab === "books"
                    ? "visible translate-x-0 opacity-100"
                    : "invisible hidden translate-x-4 opacity-0 md:flex",
                )}
              >
                <SortMenu
                  sort={sort}
                  onChange={(s) => {
                    setSort(s);
                    setPage(1);
                  }}
                />
                <div className="border-hairline flex overflow-hidden rounded-full border">
                  <ViewButton
                    label={t("gridView")}
                    active={view === "grid"}
                    onClick={() => {
                      setView("grid");
                      setPage(1);
                    }}
                  >
                    <LayoutGrid className="h-4 w-4" aria-hidden />
                  </ViewButton>
                  <ViewButton
                    label={t("listView")}
                    active={view === "list"}
                    onClick={() => {
                      setView("list");
                      setPage(1);
                    }}
                  >
                    <List className="h-4 w-4" aria-hidden />
                  </ViewButton>
                </div>
              </div>
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
                  <div
                    key={bite.card.id}
                    className="anim-item-in"
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  >
                    <StudybiteCard bite={bite} />
                  </div>
                ))}
              </div>
            ) : view === "grid" ? (
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 sm:grid-cols-3",
                  !showRail && "xl:grid-cols-4",
                )}
              >
                {pageBooks.map((book, i) => (
                  <div
                    key={book.id}
                    className="anim-item-in"
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  >
                    <CoverCard book={book} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pageBooks.map((book, i) => (
                  <div
                    key={book.id}
                    className="anim-item-in"
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  >
                    <BookRow book={book} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={goToPage}
            className="mt-8"
          />
        </div>
      </div>

      {/* Mobile / tablet filter drawer */}
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={resultCount}
      >
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
    <Button
      unstyled
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
      {active && (
        <span className="pill-in bg-violet absolute inset-x-0 -bottom-px h-0.5 rounded-full" />
      )}
    </Button>
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
    <Button
      unstyled
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
    </Button>
  );
}

/** List-view row: cover thumb, title/author, synopsis snippet, price + subject pills. */
function BookRow({ book }: { book: Studybook }) {
  const t = useTranslations("features_explore_components_ExploreView");
  const subject = SUBJECTS.find((s) => s.slug === book.subjectSlug)?.name ?? book.subjectSlug;
  return (
    <Link
      href={`/studybook/${book.slug}`}
      className="hover-lift group rounded-card border-hairline bg-surface flex gap-3 border p-3"
    >
      <div className="bg-plum relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg">
        {book.cover && (
          <Image src={book.cover} alt={book.title} fill sizes="64px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="group-hover:text-violet line-clamp-1 leading-snug font-semibold">
          {book.title}
        </p>
        <p className="text-muted line-clamp-1 text-sm">{book.author}</p>
        <p className="text-muted mt-1 line-clamp-1 text-sm">{book.synopsis}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {book.priceEur != null ? (
            <Pill>€{book.priceEur.toFixed(2)}</Pill>
          ) : (
            <Pill className="bg-brand-green/10 text-brand-green">{t("free")}</Pill>
          )}
          <Pill className="bg-lavender">{subject}</Pill>
          <span className="text-muted text-xs">{t("cards", { count: book.cards.length })}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  const t = useTranslations("features_explore_components_ExploreView");
  return (
    <p className="rounded-card border-hairline text-muted border border-dashed p-8 text-center text-sm">
      {t("emptyState")}
    </p>
  );
}
