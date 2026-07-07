import Link from "next/link";
import { Apple, Play } from "lucide-react";
import { ParallaxBlobs } from "./ParallaxBlobs";

/**
 * Site footer — the "turn wasted minutes into things you'll actually keep"
 * download-the-app banner: a dark rounded card with drifting/fading background
 * blobs (animate-blob, disabled under prefers-reduced-motion).
 *
 * Rendered on every page so the same footer design appears everywhere.
 */
export function Footer() {
  return (
    <footer className="px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-8">
      <div className="bg-plum-gradient shadow-lift relative mx-auto max-w-7xl overflow-hidden rounded-3xl text-white">
        {/* Accent bar */}
        <div className="bg-lilac h-1 w-full" />

        {/* Moving / fading background blobs (GSAP drift + mouse parallax) */}
        <ParallaxBlobs>
          <span className="bg-violet/45 absolute top-6 -left-20 h-64 w-64 rounded-full blur-3xl" />
          <span className="bg-violet/35 absolute -right-10 bottom-0 h-72 w-72 rounded-full blur-3xl" />
          <span className="bg-brand-green/25 absolute top-1/2 left-1/3 h-56 w-56 rounded-full blur-3xl" />
        </ParallaxBlobs>

        <div className="relative z-10 px-6 py-12 sm:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Headline */}
            <h2 className="font-display text-4xl leading-[1.05] font-bold text-white sm:text-5xl">
              Turn{" "}
              <span className="relative whitespace-nowrap">
                <span className="text-white/90">wasted</span>
                <span
                  aria-hidden
                  className="bg-violet absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full"
                />
              </span>{" "}
              minutes
              <br />
              into things
              <br />
              you&apos;ll <span className="text-lilac">actually keep</span>
            </h2>

            {/* CTA */}
            <div className="lg:justify-self-end">
              <p className="max-w-sm text-white/70">
                Join over <strong className="font-bold text-white">10M+ people</strong> who swapped
                the feed for bite-sized studybooks. Free to start.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="#"
                  className="btn-shine bg-violet-muted relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-5 py-3 transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:w-72"
                >
                  <Apple className="h-7 w-7 shrink-0" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                      Download on the
                    </span>
                    <span className="block text-lg font-bold">App Store</span>
                  </span>
                </a>

                <a
                  href="#"
                  className="btn-shine bg-plum-panel hover:bg-plum-panel-hover relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 px-5 py-3 transition-colors sm:w-72"
                >
                  <Play className="h-6 w-6 shrink-0 fill-current" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                      Get it on
                    </span>
                    <span className="block text-lg font-bold">Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/50">
            <span>
              <strong className="font-bold text-white">3 min</strong> a day
            </span>
            <span className="text-white/25">·</span>
            <span>
              <strong className="font-bold text-white">18k+</strong> studybooks
            </span>
            <span className="text-white/25">·</span>
            <span>
              <strong className="font-bold text-white">4.9★</strong> App Store
            </span>
          </div>

          {/* Bottom links */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/60">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
