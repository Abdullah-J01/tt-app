"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/store/StoreProvider";
import { NetworkProvider } from "@/context/NetworkProvider";

/** Global client providers: auth session + Redux auth store + server-state cache. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
