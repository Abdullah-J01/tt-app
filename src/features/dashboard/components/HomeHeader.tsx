"use client";

import type { ReactNode } from "react";
import { Bookmark, Flame, PlayCircle } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { useAppSelector } from "@/store/hooks";
import { useStreak } from "@/features/streak";
import { cn } from "@/lib/utils";

interface HomeHeaderProps {
  inProgress: number;
  saved: number;
  /** Client stores still hydrating — stats render as placeholders. */
  loading?: boolean;
}

function StatChip({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-hairline bg-surface text-ink inline-flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-3 text-sm font-medium tabular-nums",
        className,
      )}
    >
      <span className="text-violet [&_svg]:h-4 [&_svg]:w-4" aria-hidden>
        {icon}
      </span>
      {label}
    </span>
  );
}

/**
 * Greeting + at-a-glance stats. The name comes from the auth slice and the
 * counts from client stores, so both are gated on `loading` — a returning user
 * must never see a flash of "0 saved" before hydration lands.
 */
export function HomeHeader({ inProgress, saved, loading }: HomeHeaderProps) {
  const t = useTranslations("app_app_home_page");
  const user = useAppSelector((s) => s.auth.user);
  const { streak } = useStreak();

  // Accounts created with an email as their display name are common here, and
  // "Welcome back, someone@example.com" wraps to two lines and reads as a bug.
  const rawName = user?.name?.trim() ?? "";
  const candidate = (rawName.includes("@") ? rawName.split("@")[0] : rawName.split(/\s+/)[0]) ?? "";
  const firstName = candidate.length > 24 ? "" : candidate;

  return (
    <header>
      <h1 className="text-ink font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {firstName ? t("greetingNamed", { name: firstName }) : t("greeting")}
      </h1>
      <p className="text-muted mt-1 text-sm sm:text-base">{t("subtitle")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {loading ? (
          <>
            <span className="bg-mist h-8 w-28 animate-pulse rounded-full" aria-hidden />
            <span className="bg-mist h-8 w-24 animate-pulse rounded-full" aria-hidden />
          </>
        ) : (
          <>
            <StatChip
              icon={<Flame />}
              label={t("statStreak", { count: streak })}
              className="bg-amber-tint text-amber-dark [&_svg]:text-amber-dark border-transparent"
            />
            {inProgress > 0 && (
              <StatChip icon={<PlayCircle />} label={t("statInProgress", { count: inProgress })} />
            )}
            {saved > 0 && <StatChip icon={<Bookmark />} label={t("statSaved", { count: saved })} />}
          </>
        )}
      </div>
    </header>
  );
}
