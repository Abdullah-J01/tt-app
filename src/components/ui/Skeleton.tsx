import { cn } from "@/lib/utils";

/**
 * Neutral loading placeholder block. Shape/size/tint come from `className`
 * (e.g. `h-4 w-32 rounded-full bg-white/15`); defaults suit light surfaces.
 * Decorative by design — wrap a group of skeletons in `role="status"` with an
 * accessible label instead of labelling each block.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-mist rounded-md motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}
