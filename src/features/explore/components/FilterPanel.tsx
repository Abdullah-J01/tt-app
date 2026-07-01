"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FACETS, type FilterOption } from "../filters";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  resultCount: number;
  /** Composite keys "facetKey:value" that are checked. */
  selected: ReadonlySet<string>;
  onToggle: (compositeKey: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Modern take on TaskuTark's "Filter materials" — a clean accordion of facets
 * with violet checkboxes and nested options. Rendered inside the filter drawer.
 */
export function FilterPanel({ resultCount, selected, onToggle, onClear, className }: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["target"]));
  const [openOptions, setOpenOptions] = useState<Set<string>>(new Set());

  const flip = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    setter(next);
  };

  return (
    <div className={cn("overflow-hidden rounded-card border border-hairline bg-surface", className)}>
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h2 className="text-lg font-bold">Filter materials</h2>
        <span className="rounded-full bg-lavender px-2.5 py-1 text-xs font-semibold text-ink">
          {resultCount} results
        </span>
      </div>
      {selected.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 pb-3 pt-2 text-sm font-semibold text-violet hover:underline"
        >
          Clear all ({selected.size})
        </button>
      )}

      <div className={cn("mt-1", selected.size === 0 && "pt-2")}>
        {FACETS.map((facet) => {
          const Icon = facet.icon;
          const open = openSections.has(facet.key);
          return (
            <div key={facet.key} className="border-t border-hairline">
              <button
                type="button"
                onClick={() => flip(openSections, setOpenSections, facet.key)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-lavender/30"
              >
                <Icon className="h-5 w-5 shrink-0 text-ink" aria-hidden />
                <span className="flex-1 font-semibold">{facet.label}</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
                />
              </button>

              {open && (
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
                    />
                  ))}
                </ul>
              )}
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
}: {
  facetKey: string;
  option: FilterOption;
  depth: number;
  selected: ReadonlySet<string>;
  onToggle: (key: string) => void;
  openOptions: ReadonlySet<string>;
  onToggleOpen: (key: string) => void;
}) {
  const key = `${facetKey}:${option.value}`;
  const checked = selected.has(key);
  const hasChildren = !!option.children?.length;
  const open = openOptions.has(key);

  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onToggle(key)}
          className="flex flex-1 items-center gap-3 py-2 pr-2 text-left text-sm transition-colors hover:bg-lavender/30"
          style={{ paddingLeft: 16 + depth * 20 }}
        >
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
              checked ? "border-violet bg-violet text-white" : "border-hairline bg-surface",
            )}
          >
            {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className={cn("text-ink", checked && "font-semibold")}>{option.label}</span>
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleOpen(key)}
            aria-label={open ? "Collapse" : "Expand"}
            className="mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-lavender"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>

      {hasChildren && open && (
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
            />
          ))}
        </ul>
      )}
    </li>
  );
}
