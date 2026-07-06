import { Skeleton } from "@/components/ui/Skeleton";
import { CoverCardSkeleton } from "./CardSkeletons";
import { FilterPanelSkeleton } from "./FilterPanelSkeleton";

/**
 * Full-page placeholder for the Explore landing while getCatalog() streams:
 * mirrors ExploreView's default state (Studybooks tab, grid view, no subject
 * rail) — mobile header + grade chips, the lg sidebar filter panel, tab bar
 * with count pills, toolbar, and the cover grid. The static "Explore" title
 * renders for real; interactive controls and data-driven counts are bars.
 */
export function ExploreSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading catalog"
      className="mx-auto max-w-7xl overflow-x-clip px-4 pb-24 md:py-10 md:pb-12"
    >
      {/* header — sticky on mobile, plain on md+ */}
      <div className="border-hairline bg-surface/95 sticky top-0 z-30 -mx-4 flex items-center justify-between border-b px-4 pt-6 pb-3 backdrop-blur md:static md:mx-0 md:block md:border-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:backdrop-blur-none">
        <h1 className="text-2xl font-bold">Explore</h1>
        <Skeleton className="h-10 w-10 rounded-full md:hidden" />
      </div>

      {/* grade quick-chips (mobile/tablet only) */}
      <div className="-mx-4 mt-6 overflow-hidden lg:hidden">
        <div className="flex gap-2 px-4">
          {["w-12", "w-24", "w-20", "w-20", "w-20", "w-24"].map((width, i) => (
            <Skeleton key={i} className={`h-9 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
      </div>

      <div className="mt-2 lg:mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-x-6">
        {/* desktop filter sidebar */}
        <aside className="hidden lg:block">
          <FilterPanelSkeleton />
        </aside>

        {/* results */}
        <div className="mt-6 lg:mt-0">
          {/* tabs + toolbar */}
          <div className="border-hairline flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b">
            <div className="flex gap-5 pb-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-full lg:hidden" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-[4.5rem] rounded-full" />
            </div>
          </div>

          {/* cover grid (default: books tab, grid view) */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CoverCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
