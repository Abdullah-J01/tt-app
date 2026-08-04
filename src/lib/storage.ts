"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export const STORAGE_VERSION = "v1";

const PREFIX = "tt";
const ANONYMOUS = "anonymous";

/** Storage holding user data — one bucket per signed-in account. */
export type UserScope = "progress" | "library" | "streak" | "profile" | "onboarding";

/** Storage holding device-level view state, deliberately shared across users. */
export type DeviceScope = "lastTab" | "libraryTab" | "libraryFilter" | "installDismissed";

/** Signed-out users get their own bucket rather than sharing anyone's. */
export function storageOwner(email: string | null | undefined): string {
  return email?.trim().toLowerCase() || ANONYMOUS;
}

export function userStorageKey(scope: UserScope, email: string | null | undefined): string {
  return `${PREFIX}:${scope}:${STORAGE_VERSION}:${storageOwner(email)}`;
}

export function deviceStorageKey(scope: DeviceScope): string {
  return `${PREFIX}:${scope}:${STORAGE_VERSION}`;
}

/**
 * Resolve the storage bucket for the signed-in user.
 *
 * `ready` is the gate every caller must respect: `useSession()` reports
 * `loading` on first render, so `email` — and therefore `key` — is undefined
 * for a beat. Reading during that window hydrates the *anonymous* (empty)
 * bucket and announces it as loaded; writing during it strands real user data
 * under `anonymous` forever. Hydrate only once `ready`, and refuse writes until
 * `canPersist`.
 */
export function useUserStorage(scope: UserScope) {
  const { data: session, status } = useSession();
  const email = session?.user?.email ?? null;

  const key = useMemo(() => userStorageKey(scope, email), [scope, email]);

  return {
    key,
    email,
    /** Session resolved — safe to read, and to write to the anonymous bucket. */
    ready: status !== "loading",
    /** Session resolved *and* signed in. */
    canPersist: status === "authenticated",
  };
}

/**
 * Move an anonymous draft onto a signed-in account, once, without ever
 * overwriting data that account already has.
 *
 * Only for flows that legitimately *start* signed-out and finish signed-in —
 * onboarding is the one (the marketing hero links straight into it). Everything
 * else deliberately leaves the anonymous bucket where it is: silently adopting
 * whatever the previous visitor left behind is exactly the mixing this module
 * prevents.
 */
export function claimAnonymousBucket(scope: UserScope, email: string | null | undefined): void {
  const owner = storageOwner(email);
  if (owner === ANONYMOUS) return;
  try {
    const from = userStorageKey(scope, null);
    const to = userStorageKey(scope, email);
    const draft = window.localStorage.getItem(from);
    if (draft == null) return;
    if (window.localStorage.getItem(to) == null) window.localStorage.setItem(to, draft);
    window.localStorage.removeItem(from);
  } catch {
    /* storage unavailable — nothing to claim */
  }
}

/**
 * Drop keys this build can no longer read: the pre-namespace `sb.*` / `sb:*`
 * ones, and any `tt:*` key from an older `STORAGE_VERSION`.
 *
 * Storage survives every deploy on a given origin, so without this a shape
 * change quietly hydrates old objects into new code — and the old un-namespaced
 * keys were browser-global, i.e. shared between every account that ever signed
 * in on this device. Runs once per load from `Providers`.
 */
export function purgeStaleStorage(): void {
  const current = `:${STORAGE_VERSION}`;
  /** Pre-namespace keys, plus any `tt:` key from an older STORAGE_VERSION. */
  const isStale = (key: string) =>
    key.startsWith("sb.") ||
    key.startsWith("sb:") ||
    key === "pwa-install-dismissed" ||
    (key.startsWith(`${PREFIX}:`) && !key.includes(current));

  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const doomed = Object.keys(store).filter(isStale);
      for (const key of doomed) store.removeItem(key);
    } catch {
      /* storage unavailable (private mode) — nothing to purge */
    }
  }
}
