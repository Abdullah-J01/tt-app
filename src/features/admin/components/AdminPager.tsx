"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

interface AdminPagerProps {
  page: number;
  totalPages: number;
  className?: string;
}

/** `Pagination` wired to the `?page=` search param for server-driven tables. */
export function AdminPager({ page, totalPages, className }: AdminPagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next > 1) params.set("page", String(next));
    else params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return <Pagination page={page} totalPages={totalPages} onChange={onChange} className={className} />;
}
