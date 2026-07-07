"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

// Layout effect on the client so the persisted value applies before first
// paint (no wrong-tab flash); plain effect during SSR to avoid React's
// useLayoutEffect-on-server warning.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A string-union choice persisted to `localStorage` under `key` — the
 * `usePersistedFlag` pattern for tabs/filters. Starts at `initial` on the
 * server / first render (so there's no hydration mismatch), then hydrates
 * from storage before the first client paint; stored values not in `allowed`
 * are ignored, so stale keys can never select a tab that no longer exists.
 */
export function usePersistedChoice<T extends string>(
  key: string,
  initial: T,
  allowed: readonly T[],
) {
  const [value, setValue] = useState<T>(initial);

  useIsomorphicLayoutEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null && (allowed as readonly string[]).includes(raw)) setValue(raw as T);
    } catch {
      /* storage unavailable (private mode / SSR) — keep in-memory value */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per key; `allowed` is a literal
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* ignore write failures */
      }
    },
    [key],
  );

  return [value, update] as const;
}
