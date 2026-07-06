import { Skeleton } from "@/components/ui/Skeleton";
import { CoverCardSkeleton } from "./CardSkeletons";

/**
 * Full-page placeholder for /explore/[subject] while listStudybooks(subject)
 * streams: back button + title header, the count/filters/sort toolbar, and
 * SubjectBooks' cover grid.
 */
export function SubjectBooksSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading subject"
      className="mx-auto max-w-6xl px-4 py-6 pb-24 md:py-10 md:pb-12"
    >
      {/* back + subject title */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="mt-6">
        {/* toolbar: count · filters · sort */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>

        {/* cover grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CoverCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
