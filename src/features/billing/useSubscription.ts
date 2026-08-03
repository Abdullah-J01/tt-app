"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubStatus } from "./core";

/**
 * Fetches the signed-in user's subscription from GET /api/stripe/status.
 * Starts in a "loading" state; resolves to "signed_out" / "none" / an active
 * subscription. Falls back to "none" on network error so the UI still renders
 * the upsell rather than spinning forever.
 *
 * Also refetches when the tab is returned to (covers the Stripe Checkout
 * redirect back to the app, including bfcache restores where React never
 * remounts) so "current plan" reflects a purchase made in another tab/step
 * without requiring a hard reload.
 */
export function useSubscription(): SubStatus & { refetch: () => void } {
  const [state, setState] = useState<SubStatus>({ status: "loading" });
  const cancelledRef = useRef(false);

  const fetchStatus = useCallback(() => {
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((data: SubStatus) => {
        if (!cancelledRef.current) setState(data);
      })
      .catch(() => {
        if (!cancelledRef.current) setState({ status: "none" });
      });
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    fetchStatus();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchStatus]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") fetchStatus();
    }
    window.addEventListener("focus", fetchStatus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", fetchStatus);
    return () => {
      window.removeEventListener("focus", fetchStatus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", fetchStatus);
    };
  }, [fetchStatus]);

  return { ...state, refetch: fetchStatus };
}
