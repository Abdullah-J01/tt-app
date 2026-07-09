import Link from "@/i18n/Link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo — the Tasku Tark wordmark. `animated` adds a fade-up entrance (used
 * on the auth screen). `className` can override the default size (e.g. a smaller
 * `h-6` in the header) — it's merged last so it wins.
 */
export function Logo({
  href = "/",
  animated = false,
  className,
}: {
  href?: string;
  animated?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/images/tasku-tark.svg"
        alt="Tasku Tark"
        width={290}
        height={64}
        priority
        className={cn(
          "block h-8 w-auto",
          animated && "anim-fade-up [animation-delay:120ms]",
          className,
        )}
      />
    </Link>
  );
}
