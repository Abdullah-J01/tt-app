"use client";

import { useTranslations } from "@/i18n/client";
import { FACETS, optionLabelKey, type Facet, type FilterOption } from "./filters";

/** FACETS with every facet/option label resolved to the active locale. */
export function useLocalizedFacets(): Facet[] {
  const t = useTranslations("catalog");
  const loc = (opts: FilterOption[]): FilterOption[] =>
    opts.map((o) => ({
      ...o,
      label: t(o.labelKey),
      children: o.children ? loc(o.children) : undefined,
    }));
  return FACETS.map((f) => ({ ...f, label: t(f.labelKey), options: loc(f.options) }));
}

/** Localized label for a composite "facetKey:value" key (active-filter pills). */
export function useOptionLabel(): (compositeKey: string) => string {
  const t = useTranslations("catalog");
  return (compositeKey) => {
    const key = optionLabelKey(compositeKey);
    return key ? t(key) : compositeKey.slice(compositeKey.indexOf(":") + 1);
  };
}
