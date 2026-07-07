"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Incrementally reveal a client-side list: render the first `pageSize` items,
 * then grow the window whenever the returned `sentinelRef` element scrolls
 * near the viewport. Attach `sentinelRef` to a placeholder after the visible
 * items and unmount it (via `hasMore`) once everything is shown. Pass a
 * `resetKey` (active tab/filter) to collapse back to the first page when the
 * underlying collection changes.
 */
export function useLazyList<T>(items: T[], pageSize = 12, resetKey?: unknown) {
  const [count, setCount] = useState(pageSize);

  useEffect(() => {
    setCount(pageSize);
  }, [pageSize, resetKey]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref keyed on `count`: each reveal re-attaches a fresh observer,
  // whose initial check fires again if the sentinel is still in view — so
  // short lists keep revealing until the sentinel leaves the viewport.
  const sentinelRef = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            setCount((prev) => prev + pageSize);
          }
        },
        // Start revealing shortly before the sentinel enters the viewport.
        { rootMargin: "300px 0px" },
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `count` intentionally re-creates the ref per batch
    [pageSize, count],
  );

  return {
    items: count < items.length ? items.slice(0, count) : items,
    hasMore: count < items.length,
    sentinelRef,
  };
}
