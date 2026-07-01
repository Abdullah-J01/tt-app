import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-violet text-white hover:bg-violet-dark",
  secondary: "bg-surface text-ink border border-hairline hover:bg-lavender",
  ghost: "bg-transparent text-violet hover:bg-lavender",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Full-width button. */
  block?: boolean;
  /** Shows a spinner, disables the button, and sets `aria-busy`. */
  loading?: boolean;
  /** Optional icon before the label (replaced by the spinner while loading). */
  leadingIcon?: ReactNode;
  /** Optional icon after the label. */
  trailingIcon?: ReactNode;
  children: ReactNode;
}

/** Primary CTA / secondary / ghost button. Matches TT's rounded violet buttons. */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform transition-colors",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 disabled:opacity-50",
        block && "w-full",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leadingIcon && <span className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">{leadingIcon}</span>
      )}
      {children}
      {trailingIcon && <span className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">{trailingIcon}</span>}
    </button>
  );
}
