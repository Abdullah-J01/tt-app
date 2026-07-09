"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Full-screen search input (UI brief §6.4). Seeds from ?q=, debounces edits
 * into the URL so the server can re-render grouped results, and clears back to
 * the empty (recent / suggested) state.
 */
export function SearchBar() {
  const t = useTranslations("features_explore_components_SearchBar");
  const router = useRouter();
  const params = useSearchParams();
  const paramQ = params.get("q") ?? "";
  const [value, setValue] = useState(paramQ);
  const inputRef = useRef<HTMLInputElement>(null);

  // ?q= can also change outside the input (recent/suggested chips, back and
  // forward). Mirror those into the field — without this, the stale value
  // debounces back into the URL and undoes the chip tap. Trim-compare so our
  // own replace (which trims) never clobbers a trailing space mid-typing.
  const lastParamQ = useRef(paramQ);
  if (lastParamQ.current !== paramQ) {
    lastParamQ.current = paramQ;
    if (paramQ !== value.trim()) setValue(paramQ);
  }

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
    <div className="bg-surface/95 sticky top-0 z-10 flex items-center gap-2 py-3 backdrop-blur md:top-16">
      <Button
        unstyled
        type="button"
        aria-label={t("back")}
        onClick={() => router.push("/explore")}
        className="text-ink hover:bg-lavender grid h-10 w-10 shrink-0 place-items-center rounded-full active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="relative flex-1">
        <Search className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          unstyled
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("placeholder")}
          className="border-hairline bg-lavender/50 focus:border-violet h-11 w-full rounded-full border pr-9 pl-9 text-sm outline-none"
        />
        {value && (
          <Button
            unstyled
            type="button"
            aria-label={t("clearSearch")}
            onClick={() => setValue("")}
            className="text-muted hover:bg-hairline absolute top-1/2 right-2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
