"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { makeStore, type AppStore, type AppDispatch } from "./store";
import { setAuth } from "./authSlice";

/** Reads the NextAuth session (inside SessionProvider) and mirrors it to Redux. */
function SyncSession() {
  const { data, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(
      setAuth({
        status,
        user:
          status === "authenticated" && data?.user
            ? {
                name: data.user.name ?? null,
                email: data.user.email ?? null,
                image: data.user.image ?? null,
              }
            : null,
      }),
    );
  }, [dispatch, status, data]);

  return null;
}

/** Redux root — a fresh store per client, kept in sync with the auth session. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <SyncSession />
      {children}
    </Provider>
  );
}
