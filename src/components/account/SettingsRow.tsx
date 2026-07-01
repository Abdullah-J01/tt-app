import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** Optional trailing value, e.g. the current language. */
  value?: string;
  /** Render as a link when provided; otherwise a button. */
  href?: string;
  onClick?: () => void;
  /** Destructive styling (e.g. Log out) — red, no chevron. */
  danger?: boolean;
}

/** One row in a settings list — icon + label + optional value/chevron (UI brief §6.7). */
export function SettingsRow({ icon: Icon, label, value, href, onClick, danger }: SettingsRowProps) {
  const className = cn(
    "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors",
    danger ? "hover:bg-danger-tint" : "hover:bg-lavender/60",
  );

  const content = (
    <>
      <Icon className={cn("h-5 w-5 shrink-0", danger ? "text-danger" : "text-muted")} aria-hidden />
      <span className={cn("text-sm font-medium", danger ? "text-danger" : "text-ink")}>{label}</span>
      {value && <span className="ml-auto text-sm text-muted">{value}</span>}
      {!danger && (
        <ChevronRight
          className={cn("h-5 w-5 shrink-0 text-faint", value ? "ml-2" : "ml-auto")}
          aria-hidden
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
