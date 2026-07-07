import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholders for the feed screen, mirroring FeedCard / SideActions /
 * NavControls positioning so the real content lands without layout shift.
 * Purely decorative — FeedScreen announces the loading state via its live region.
 */

/** Card-shaped skeleton matching FeedCard's layout on the plum gradient. */
export function FeedCardSkeleton() {
  return (
    <div aria-hidden="true" className="bg-plum-gradient relative h-full w-full overflow-hidden">
      {/* progress segments (hidden for now — mirrors the strip commented out in FeedCard) */}
      {/* <div className="absolute inset-x-4 top-4 flex gap-1 sm:inset-x-6 sm:top-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-1 flex-1 rounded-full bg-white/20" />
        ))}
      </div> */}

      {/* top badges: streak · For You · filter */}
      <div className="absolute inset-x-4 top-8 flex items-center justify-between sm:inset-x-6 sm:top-9">
        <Skeleton className="h-7 w-14 rounded-full bg-white/15" />
        <Skeleton className="h-7 w-16 rounded-full bg-white/15" />
        <Skeleton className="h-7 w-9 rounded-full bg-white/15" />
      </div>

      {/* subject · grade pill */}
      <div className="absolute inset-x-4 top-19 sm:inset-x-6 sm:top-20">
        <Skeleton className="h-7 w-36 rounded-full bg-white/15" />
      </div>

      {/* main content: kicker, title, description */}
      <div className="absolute inset-x-4 top-[38%] -translate-y-1/2 sm:inset-x-6 sm:top-[40%]">
        <Skeleton className="mb-4 h-3 w-24 rounded-full bg-white/25" />
        <Skeleton className="mb-2.5 h-7 w-4/5 bg-white/25 sm:h-8" />
        <Skeleton className="mb-5 h-7 w-3/5 bg-white/25 sm:h-8" />
        <div className="max-w-md space-y-2.5">
          <Skeleton className="h-4 w-full bg-white/15" />
          <Skeleton className="h-4 w-11/12 bg-white/15" />
          <Skeleton className="h-4 w-2/3 bg-white/15" />
        </div>
      </div>

      {/* book author row */}
      <div className="absolute inset-x-4 bottom-6 flex items-center gap-3 sm:inset-x-6 sm:bottom-8">
        <Skeleton className="h-14 w-11 shrink-0 rounded-lg bg-white/15" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 bg-white/25" />
          <Skeleton className="h-3 w-28 bg-white/15" />
        </div>
      </div>
    </div>
  );
}

/** Like / Share / Save placeholders in SideActions' responsive positions. */
export function SideActionsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-2 bottom-17 z-20 flex flex-col items-center gap-4 sm:right-6 sm:bottom-28 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-full lg:ml-5 lg:-translate-y-1/2"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <Skeleton className="lg:bg-mist h-11 w-11 rounded-full bg-white/25 sm:h-12 sm:w-12" />
          <Skeleton className="lg:bg-mist h-2.5 w-8 rounded-full bg-white/25" />
        </div>
      ))}
    </div>
  );
}

/** Prev/next placeholders where NavControls sits (desktop only). */
export function NavControlsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-1/2 left-6 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex xl:left-10"
    >
      <Skeleton className="h-11 w-11 rounded-full" />
      <Skeleton className="h-11 w-11 rounded-full" />
    </div>
  );
}
