import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Label } from "./Label";
import { FieldError } from "./FieldError";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Field label. Associated via `htmlFor`/`id` (auto-generated when `id` is omitted). */
  label?: string;
  /** Helper text under the field. */
  hint?: string;
  /** Error message — shown in danger color and sets `aria-invalid`. */
  error?: string;
  /** Renders a danger asterisk after the label (visual only — validation is Zod-driven). */
  requiredMark?: boolean;
  /** Optional decorative adornment on the left (e.g. a mail icon). */
  leadingIcon?: ReactNode;
  /** Optional interactive node on the right (e.g. a password-visibility button). Caller-owned. */
  trailingIcon?: ReactNode;
  /** Class applied to the field wrapper (vs `className`, applied to the `<input>`). */
  containerClassName?: string;
  /**
   * Render a bare `<input>` with only the supplied `className` — skips the field
   * chrome (wrapper, label, icons, error). Use it to route a fully custom input
   * (search bars, inline-edits, file pickers) through this component unchanged.
   */
  unstyled?: boolean;
}

/**
 * Presentational text field for the whole app. Supports every native input
 * `type` (text, email, password, number, tel, url, …) and forwards its ref plus
 * all native props, so it drops straight into React Hook Form:
 *
 * @example
 * <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
 *
 * It's stateless and server-safe — behaviours like password visibility are
 * composed by the caller via `trailingIcon` (see `PasswordField`).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    requiredMark,
    leadingIcon,
    trailingIcon,
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
    return <input ref={ref} id={id} className={className} {...props} />;
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
        {leadingIcon && (
          <span className="text-muted flex shrink-0 [&_svg]:h-5 [&_svg]:w-5" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "text-ink placeholder:text-muted min-w-0 flex-1 bg-transparent text-[15px] outline-none",
            className,
          )}
          {...props}
        />
        {trailingIcon && <span className="flex shrink-0 items-center">{trailingIcon}</span>}
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
