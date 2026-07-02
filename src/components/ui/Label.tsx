import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends a danger asterisk after the text (purely visual — validation is Zod-driven). */
  required?: boolean;
  children: ReactNode;
}

/**
 * Form field label. Pairs with any field via `htmlFor`/`id`. Matches the design
 * system's field label styling so it stays consistent across every form.
 */
export function Label({ required = false, className, children, ...props }: LabelProps) {
  return (
    <label className={cn("text-ink text-sm font-medium", className)} {...props}>
      {children}
      {required && (
        <span className="text-danger ml-0.5" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}
