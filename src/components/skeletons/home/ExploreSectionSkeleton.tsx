import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholder for the "Explore by subject" scroll reveal. Reserves the
 * same scroll track + sticky viewport panel as SubjectReveal (or its flat
 * reduced-motion layout) so the swap never moves the page, and sketches the
 * initial centre state: glow circle + two-line heading + kicker.
 */
export function ExploreSectionSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading"
      className="relative h-[160vh] motion-reduce:h-auto sm:h-[220vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-white motion-reduce:relative motion-reduce:min-h-screen motion-reduce:py-16">
        {/* centre glow circle (mirrors the plum ripple footprint) */}
        <Skeleton className="absolute m-auto h-64 w-64 rounded-full md:h-72 md:w-72" />

        {/* heading + kicker */}
        <div className="relative flex flex-col items-center px-6">
          <Skeleton className="h-9 w-44 sm:h-14 sm:w-72 md:h-20 md:w-96" />
          <Skeleton className="mt-2 h-9 w-64 sm:mt-3 sm:h-14 sm:w-96 md:h-20 md:w-[34rem]" />
          <Skeleton className="mt-6 h-4 w-56 rounded-full sm:w-72" />
        </div>
      </div>
    </section>
  );
}
