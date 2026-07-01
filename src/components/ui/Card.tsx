import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Generic white surface card with soft shadow + hairline border. */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-hairline bg-surface p-4 shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
