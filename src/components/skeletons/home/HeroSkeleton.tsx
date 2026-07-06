import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholder for the landing Hero, mirroring its exact layout —
 * section padding, headline min-height, CTA sizes and phone mockup frame —
 * so the real Hero mounts with zero layout shift and its entrance
 * animations (framer-motion staggers + GSAP scroll parallax) play untouched.
 */
export function HeroSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading"
      className="relative mx-auto max-w-7xl overflow-hidden px-5 pt-36 pb-20 sm:px-8 sm:pt-44"
    >
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Left column */}
        <div>
          {/* "Bite-sized learning" badge */}
          <Skeleton className="mb-5 h-6 w-40 rounded-full" />

          {/* AnimatedHeadline — same reserved height as the real headline */}
          <div className="min-h-[7.5rem] max-w-xl space-y-3 sm:min-h-[8.5rem]">
            <Skeleton className="h-10 w-full sm:h-12" />
            <Skeleton className="h-10 w-4/5 sm:h-12" />
          </div>

          {/* paragraph */}
          <div className="mt-6 max-w-md space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* CTA buttons (Button size="lg" → h-13 rounded-xl) */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Skeleton className="h-13 w-36 rounded-xl" />
            <Skeleton className="h-13 w-40 rounded-xl" />
          </div>

          {/* "How it works" link */}
          <Skeleton className="mt-8 h-5 w-36 rounded-full" />

          {/* social proof line */}
          <Skeleton className="mt-10 h-4 w-52 rounded-full" />
        </div>

        {/* Right column — phone mockup frame at its resting -4° tilt */}
        <div className="relative flex justify-center">
          <div className="relative h-[540px] w-[260px] -rotate-[4deg] overflow-hidden rounded-[2.75rem] bg-mist p-3 sm:h-[620px] sm:w-[300px]">
            {/* screen */}
            <Skeleton className="h-full w-full rounded-[2.1rem] bg-ink/10" />
            <div className="motion-safe:animate-shimmer absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
