"use client";

import { useEffect } from "react";

export function DevSwCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length === 0) return; // clean origin — nothing to do
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      console.info("[dev] Evicted %d service worker(s) + caches. Refresh once.", regs.length);
    })();
  }, []);
  return null;
}
