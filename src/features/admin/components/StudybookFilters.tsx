"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GRADES, SUBJECTS } from "@/config/subjects";
import { Select } from "@/components/ui/Select";

/** Subject + grade dropdowns mirrored to search params (resets `?page=`). */
export function StudybookFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: "subject" | "grade", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="max-sm:w-[calc(50%-0.375rem)]">
        <Select
          aria-label="Filter by subject"
          containerClassName="h-11 w-48 max-sm:w-full"
          value={searchParams.get("subject") ?? ""}
          onChange={(e) => setParam("subject", e.target.value)}
        >
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="max-sm:w-[calc(50%-0.375rem)]">
        <Select
          aria-label="Filter by grade"
          containerClassName="h-11 w-40 max-sm:w-full"
          value={searchParams.get("grade") ?? ""}
          onChange={(e) => setParam("grade", e.target.value)}
        >
          <option value="">All grades</option>
          {GRADES.filter((g) => g.slug !== "all").map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
}
