import { Skeleton } from "@/components/ui/Skeleton";
import { BITE_COUNT } from "@/config/studyBites";

/**
 * Loading placeholder for the "New study bites" stacked deck. One horizontal
 * ContentCard-shaped block per bite with the deck's exact card gaps and tail
 * scrub room, so the container height (and everything below it) doesn't move
 * when the real scroll-stacked deck mounts. `count` must match the number of
 * books the page hands the deck, or that guarantee breaks.
 */
export function StackingStudyBitesSkeleton({ count = BITE_COUNT }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto max-w-2xl pb-[8vh] motion-reduce:pb-0 sm:pb-[18vh]"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={i < count - 1 ? "mb-[6vh] motion-reduce:mb-5 sm:mb-[14vh]" : undefined}
        >
          {/* ContentCard layout="horizontal" footprint */}
          <div className="rounded-card border-hairline bg-surface shadow-soft grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border p-3 sm:gap-x-4 sm:p-4">
            <Skeleton className="row-span-2 h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="col-start-2 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="ml-auto h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
