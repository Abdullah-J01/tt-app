import { Skeleton } from "@/components/ui/Skeleton";
import { ContinueHeroSkeleton } from "./ContinueHero";
import { RailSkeleton } from "./RailStates";

/** Badge + title + description, matching SectionHeader's box exactly. */
function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-5 w-32 rounded-full sm:h-6 sm:w-40" />
        <Skeleton className="mt-1.5 h-3 w-44 rounded-full sm:h-3.5 sm:w-56" />
      </div>
    </div>
  );
}

/**
 * Placeholder for Home's rows, rendered until every source of personal data has
 * answered.
 *
 * Deliberately anonymous — no titles, no icons, no counts. Which rows exist and
 * in what order is a function of data we do not have yet: with nothing in
 * progress there is no Continue row at all and Your Library leads the page.
 * A skeleton that wore the real headings would have to *rename* them mid-load
 * ("Continue" → "Your Library") and shuffle the rows under them, which is the
 * exact flicker this replaces. Shapes are safe to promise; labels are not.
 *
 * The hero block is still worth reserving: most returning users have a book
 * open, so holding its height is right more often than not, and getting it
 * wrong costs one settle at reveal rather than a visible re-label.
 */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-10 sm:gap-12" role="status" aria-label="Loading">
      <section>
        <SectionHeaderSkeleton />
        <div className="mt-4">
          <ContinueHeroSkeleton />
        </div>
      </section>

      {[0, 1].map((i) => (
        <section key={i}>
          <SectionHeaderSkeleton />
          <RailSkeleton />
        </section>
      ))}
    </div>
  );
}
