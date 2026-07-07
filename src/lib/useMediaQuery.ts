"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reactively track a CSS media query (resize/rotation aware). SSR-safe: the
 * server snapshot reports `false`, and the real match takes over on hydration —
 * so gate mobile-only *reductions* behind it, not content the server must render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
