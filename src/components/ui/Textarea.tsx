import { cn } from "@/lib/utils";
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label. Associated via `htmlFor`/`id` (auto-generated when `id` is omitted). */
  label?: string;
  /** Helper text under the field. */
  hint?: string;
  /** Error message — shown in danger color and sets `aria-invalid`. */
  error?: string;
  /** Renders a danger asterisk after the label (visual only — validation is Zod-driven). */
  requiredMark?: boolean;
  /** Class applied to the field wrapper (vs `className`, applied to the `<textarea>`). */
  containerClassName?: string;
  /**
   * Render a bare `<textarea>` with only the supplied `className` — skips the field
   * chrome (wrapper, label, error). Use it to route a fully custom textarea through
   * this component unchanged.
   */
  unstyled?: boolean;
}

/**
 * Multi-line counterpart to `Input`. Forwards its ref and all native props, so it
 * drops straight into React Hook Form via `{...register("message")}`.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    requiredMark,
    containerClassName,
    className,
    unstyled = false,
    id,
    ...props
  },
  ref,
) {
  const autoId = useId();

  if (unstyled) {
    return <textarea ref={ref} id={id} className={className} {...props} />;
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
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "border-hairline bg-surface text-ink placeholder:text-muted min-h-24 rounded-xl border-[1.5px] px-4 py-3 text-[15px] outline-none",
          "focus:border-violet focus:ring-lavender transition-shadow focus:ring-2",
          error && "border-danger focus:border-danger focus:ring-danger-tint",
          containerClassName,
          className,
        )}
        {...props}
      />
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
