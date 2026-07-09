"use client";

import { useEffect, useState } from "react";
import type { SubStatus } from "./core";

/**
 * Fetches the signed-in user's subscription from GET /api/stripe/status.
 * Starts in a "loading" state; resolves to "signed_out" / "none" / an active
 * subscription. Falls back to "none" on network error so the UI still renders
 * the upsell rather than spinning forever.
 */
export function useSubscription(): SubStatus {
  const [state, setState] = useState<SubStatus>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((data: SubStatus) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ status: "none" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
