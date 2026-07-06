import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Card-shaped placeholders for the Explore catalog, mirroring CoverCard,
 * StudybiteCard and the list-view BookRow so result grids land without
 * layout shift. Decorative — the page-level skeleton owns the status role.
 */

/** CoverCard's front face: plum cover, subject badge, title/author, meta row. */
export function CoverCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-plum shadow-soft relative flex aspect-[7/10] flex-col justify-between overflow-hidden rounded-2xl p-3.5 sm:p-5"
    >
      <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
      <div>
        <Skeleton className="h-5 w-full bg-white/25" />
        <Skeleton className="mt-1.5 h-5 w-3/4 bg-white/25" />
        <Skeleton className="mt-2 h-3.5 w-1/2 rounded-full bg-white/15" />
        <div className="mt-3 flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-16 rounded-full bg-white/15" />
          <Skeleton className="h-3.5 w-10 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}

/** StudybiteCard: cover thumb, two-line heading, two-line snippet, pills. */
export function StudybiteCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border-hairline bg-surface flex gap-3 border p-3"
    >
      <Skeleton className="aspect-[3/4] w-14 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-1.5 h-4 w-3/5" />
        <Skeleton className="mt-2.5 h-3.5 w-full" />
        <Skeleton className="mt-1.5 h-3.5 w-2/3" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** List-view BookRow: w-16 cover thumb, title/author/synopsis, pill row. */
export function BookRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border-hairline bg-surface flex gap-3 border p-3"
    >
      <Skeleton className="aspect-[3/4] w-16 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-1.5 h-3.5 w-1/3" />
        <Skeleton className="mt-2 h-3.5 w-4/5" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
