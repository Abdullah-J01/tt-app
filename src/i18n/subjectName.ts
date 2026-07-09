import { getTranslations } from "./server";

/**
 * Server-side resolver for localized subject names, keyed by slug under the
 * `catalog` namespace. Falls back to the given English name (or the slug).
 */
export async function getSubjectName(): Promise<(slug: string, fallback?: string) => string> {
  const t = await getTranslations("catalog");
  return (slug, fallback) => {
    const value = t(`subject.${slug}`);
    return value.startsWith("catalog.subject.") ? (fallback ?? slug) : value;
  };
}
