import { cn } from "@/lib/utils";

/**
 * Page gutter box — the single place the app's horizontal spacing is defined, so
 * every screen lines up at the same left/right edges on mobile and desktop. Sets
 * the responsive gutter (px-4 → sm:px-6 → lg:px-8) and centres the content; pass
 * a max-width and any vertical padding / background via className.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
