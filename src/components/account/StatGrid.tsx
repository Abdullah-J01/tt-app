import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export interface Stat {
  label: string;
  value: number | string;
  /** Highlight the value in amber (e.g. the streak counter). */
  accent?: boolean;
}

/** Row of simple counters — cards learned, streak, completed (UI brief §6.7). */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <Card className="flex p-0">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-4",
            i > 0 && "border-l border-hairline",
          )}
        >
          <span
            className={cn("font-display text-2xl font-bold", s.accent ? "text-amber" : "text-ink")}
          >
            {s.value}
          </span>
          <span className="px-1 text-center text-[11px] text-muted">{s.label}</span>
        </div>
      ))}
    </Card>
  );
}
