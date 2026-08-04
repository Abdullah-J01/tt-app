"use client";

import type { ReactNode } from "react";
import { Bookmark, Flame, PlayCircle } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface HomeHeaderProps {
  /** Display name from the session; undefined until it resolves. */
  name?: string | null;
  streak: number;
  inProgress: number;
  saved: number;
  /** Personal data still resolving — greeting and stats render as placeholders. */
  loading?: boolean;
}

/**
 * A stat's lifecycle within one page load. `absent` is a stat that turned out
 * not to apply — its placeholder is already on screen, so it has to leave.
 */
type SlotState = "loading" | "present" | "absent";

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
 * One stat position, kept mounted from placeholder through to its final state.
 *
 * The rule that matters: **an `absent` slot keeps showing its placeholder while
 * it collapses — it never renders the chip.** Swapping the real chip in and
 * *then* animating it away flashes a stat you don't have (a play icon for
 * "in progress" on an account with nothing in progress) for the whole exit.
 * The placeholder was never a claim about the data, so it's the honest thing to
 * shrink away. Only `present` ever gets the chip, and it can enter as itself.
 *
 * `grid-cols-[1fr] → [0fr]` collapses the slot from its exact content width to
 * zero, which a `max-width` transition can't do without a hard-coded guess. The
 * trailing gap lives *inside* the collapsing cell so it goes with it; a flex
 * `gap` on the row would survive as a stranded hole.
 */
function StatSlot({
  state,
  placeholderWidth,
  children,
}: {
  state: SlotState;
  placeholderWidth: string;
  children: ReactNode;
}) {
  const open = state !== "absent";
  return (
    <span
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-columns,opacity] duration-300 ease-out motion-reduce:transition-none",
        open ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0",
      )}
    >
      <span className="min-w-0 overflow-hidden">
        <span className="block pr-2 whitespace-nowrap">
          {state === "present" ? (
            children
          ) : (
            /* Pulses only while genuinely loading — a placeholder that keeps
               pulsing on the way out reads as data still arriving. */
            <span
              className={cn(
                // 34px = StatChip's exact box (py-1.5 + text-sm's 20px line +
                // 1px border each side), so the row doesn't resize on reveal.
                "bg-mist block h-[34px] rounded-full",
                placeholderWidth,
                state === "loading" && "motion-safe:animate-pulse",
              )}
              aria-hidden
            />
          )}
        </span>
      </span>
    </span>
  );
}

/**
 * Greeting + at-a-glance stats. Presentational: HomeView owns the data and the
 * single `loading` flag, so the header, the Continue row and the rails all flip
 * on the same commit instead of resolving one after another.
 *
 * The header deliberately stays mounted across that flip — it is the one part
 * of the page whose shape is known up front (a greeting and three stat slots),
 * so it can animate from placeholder to answer rather than being swapped out.
 */
export function HomeHeader({ name, streak, inProgress, saved, loading }: HomeHeaderProps) {
  const t = useTranslations("app_app_home_page");

  // Accounts created with an email as their display name are common here, and
  // "Welcome back, someone@example.com" wraps to two lines and reads as a bug.
  const rawName = name?.trim() ?? "";
  const candidate = (rawName.includes("@") ? rawName.split("@")[0] : rawName.split(/\s+/)[0]) ?? "";
  const firstName = candidate.length > 24 ? "" : candidate;

  /**
   * `placeholderWidth` sits near each chip's real width so the stats that stay
   * barely change size when their label lands. Exactness isn't reachable — the
   * labels are localized, and Estonian and Russian run longer than English.
   */
  const stats = [
    {
      key: "streak",
      show: true,
      icon: <Flame />,
      label: t("statStreak", { count: streak }),
      placeholderWidth: "w-32",
      className: "bg-amber-tint text-amber-dark [&_svg]:text-amber-dark border-transparent",
    },
    {
      key: "inProgress",
      show: inProgress > 0,
      icon: <PlayCircle />,
      label: t("statInProgress", { count: inProgress }),
      placeholderWidth: "w-28",
    },
    {
      key: "saved",
      show: saved > 0,
      icon: <Bookmark />,
      label: t("statSaved", { count: saved }),
      placeholderWidth: "w-24",
    },
  ];

  return (
    <header>
      {/* Fixed line box either way: the placeholder is exactly the h1's line
          height, so the subtitle and everything under it never move. */}
      {loading ? (
        <Skeleton className="h-8 w-56 rounded-full sm:h-9 sm:w-72" />
      ) : (
        <h1 className="anim-fade-in text-ink font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {firstName ? t("greetingNamed", { name: firstName }) : t("greeting")}
        </h1>
      )}
      <p className="text-muted mt-1 text-sm sm:text-base">{t("subtitle")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-y-2">
        {stats.map((stat) => (
          <StatSlot
            key={stat.key}
            state={loading ? "loading" : stat.show ? "present" : "absent"}
            placeholderWidth={stat.placeholderWidth}
          >
            <StatChip
              icon={stat.icon}
              label={stat.label}
              className={cn("anim-fade-in", stat.className)}
            />
          </StatSlot>
        ))}
      </div>
    </header>
  );
}
