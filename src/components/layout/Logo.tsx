import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SITE } from "@/config/site";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg font-bold text-brand-green">{SITE.name}</span>
    </Link>
  );
}
