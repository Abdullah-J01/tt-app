import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "grey" | "violet" | "green" | "amber";
type Shape = "circle" | "rounded";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  grey: "bg-mist text-slate",
  violet: "bg-lavender text-violet",
  green: "bg-green-tint text-green-dark",
  amber: "bg-amber-tint text-amber-dark",
};

/** size → box + child-svg sizing (any svg child is normalised to a consistent size). */
const sizes: Record<Size, string> = {
  sm: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  md: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
  lg: "h-14 w-14 [&_svg]:h-7 [&_svg]:w-7",
};

interface IconBadgeProps {
  /** Any icon node (e.g. a lucide `<School />`); it is sized by the badge. */
  icon: ReactNode;
  variant?: Variant;
  shape?: Shape;
  size?: Size;
  className?: string;
}

/** Circular / rounded icon container with tinted color variants (UI brief §2.4). */
export function IconBadge({
  icon,
  variant = "grey",
  shape = "circle",
  size = "md",
  className,
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        variants[variant],
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {icon}
    </span>
  );
}
