"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserStorage } from "@/lib/storage";
import { PROFILE } from "./config";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  /** Data-URL of an uploaded avatar, if any. */
  photo?: string;
}

const EVENT = "tt:profile";

const DEFAULT: ProfileData = {
  firstName: PROFILE.firstName,
  lastName: PROFILE.lastName,
  email: PROFILE.email,
  handle: PROFILE.handle,
};

function read(key: string): ProfileData {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<ProfileData>) };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

function write(key: string, data: ProfileData): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore quota / disabled storage */
  }
  window.dispatchEvent(new Event(EVENT));
}


export function useProfile() {
  const { data: session } = useSession();
  const { key, ready } = useUserStorage("profile");
  const [data, setData] = useState<ProfileData>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once the session names the bucket (localStorage is client-only).
  useEffect(() => {
    if (!ready) return;

    setData(read(key));
    setHydrated(true);
    const sync = () => setData(read(key));
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, [key, ready]);


  useEffect(() => {
    const email = session?.user?.email;
    if (!email || !ready) return;
    const stored = read(key);
    const isPlaceholder = stored.email === DEFAULT.email && stored.firstName === DEFAULT.firstName;
    if (!isPlaceholder) return;
    const parts = (session?.user?.name ?? email.split("@")[0] ?? "").trim().split(/\s+/);
    const seeded: ProfileData = {
      firstName: parts[0] || DEFAULT.firstName,
      lastName: parts.slice(1).join(" "),
      email,
      handle: email.split("@")[0] ?? email,
    };
    write(key, seeded);
    setData(seeded);
  }, [session, key, ready]);

  /**
   * Persist + broadcast outside the setState updater (updaters must stay pure —
   * the header and the settings screen are mounted together).
   */
  const update = useCallback(
    (patch: Partial<ProfileData>) => {
      if (!ready) return;
      const next = { ...read(key), ...patch };
      write(key, next);
      setData(next);
    },
    [key, ready],
  );

  const fullName = `${data.firstName} ${data.lastName}`.trim() || PROFILE.name;

  return { data, update, fullName, hydrated };
}
