import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-violet text-white hover:bg-violet-dark",
  secondary: "bg-surface text-ink border border-hairline hover:bg-lavender",
  ghost: "bg-transparent text-violet hover:bg-lavender",
  danger: "bg-danger text-white hover:bg-danger/90",
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
  /**
   * Render a bare `<button>` with only the supplied `className` — skips every
   * default/variant/size style plus the icon & loading chrome. Use it to route a
   * fully custom button through this component without altering its look.
   */
  unstyled?: boolean;
  children?: ReactNode;
}

/**
 * Primary CTA / secondary / ghost button. Matches TT's rounded violet buttons.
 *
 * Every native `<button>` attribute (`onClick`, `type`, `aria-*`, `ref`, …) is
 * optional and forwarded straight through, so it drops in wherever a plain
 * `<button>` was used. Pass `unstyled` to keep a bespoke button's own styling.
 */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  unstyled = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  if (unstyled) {
    return (
      <button className={className} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors transition-transform",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
        "focus-visible:ring-violet/40 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
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
      {/* Wrapped so translators (Google Translate swaps bare text nodes for <font>)
          can't break React's insertBefore anchor when the loading slot toggles. */}
      {children != null && children !== false && <span>{children}</span>}
      {trailingIcon && (
        <span className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">{trailingIcon}</span>
      )}
    </button>
  );
}
