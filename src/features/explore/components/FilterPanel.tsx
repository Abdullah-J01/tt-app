"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { FACETS, type FilterOption } from "../filters";
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
    return [{ ...option, children: selfMatches && !matchedChildren?.length ? option.children : matchedChildren }];
  });
}

/**
 * Modern take on TaskuTark's "Filter materials" — an animated accordion of
 * facets with springy violet checkboxes. Bodies stay mounted and collapse via
 * the grid-rows trick so open/close animates both ways. While searching, only
 * matching options render and their sections auto-expand.
 */
export function FilterPanel({
  resultCount,
  selected,
  onToggle,
  onClear,
  searchable = false,
  className,
}: FilterPanelProps) {
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
    ? FACETS.flatMap((facet) => {
        const options = matchOptions(facet.options, q);
        return options.length ? [{ ...facet, options }] : [];
      })
    : FACETS;

  return (
    <div className={cn("overflow-hidden rounded-card border border-hairline bg-surface", className)}>
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h2 className="text-lg font-bold">Filter materials</h2>
        {/* keyed so the badge re-pops whenever the count changes */}
        <span key={resultCount} className="pill-in rounded-full bg-lavender px-2.5 py-1 text-xs font-semibold text-ink">
          {resultCount} results
        </span>
      </div>

      {searchable && (
        <div className="relative mx-4 mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filters…"
            aria-label="Search filters"
            className="h-10 w-full rounded-full border border-hairline bg-lavender/40 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-violet"
          />
        </div>
      )}

      {selected.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="pill-in px-4 pb-1 pt-3 text-sm font-semibold text-violet hover:underline"
        >
          Clear all ({selected.size})
        </button>
      )}

      <div className="mt-3">
        {facets.length === 0 && (
          <p className="border-t border-hairline px-4 py-6 text-center text-sm text-muted">
            No filters match “{query.trim()}”.
          </p>
        )}
        {facets.map((facet, i) => {
          const Icon = facet.icon;
          const open = q ? true : openSections.has(facet.key);
          const checkedCount = [...selected].filter((k) => k.startsWith(`${facet.key}:`)).length;
          return (
            <div
              key={facet.key}
              className="anim-item-in border-t border-hairline"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <button
                type="button"
                onClick={() => flip(openSections, setOpenSections, facet.key)}
                aria-expanded={open}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-lavender/30"
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                    open ? "bg-lavender text-violet" : "bg-mist text-slate group-hover:bg-lavender group-hover:text-violet",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 font-semibold">{facet.label}</span>
                {checkedCount > 0 && (
                  <span
                    key={checkedCount}
                    className="pill-in grid h-5 min-w-5 place-items-center rounded-full bg-violet px-1.5 text-xs font-semibold text-white"
                  >
                    {checkedCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                    open && "rotate-180",
                  )}
                />
              </button>

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
}

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
  const key = `${facetKey}:${option.value}`;
  const checked = selected.has(key);
  const hasChildren = !!option.children?.length;
  const open = forceOpen || openOptions.has(key);

  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onToggle(key)}
          className={cn(
            "flex flex-1 items-center gap-3 py-2 pr-2 text-left text-sm transition-colors hover:bg-lavender/30",
            checked && "bg-lavender/20",
          )}
          style={{ paddingLeft: 16 + depth * 20 }}
        >
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-200",
              checked
                ? "scale-105 border-violet bg-violet text-white shadow-soft"
                : "border-hairline bg-surface",
            )}
          >
            {checked && <Check className="check-pop h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className={cn("flex-1 text-ink", checked && "font-semibold")}>{option.label}</span>
          {option.count != null && (
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {option.count.toLocaleString("en-US")}
            </span>
          )}
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleOpen(key)}
            aria-expanded={open}
            aria-label={open ? "Collapse" : "Expand"}
            className="mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-lavender"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
          </button>
        )}
      </div>

      {hasChildren && (
        <div className={cn("acc-body grid", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")} inert={!open}>
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
