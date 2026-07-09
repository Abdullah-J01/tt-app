import { type Locale } from "./config";

/**
 * Canonical (physical route segment) → localized slug, per locale. Only Estonian
 * differs; English and Russian keep the canonical English segments. Data segments
 * (subject slugs, studybook slugs) aren't listed, so they pass through untouched.
 */
const LOCALIZED: Partial<Record<Locale, Record<string, string>>> = {
  et: {
    explore: "avasta",
    search: "otsing",
    library: "raamatukogu",
    feed: "voog",
    about: "meist",
    contact: "kontakt",
    privacy: "privaatsus",
    terms: "tingimused",
    profile: "profiil",
    settings: "seaded",
    achievements: "saavutused",
    invite: "kutse",
    onboarding: "alustamine",
    studybook: "opik",
    read: "loe",
    login: "sisselogimine",
    signup: "registreerumine",
    "forgot-password": "unustasin-parooli",
  },
};

// Reverse map (localized → canonical) per locale.
const CANONICAL: Partial<Record<Locale, Record<string, string>>> = {};
for (const [lng, map] of Object.entries(LOCALIZED)) {
  const reverse: Record<string, string> = {};
  for (const [canon, loc] of Object.entries(map)) reverse[loc] = canon;
  CANONICAL[lng as Locale] = reverse;
}

function toLocalizedSegment(seg: string, locale: Locale): string {
  return LOCALIZED[locale]?.[seg] ?? seg;
}
function toCanonicalSegment(seg: string, locale: Locale): string {
  return CANONICAL[locale]?.[seg] ?? seg;
}

/** Translate a canonical path (`/explore/search`) into the locale's slugs. */
export function localizePath(path: string, locale: Locale): string {
  const segs = path.split("/").filter(Boolean).map((s) => toLocalizedSegment(s, locale));
  return segs.length ? `/${segs.join("/")}` : "/";
}

/** Translate a locale's path (`/avasta/otsing`) back to canonical segments. */
export function canonicalizePath(path: string, locale: Locale): string {
  const segs = path.split("/").filter(Boolean).map((s) => toCanonicalSegment(s, locale));
  return segs.length ? `/${segs.join("/")}` : "/";
}
