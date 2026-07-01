import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label. Associated via `htmlFor`/`id` when an `id` is supplied. */
  label?: string;
  /** Helper text under the field. */
  hint?: string;
  /** Error message — shown in danger color and sets `aria-invalid`. */
  error?: string;
  /** Optional decorative adornment on the left (e.g. a mail icon). */
  leadingIcon?: ReactNode;
  /** Optional interactive node on the right (e.g. a password-visibility button). Caller-owned. */
  trailingIcon?: ReactNode;
  /** Class applied to the field wrapper (vs `className`, applied to the `<input>`). */
  containerClassName?: string;
}

/**
 * Presentational, stateless text field. Server-safe — it holds no state itself,
 * so behaviours like password visibility are composed by the caller via `trailingIcon`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, trailingIcon, containerClassName, className, id, ...props },
  ref,
) {
  const describedBy = error && id ? `${id}-error` : hint && id ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex h-13 items-center gap-2.5 rounded-xl border-[1.5px] border-hairline bg-surface px-4",
          "transition-shadow focus-within:border-violet focus-within:ring-2 focus-within:ring-lavender",
          error && "border-danger focus-within:border-danger focus-within:ring-danger-tint",
          containerClassName,
        )}
      >
        {leadingIcon && (
          <span className="flex shrink-0 text-muted [&_svg]:h-5 [&_svg]:w-5" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted",
            className,
          )}
          {...props}
        />
        {trailingIcon && <span className="flex shrink-0 items-center">{trailingIcon}</span>}
      </div>
      {error ? (
        <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
