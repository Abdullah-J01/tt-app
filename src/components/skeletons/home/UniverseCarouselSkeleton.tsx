import { Skeleton } from "@/components/ui/Skeleton";
import { trackHeight, trackMargin } from "@/components/home/universeTrack";

/**
 * Loading placeholder for the "Freshly digitized" scroll-spun spiral.
 * Reserves the carousel's scroll track — the exact height, off the shared
 * `universeTrack` geometry, so nothing shifts when the deck hydrates — with a
 * sticky stage, and sketches the focused cover flanked by two receding
 * neighbours. Reduced-motion mirrors the flat card rail fallback instead.
 */
export function UniverseCarouselSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      {/* pinned spiral variant */}
      {/* `--stage` mirrors the deck's measured stage height per breakpoint so the
          placeholder pulls in by the same amount the real track will. Set via class,
          not inline style, so the `sm:` override can win. */}
      <div
        className="hidden [--stage:474px] motion-safe:block sm:[--stage:721px]"
        style={{ height: trackHeight(), marginBlock: trackMargin() }}
      >
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          <div className="relative flex items-center justify-center">
            {/* receding neighbours */}
            <Skeleton className="rounded-card absolute right-[55%] hidden aspect-[1/1.36] w-[220px] -rotate-6 opacity-50 sm:block" />
            <Skeleton className="rounded-card absolute left-[55%] hidden aspect-[1/1.36] w-[220px] rotate-6 opacity-50 sm:block" />
            {/* focused cover */}
            <div className="rounded-card relative aspect-[1/1.36] w-[66vw] max-w-[260px] overflow-hidden sm:w-[340px] sm:max-w-none">
              <Skeleton className="h-full w-full rounded-none" />
              <div className="motion-safe:animate-shimmer absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] bg-[length:200%_100%]" />
              {/* title + meta footprint */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <Skeleton className="h-5 w-3/4 bg-white/25" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-white/25" />
                  <Skeleton className="h-3 w-16 rounded-full bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* reduced-motion: flat rail of vertical cards (mirrors the Rail fallback) */}
      <div className="hidden gap-4 overflow-hidden motion-reduce:flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-40 shrink-0 sm:w-48">
            <Skeleton className="rounded-card aspect-[3/4] w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1.5 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
