import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Field label. Associated via `htmlFor`/`id` (auto-generated when `id` is omitted). */
  label?: string;
  /** Helper text under the field. */
  hint?: string;
  /** Error message — shown in danger color and sets `aria-invalid`. */
  error?: string;
  /** Renders a danger asterisk after the label (visual only — validation is Zod-driven). */
  requiredMark?: boolean;
  /** Class applied to the field wrapper (vs `className`, applied to the `<select>`). */
  containerClassName?: string;
  /**
   * Render a bare `<select>` with only the supplied `className` — skips the field
   * chrome (wrapper, label, chevron, error).
   */
  unstyled?: boolean;
  /** `<option>` elements. */
  children: ReactNode;
}

/**
 * Native `<select>` styled to match `Input`'s field chrome. Forwards its ref and
 * all native props, so it drops straight into React Hook Form via `{...register("subject")}`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    requiredMark,
    containerClassName,
    className,
    unstyled = false,
    id,
    children,
    ...props
  },
  ref,
) {
  const autoId = useId();

  if (unstyled) {
    return (
      <select ref={ref} id={id} className={className} {...props}>
        {children}
      </select>
    );
  }

  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={fieldId} required={requiredMark}>
          {label}
        </Label>
      )}
      <div
        className={cn(
          "border-hairline bg-surface flex h-13 items-center gap-2.5 rounded-xl border-[1.5px] px-4",
          "focus-within:border-violet focus-within:ring-lavender transition-shadow focus-within:ring-2",
          error && "border-danger focus-within:border-danger focus-within:ring-danger-tint",
          containerClassName,
        )}
      >
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "text-ink min-w-0 flex-1 appearance-none bg-transparent text-[15px] outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="text-faint h-4 w-4 shrink-0" aria-hidden />
      </div>
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : hint ? (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
