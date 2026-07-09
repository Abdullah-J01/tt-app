"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/store/StoreProvider";

/** Global client providers: auth session + Redux auth store + server-state cache. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
