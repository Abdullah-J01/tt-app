import { Skeleton } from "@/components/ui/Skeleton";
import { CoverCardSkeleton, StudybiteCardSkeleton } from "./CardSkeletons";

/**
 * Full-page placeholder for /explore/search while searchCatalog() streams:
 * the search bar footprint (same 68px the page reserves for its Suspense
 * fallback), then the grouped results — subject chips, a studybook cover
 * row, and a studybite row.
 */
export function SearchSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading search"
      className="mx-auto max-w-6xl px-4 pb-24 md:pb-12"
    >
      {/* search bar footprint */}
      <div className="flex h-[68px] items-center">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>

      <div className="space-y-8 py-2">
        {/* subjects group */}
        <section>
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <div className="mt-3 flex flex-wrap gap-2">
            {["w-28", "w-24", "w-32", "w-24"].map((width, i) => (
              <Skeleton key={i} className={`h-9 rounded-full ${width}`} />
            ))}
          </div>
        </section>

        {/* studybooks group */}
        <section>
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CoverCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* studybites group */}
        <section>
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StudybiteCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
