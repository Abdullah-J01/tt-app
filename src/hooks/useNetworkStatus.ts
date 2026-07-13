"use client";

import { useEffect, useState } from "react";

export interface NetworkStatus {
  /** Best-effort "the device has a working connection" flag. */
  isOnline: boolean;
  /** True once the app has observed at least one offline→online transition. */
  reconnected: boolean;
}

/**
 * Actively confirms reachability. `navigator.onLine` only reports whether the
 * device has *a* network interface — not whether the internet is reachable — so
 * we HEAD a tiny same-origin resource to be sure. Used on reconnect + Retry.
 */
export async function checkReachability(signal?: AbortSignal): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  try {
    await fetch("/manifest.webmanifest", {
      method: "HEAD",
      cache: "no-store",
      signal,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Typed online/offline hook for the App Router. SSR-safe (assumes online on the
 * server to avoid a hydration flash), then syncs to the real state on mount and
 * on every `online`/`offline` event.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    // Sync to the real value immediately after hydration.
    setIsOnline(navigator.onLine);

    const goOnline = () => {
      setIsOnline(true);
      setReconnected(true);
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { isOnline, reconnected };
}
