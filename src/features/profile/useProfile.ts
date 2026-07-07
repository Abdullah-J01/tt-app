"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PROFILE } from "./config";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  /** Data-URL of an uploaded avatar, if any. */
  photo?: string;
}

const KEY = "sb.profile";
const EVENT = "sb:profile";

const DEFAULT: ProfileData = {
  firstName: PROFILE.firstName,
  lastName: PROFILE.lastName,
  email: PROFILE.email,
  handle: PROFILE.handle,
};

function read(): ProfileData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<ProfileData>) };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

/**
 * Client-side profile store backed by localStorage. Edits from the Personal
 * Information screen sync live to the Profile header via a custom event.
 * TODO(team): replace with the real account API once available.
 */
export function useProfile() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData>(DEFAULT);

  // Hydrate after mount (localStorage is client-only) + keep tabs/screens in sync.
  useEffect(() => {
    setData(read());
    const sync = () => setData(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  // Seed the profile from the signed-in account while it's still the placeholder
  // default — so a freshly created account's name/email show up right away.
  // Anything the user edits afterwards is kept (this only runs on the default).
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    const stored = read();
    const isPlaceholder = stored.email === DEFAULT.email && stored.firstName === DEFAULT.firstName;
    if (!isPlaceholder) return;
    const parts = (session?.user?.name ?? email.split("@")[0] ?? "").trim().split(/\s+/);
    const seeded: ProfileData = {
      firstName: parts[0] || DEFAULT.firstName,
      lastName: parts.slice(1).join(" "),
      email,
      handle: email.split("@")[0] ?? email,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(seeded));
    } catch {
      /* ignore quota / disabled storage */
    }
    setData(seeded);
    window.dispatchEvent(new Event(EVENT));
  }, [session]);

  const update = useCallback((patch: Partial<ProfileData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / disabled storage */
      }
      window.dispatchEvent(new Event(EVENT));
      return next;
    });
  }, []);

  const fullName = `${data.firstName} ${data.lastName}`.trim() || PROFILE.name;

  return { data, update, fullName };
}
