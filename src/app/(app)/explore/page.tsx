import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { SUBJECTS, GRADES } from "@/config/subjects";

export const metadata: Metadata = { title: "Explore" };

/**
 * Catalog / browse (UI brief §6.4). TT-style: search, grade filter, subject grid.
 * TODO(team): wire grade chips + search to real filtering (client component).
 */
export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:py-10 md:pb-12">
      <h1 className="text-2xl font-bold">Explore</h1>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search studybooks, subjects…"
          className="h-11 w-full rounded-full border border-hairline bg-lavender/50 pl-9 pr-4 text-sm outline-none focus:border-violet"
        />
      </div>

      {/* Grade filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GRADES.map((g, i) => (
          <Chip key={g.slug} selected={i === 0}>
            {g.label}
          </Chip>
        ))}
      </div>

      {/* Subject grid */}
      <h2 className="mt-8 text-lg font-bold">Subjects</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUBJECTS.map((s) => (
          <SubjectCard key={s.slug} subject={s} />
        ))}
      </div>
    </div>
  );
}
