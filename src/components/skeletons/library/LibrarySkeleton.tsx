import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Grid placeholder for the Library while the stash hydrates (localStorage
 * today, TT API later). We can't know how many tiles will land, so it shows
 * a single row of neutral grey tiles per breakpoint instead of guessing a
 * count. Grid classes mirror LibraryPage's two grids so content lands
 * without layout shift.
 */
export function LibraryGridSkeleton({ tab = "cards" }: { tab?: "cards" | "studybooks" }) {
  const books = tab === "studybooks";
  return (
    <div role="status" aria-label="Loading library">
      {/* saved/liked filter chips */}
      {!books && (
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      )}
      <div
        className={cn(
          "mt-6 grid grid-cols-2",
          books
            ? "gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
            : "gap-4 sm:grid-cols-3 sm:gap-5",
        )}
      >
        {/* extra tiles reveal with their grid columns, keeping the row full at every width */}
        {books ? (
          <>
            <BookTileSkeleton />
            <BookTileSkeleton />
            <BookTileSkeleton className="hidden sm:block" />
            <BookTileSkeleton className="hidden lg:block" />
          </>
        ) : (
          <>
            <CardTileSkeleton />
            <CardTileSkeleton />
            <CardTileSkeleton className="hidden sm:block" />
          </>
        )}
      </div>
    </div>
  );
}

/** Grey stand-in for a saved/liked FeedCardTile. */
export function CardTileSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("aspect-[3/4] rounded-2xl", className)} />;
}

/** Grey stand-in for a BookTile cover. */
export function BookTileSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("aspect-[2/3] rounded-l-[3px] rounded-r-lg", className)} />;
}
