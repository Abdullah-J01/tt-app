import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FormErrorProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Form-level error banner — for failures that belong to the whole submission
 * rather than one field ("Incorrect email or password", "That email is taken").
 * Use `FieldError` for per-field validation.
 *
 * Renders nothing when there's no message, so it can sit above any form
 * unconditionally. `role="alert"` announces it when it appears, which matters
 * because it shows up after an async submit rather than on render.
 */
export function FormError({ className, children }: FormErrorProps) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        "bg-danger-tint text-danger rounded-xl px-3 py-2 text-center text-[13px] font-medium",
        className,
      )}
    >
      {children}
    </p>
  );
}
