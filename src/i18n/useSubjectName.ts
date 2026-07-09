"use client";

import { useTranslations } from "./client";

/**
 * Returns a resolver for localized subject names, keyed by slug under the
 * `catalog` namespace. Falls back to the given English name (or the slug).
 */
export function useSubjectName(): (slug: string, fallback?: string) => string {
  const t = useTranslations("catalog");
  return (slug, fallback) => {
    const value = t(`subject.${slug}`);
    return value.startsWith("catalog.subject.") ? (fallback ?? slug) : value;
  };
}
