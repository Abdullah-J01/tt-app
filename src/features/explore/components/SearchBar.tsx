"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";

/**
 * Full-screen search input (UI brief §6.4). Seeds from ?q=, debounces edits
 * into the URL so the server can re-render grouped results, and clears back to
 * the empty (recent / suggested) state.
 */
export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce keystrokes into the URL query so results follow as you type.
  useEffect(() => {
    const q = value.trim();
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => {
      router.replace(q ? `/explore/search?q=${encodeURIComponent(q)}` : "/explore/search", {
        scroll: false,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [value, params, router]);

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 bg-surface/95 py-3 backdrop-blur md:top-16">
      <button
        type="button"
        aria-label="Back"
        onClick={() => router.push("/explore")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink hover:bg-lavender active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search studybooks, subjects…"
          className="h-11 w-full rounded-full border border-hairline bg-lavender/50 pl-9 pr-9 text-sm outline-none focus:border-violet"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-hairline"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
