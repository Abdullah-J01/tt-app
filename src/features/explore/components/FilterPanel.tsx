"use client";

import { memo, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Check, ChevronDown, Search } from "lucide-react";
import { type FilterOption } from "../filters";
import { useLocalizedFacets } from "../useCatalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  resultCount: number;
  /** Composite keys "facetKey:value" that are checked. */
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
  onClear: () => void;
  /** Show a search box that live-filters the facet options. */
  searchable?: boolean;
  className?: string;
}

/** Options whose label matches the query, keeping parents of matching children. */
function matchOptions(options: FilterOption[], q: string): FilterOption[] {
  return options.flatMap((option) => {
    const matchedChildren = option.children ? matchOptions(option.children, q) : undefined;
    const selfMatches = option.label.toLowerCase().includes(q);
    if (!selfMatches && !matchedChildren?.length) return [];
    return [
      {
        ...option,
        children: selfMatches && !matchedChildren?.length ? option.children : matchedChildren,
      },
    ];
  });
}

/**
 * Modern take on TaskuTark's "Filter materials" — an animated accordion of
 * facets with springy violet checkboxes. Bodies stay mounted and collapse via
 * the grid-rows trick so open/close animates both ways. While searching, only
 * matching options render and their sections auto-expand.
 */
/**
 * Memoized: the panel renders every facet and option, but sits outside the
 * results list — so without this it re-renders on each tab/sort/page/view
 * change in the toolbar next to it. Callers must pass stable `onToggle`/
 * `onClear` (useCallback) for this to hold.
 */
export const FilterPanel = memo(function FilterPanel({
  resultCount,
  selected,
  onToggle,
  onClear,
  searchable = false,
  className,
}: FilterPanelProps) {
  const t = useTranslations("features_explore_components_FilterPanel");
  const allFacets = useLocalizedFacets();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["target", "subject"]));
  const [openOptions, setOpenOptions] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const flip = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    setter(next);
  };

  const facets = q
    ? allFacets.flatMap((facet) => {
        const options = matchOptions(facet.options, q);
        return options.length ? [{ ...facet, options }] : [];
      })
    : allFacets;

  return (
    <div
      className={cn("rounded-card border-hairline bg-surface overflow-hidden border", className)}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h2 className="text-[15px] font-bold leading-tight">{t("title")}</h2>
        {/* keyed so the badge re-pops whenever the count changes */}
        <span
          key={resultCount}
          className="pill-in bg-lavender text-ink shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
        >
          {t("resultCount", { count: resultCount })}
        </span>
      </div>

      {searchable && (
        <div className="relative mx-4 mt-3">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            unstyled
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="border-hairline bg-lavender/40 placeholder:text-muted focus:border-violet h-10 w-full rounded-full border pr-4 pl-9 text-sm transition-colors outline-none"
          />
        </div>
      )}

      {selected.size > 0 && (
        <Button
          unstyled
          type="button"
          onClick={onClear}
          className="pill-in text-violet px-4 pt-3 pb-1 text-sm font-semibold hover:underline"
        >
          {t("clearAll", { count: selected.size })}
        </Button>
      )}

      <div className="mt-3">
        {facets.length === 0 && (
          <p className="border-hairline text-muted border-t px-4 py-6 text-center text-sm">
            {t("noMatch", { query: query.trim() })}
          </p>
        )}
        {facets.map((facet, i) => {
          const Icon = facet.icon;
          const open = q ? true : openSections.has(facet.key);
          const checkedCount = [...selected].filter((k) => k.startsWith(`${facet.key}:`)).length;
          return (
            <div
              key={facet.key}
              className="anim-item-in border-hairline border-t"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Button
                unstyled
                type="button"
                onClick={() => flip(openSections, setOpenSections, facet.key)}
                aria-expanded={open}
                className="group hover:bg-lavender/30 flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors"
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                    open
                      ? "bg-lavender text-violet"
                      : "bg-mist text-slate group-hover:bg-lavender group-hover:text-violet",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 font-semibold">{facet.label}</span>
                {checkedCount > 0 && (
                  <span
                    key={checkedCount}
                    className="pill-in bg-violet grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold text-white"
                  >
                    {checkedCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "text-muted h-4 w-4 shrink-0 transition-transform duration-300",
                    open && "rotate-180",
                  )}
                />
              </Button>

              <div
                className={cn("acc-body grid", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                inert={!open}
              >
                <div className="overflow-hidden">
                  <ul className="pb-2">
                    {facet.options.map((opt) => (
                      <OptionRow
                        key={opt.value}
                        facetKey={facet.key}
                        option={opt}
                        depth={0}
                        selected={selected}
                        onToggle={onToggle}
                        openOptions={openOptions}
                        onToggleOpen={(k) => flip(openOptions, setOpenOptions, k)}
                        forceOpen={!!q}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

function OptionRow({
  facetKey,
  option,
  depth,
  selected,
  onToggle,
  openOptions,
  onToggleOpen,
  forceOpen = false,
}: {
  facetKey: string;
  option: FilterOption;
  depth: number;
  selected: ReadonlySet<string>;
  onToggle: (key: string) => void;
  openOptions: ReadonlySet<string>;
  onToggleOpen: (key: string) => void;
  forceOpen?: boolean;
}) {
  const t = useTranslations("features_explore_components_FilterPanel");
  const key = `${facetKey}:${option.value}`;
  const checked = selected.has(key);
  const hasChildren = !!option.children?.length;
  const open = forceOpen || openOptions.has(key);

  return (
    <li>
      <div className="flex items-center">
        <Button
          unstyled
          type="button"
          onClick={() => onToggle(key)}
          className={cn(
            "hover:bg-lavender/30 flex flex-1 items-center gap-3 py-2 pr-2 text-left text-sm transition-colors",
            checked && "bg-lavender/20",
          )}
          style={{ paddingLeft: 16 + depth * 20 }}
        >
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-200",
              checked
                ? "border-violet bg-violet shadow-soft scale-105 text-white"
                : "border-hairline bg-surface",
            )}
          >
            {checked && <Check className="check-pop h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className={cn("text-ink flex-1", checked && "font-semibold")}>{option.label}</span>
          {option.count != null && (
            <span className="text-muted shrink-0 text-xs tabular-nums">
              {option.count.toLocaleString("en-US")}
            </span>
          )}
        </Button>

        {hasChildren && (
          <Button
            unstyled
            type="button"
            onClick={() => onToggleOpen(key)}
            aria-expanded={open}
            aria-label={open ? t("collapse") : t("expand")}
            className="text-muted hover:bg-lavender mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
            />
          </Button>
        )}
      </div>

      {hasChildren && (
        <div
          className={cn("acc-body grid", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
          inert={!open}
        >
          <div className="overflow-hidden">
            <ul>
              {option.children!.map((child) => (
                <OptionRow
                  key={child.value}
                  facetKey={facetKey}
                  option={child}
                  depth={depth + 1}
                  selected={selected}
                  onToggle={onToggle}
                  openOptions={openOptions}
                  onToggleOpen={onToggleOpen}
                  forceOpen={forceOpen}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
