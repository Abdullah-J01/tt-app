import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FieldErrorProps {
  /** Id to associate with the field via `aria-describedby`. */
  id?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Consistent inline validation error. Renders nothing when there's no message,
 * so it can be dropped under any field unconditionally.
 */
export function FieldError({ id, className, children }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={cn("text-danger text-xs", className)}>
      {children}
    </p>
  );
}
