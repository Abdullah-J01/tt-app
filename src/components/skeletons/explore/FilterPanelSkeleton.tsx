import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Placeholder for the "Filter materials" sidebar: header + results pill,
 * filter search box, then the facet accordion — the first two sections open
 * (as FilterPanel defaults to) with checkbox option rows, the remaining five
 * collapsed rows with their icon circle and chevron footprints.
 */

function OptionRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-3 py-2 pr-4 pl-4">
      <Skeleton className="h-5 w-5 rounded-md" />
      <Skeleton className={`h-4 rounded-full ${width}`} />
      <Skeleton className="ml-auto h-3 w-8 rounded-full" />
    </div>
  );
}

function SectionHeaderSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <Skeleton className={`h-4 rounded-full ${width}`} />
      <Skeleton className="ml-auto h-4 w-4 rounded-md" />
    </div>
  );
}

export function FilterPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card border-hairline bg-surface overflow-hidden border ${className ?? ""}`}
    >
      {/* "Filter materials" + results pill */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* filter search box */}
      <div className="mx-4 mt-3">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>

      <div className="mt-3">
        {/* two open sections with option rows (FilterPanel opens target + subject) */}
        {[0, 1].map((section) => (
          <div key={section} className="border-hairline border-t">
            <SectionHeaderSkeleton width={section === 0 ? "w-28" : "w-20"} />
            <div className="pb-2">
              <OptionRowSkeleton width="w-36" />
              <OptionRowSkeleton width="w-24" />
              <OptionRowSkeleton width="w-28" />
              <OptionRowSkeleton width="w-20" />
              <OptionRowSkeleton width="w-32" />
            </div>
          </div>
        ))}

        {/* remaining collapsed sections */}
        {["w-24", "w-16", "w-24", "w-20", "w-28"].map((width, i) => (
          <div key={i} className="border-hairline border-t">
            <SectionHeaderSkeleton width={width} />
          </div>
        ))}
      </div>
    </div>
  );
}
