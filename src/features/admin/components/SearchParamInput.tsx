"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface SearchParamInputProps {
  placeholder: string;
  /** Debounce before the URL updates (ms). */
  delay?: number;
  className?: string;
}

/**
 * Search box that mirrors its value to the `?q=` search param (debounced) so
 * the server page re-renders with filtered results. Resets `?page=`.
 */
export function SearchParamInput({ placeholder, delay = 300, className }: SearchParamInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onChange = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, delay);
  };

  return (
    <Input
      type="search"
      aria-label={placeholder}
      placeholder={placeholder}
      defaultValue={searchParams.get("q") ?? ""}
      leadingIcon={<Search />}
      containerClassName="h-11"
      className={className}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
