"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/store/StoreProvider";
import { NetworkProvider } from "@/context/NetworkProvider";
import { purgeStaleStorage } from "@/lib/storage";

/** Global client providers: auth session + Redux auth store + server-state cache. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Drop browser storage this build can no longer read — the old un-namespaced
  // keys (shared by every account on the device) and any earlier
  // STORAGE_VERSION. Storage outlives every deploy on a given origin.
  useEffect(purgeStaleStorage, []);

  return (
    <SessionProvider>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          {/* Offline detection + navigation guard + offline modal (Instagram-style). */}
          <NetworkProvider>{children}</NetworkProvider>
        </QueryClientProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
