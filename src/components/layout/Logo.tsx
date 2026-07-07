import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand logo — the Tasku Tark wordmark. `animated` adds a fade-up entrance (used on the auth screen). */
export function Logo({ href = "/", animated = false }: { href?: string; animated?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/images/tasku-tark.svg"
        alt="Tasku Tark"
        width={290}
        height={64}
        priority
        className={cn("h-8 w-auto", animated && "anim-fade-up [animation-delay:120ms]")}
      />
    </Link>
  );
}
