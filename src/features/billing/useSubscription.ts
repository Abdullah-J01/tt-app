"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubStatus } from "./core";

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
        if (!cancelledRef.current) setState({ status: "none", materialPurchasedAt: null });
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
