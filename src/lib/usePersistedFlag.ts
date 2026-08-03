"use client";

import { useCallback, useEffect, useState } from "react";

export function usePersistedFlag(key: string, initial = false) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(raw === "1");
    } catch {
      /* storage unavailable (private mode / SSR) — keep in-memory value */
    }
  }, [key]);

  const update = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, resolved ? "1" : "0");
        } catch {
          /* ignore write failures */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
