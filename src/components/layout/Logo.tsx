import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

/** Brand logo. `animated` adds a pop-in + float entrance (used on the auth screen). */
export function Logo({ href = "/", animated = false }: { href?: string; animated?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </span>
      <span
        className={cn(
          "text-lg font-bold text-brand-green",
          animated && "anim-fade-up [animation-delay:120ms]",
        )}
      >
        {SITE.name}
      </span>
    </Link>
  );
}
