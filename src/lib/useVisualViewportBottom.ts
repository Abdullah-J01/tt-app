"use client";

import { useEffect, useState } from "react";

/**
 * Pixels a `position: fixed; bottom: 0` element must be lifted by to sit on the
 * bottom edge of what the user can actually *see*.
 *
 * `position: fixed` resolves against the **layout** viewport. iOS Safari sizes
 * that to the tall, toolbar-collapsed viewport and then animates its toolbars
 * over the top of it, so a `bottom: 0` bar is parked underneath the toolbar and
 * appears to slide up and down as the toolbar collapses and expands mid-scroll.
 * `100dvh`/`svh` units don't help — they describe the layout viewport too.
 *
 * `visualViewport` is the only API that reports the visible rect, so measure the
 * gap between the two and close it:
 *
 *   gap = layoutHeight − (visualViewport.height + visualViewport.offsetTop)
 *
 * Returns 0 everywhere the two viewports agree (desktop, Android, iOS with the
 * toolbar already collapsed), so the value is a no-op except when it's needed.
 */
export function useVisualViewportBottom(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      // Pinch-zoom also shrinks the visual viewport. Gluing the bar to it there
      // makes it swim around under the user's fingers, so stand down instead.
      const gap =
        vv.scale > 1 ? 0 : document.documentElement.clientHeight - (vv.height + vv.offsetTop);
      // Sub-pixel churn from the toolbar animation would re-render every frame.
      setOffset(Math.max(0, Math.round(gap)));
    };

    // vv fires `resize`/`scroll` on every step of the toolbar animation; coalesce
    // to one measurement per frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  return offset;
}
