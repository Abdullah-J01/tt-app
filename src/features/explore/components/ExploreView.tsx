"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { GRADES } from "@/config/subjects";
import { cn } from "@/lib/utils";
import { CoverCard } from "./CoverCard";
import { StudybiteCard } from "./StudybiteCard";
import type { Studybite } from "../data";
import type { Studybook } from "@/types";

interface ExploreViewProps {
  /** Subject grid, rendered on the server (its icons aren't serializable). */
  subjectGrid: ReactNode;
  freshly: Studybook[];
  popular: Studybook[];
  studybites: Studybite[];
}

/**
 * Explore landing (UI brief §6.4). Search → subjects → freshly added → popular
 * → studybites. The grade chips filter the studybook rows client-side.
 */
export function ExploreView({ subjectGrid, freshly, popular, studybites }: ExploreViewProps) {
  const [grade, setGrade] = useState("all");

  const byGrade = (books: Studybook[]) =>
    grade === "all" ? books : books.filter((b) => b.grade === grade);

  const studybitesF =
    grade === "all" ? studybites : studybites.filter((s) => s.book.grade === grade);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 md:py-10 md:pb-12">
      {/* Sticky header on mobile (title + search) */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-hairline bg-surface/95 px-4 pb-3 pt-6 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
        <h1 className="text-2xl font-bold">Explore</h1>

        {/* Search — tapping opens the full-screen search screen */}
        <Link
          href="/explore/search"
          className="relative mt-3 flex h-11 items-center rounded-full border border-hairline bg-lavender/50 pl-9 pr-4 text-sm text-muted transition-colors hover:border-violet md:mt-4"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          Search studybooks, subjects…
        </Link>
      </div>

      {/* Grade filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GRADES.map((g) => (
          <Chip key={g.slug} selected={grade === g.slug} onClick={() => setGrade(g.slug)}>
            {g.label}
          </Chip>
        ))}
      </div>

      <SectionHeader title="Browse by subject" />
      <div className="mt-4">{subjectGrid}</div>

      <SectionHeader title="Freshly added" />
      <CoverRow books={byGrade(freshly)} />

      <SectionHeader title="Popular studybooks" />
      <CoverRow books={byGrade(popular)} />

      <SectionHeader title="Studybites for you" />
      {studybitesF.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studybitesF.map((bite) => (
            <StudybiteCard key={bite.card.id} bite={bite} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-sm font-semibold text-violet hover:underline"
        >
          {cta ?? "See all"}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/** Horizontal scroll on mobile, 6-up grid on desktop. */
function CoverRow({ books }: { books: Studybook[] }) {
  if (books.length === 0) return <EmptyRow />;
  return (
    <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
      {books.map((book) => (
        <div key={book.id} className={cn("w-48 shrink-0 sm:w-52")}>
          <CoverCard book={book} />
        </div>
      ))}
    </div>
  );
}

function EmptyRow() {
  return (
    <p className="mt-4 rounded-card border border-dashed border-hairline p-6 text-center text-sm text-muted">
      Nothing here for this grade yet.
    </p>
  );
}
