"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function SearchBar({ className }: { className?: string }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations("components_home_SearchBar");

  const submit = (q: string) => {
    router.push(`/explore/search?q=${encodeURIComponent(q)}`);
    // The search screen's own bar takes over (seeded from ?q= and focused) —
    // reset here so there's a single source of truth for the query.
    setValue("");
    inputRef.current?.blur();
  };

  // Debounce keystrokes into the full-screen search; Enter skips the wait.
  useEffect(() => {
    const q = value.trim();
    if (!q) return;
    const t = setTimeout(() => submit(q), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run on typing only, `submit` is stable per render
  }, [value]);

  return (
    <motion.div
      className={cn(
        "border-border hidden cursor-text items-center gap-2 rounded-full border bg-white/70 px-4 py-2 lg:flex",
        className,
      )}
      // Self-sized (not stretched) — it sits in the right-side cluster next to
      // the language selector, so it grows on focus but doesn't try to fill
      // the header.
 animate={{
  width: focused
    ? window.innerWidth < 1100 && window.innerWidth > 1000
      ? 450
      : 500
    : window.innerWidth >= 1200
      ? 400
      : 280,
}}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={16} className="text-muted shrink-0" aria-hidden="true" />
      <Input
        unstyled
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          const q = value.trim();
          if (e.key === "Enter" && q) submit(q);
        }}
        placeholder={t("placeholder")}
        aria-label={t("ariaLabel")}
        className="text-ink placeholder:text-muted w-full bg-transparent text-sm outline-none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </motion.div>
  );
}
