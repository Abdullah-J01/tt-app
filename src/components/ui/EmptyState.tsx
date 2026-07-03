import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { IconBadge } from "./IconBadge";

interface EmptyStateProps {
  /** Optional decorative icon shown in a grey badge. */
  icon?: ReactNode;
  title: string;
  /** One-line explanation or next step. */
  description?: string;
  /** Optional CTA (e.g. a "New studybook" button or a "Clear filters" link). */
  action?: ReactNode;
  className?: string;
}

/** Centered empty / no-results state for lists, tables and rails. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}>
      {icon && <IconBadge icon={icon} size="lg" />}
      <div className="flex flex-col gap-1">
        <h3 className="text-ink font-semibold">{title}</h3>
        {description && <p className="text-muted max-w-sm text-sm">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
