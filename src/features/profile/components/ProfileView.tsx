"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Crown,
  Flame,
  Globe,
  LogOut,
  Pencil,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { useProfile } from "../useProfile";
import { PROFILE } from "../config";
import { Paywall } from "./Paywall";
import { StreakMoment } from "./StreakMoment";
import { Button } from "@/components/ui/Button";

const STATS = [
  { value: "428", label: "Cards learned" },
  { value: "7", label: "Day streak" },
  { value: "6", label: "Completed" },
];
const LANGS = ["English", "Estonian", "Russian"];

/** Profile home: identity, streak, stats, Premium upsell and shortcuts. */
export function ProfileView() {
  const router = useRouter();
  const { data, fullName } = useProfile();
  const [paywall, setPaywall] = useState(false);
  const [streak, setStreak] = useState(false);
  const [langIdx, setLangIdx] = useState(0);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/profile/settings"
          aria-label="Settings"
          className="bg-lavender text-ink hover:bg-violet/10 grid h-10 w-10 place-items-center rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      {/* Identity */}
      <div className="mt-6 flex items-center gap-4">
        {data.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="bg-lavender grid h-16 w-16 place-items-center rounded-full text-2xl">
            🙂
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold">{fullName}</h2>
          <p className="text-muted truncate text-sm">
            @{data.handle} · {PROFILE.grade}
          </p>
        </div>
        <Link
          href="/profile/settings/personal"
          aria-label="Edit profile"
          className="border-hairline text-ink hover:bg-lavender grid h-10 w-10 place-items-center rounded-full border"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      {/* Streak + plan */}
      <div className="mt-4 flex items-center gap-5 text-sm font-semibold">
        <Button
          unstyled
          type="button"
          onClick={() => setStreak(true)}
          className="text-amber flex items-center gap-1 hover:underline"
        >
          <Flame className="h-4 w-4" /> 7-day streak
        </Button>
        <span className="text-brand-green flex items-center gap-1">
          <BadgeCheck className="h-4 w-4" /> {PROFILE.plan}
        </span>
      </div>

      {/* Stats */}
      <div className="divide-hairline rounded-card border-hairline bg-surface mt-4 grid grid-cols-3 divide-x border py-4">
        {STATS.map((s) => (
          <div key={s.label} className="px-2 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-muted mt-0.5 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Go Premium */}
      <Button
        unstyled
        type="button"
        onClick={() => setPaywall(true)}
        className="hover-lift from-violet to-violet-dark mt-4 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r p-4 text-left text-white"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
          <Crown className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">Go Premium</span>
          <span className="block text-sm text-white/80">Unlock every studybook &amp; offline.</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Shortcuts */}
      <div className="divide-hairline border-hairline mt-6 divide-y border-t">
        <RowLink icon={User} label="Account" href="/profile/settings" />
        <RowLink icon={Bell} label="Notifications" href="/profile/settings/notifications" />
        <Button
          unstyled
          type="button"
          onClick={() => setLangIdx((i) => (i + 1) % LANGS.length)}
          className="flex w-full items-center gap-3 py-4 text-left"
        >
          <Globe className="text-ink h-5 w-5" />
          <span className="flex-1 font-medium">Language</span>
          <span className="text-violet text-sm font-semibold">{LANGS[langIdx]}</span>
          <ChevronRight className="text-muted h-5 w-5" />
        </Button>
        <Button
          unstyled
          type="button"
          onClick={() => router.push("/login")}
          className="flex w-full items-center gap-3 py-4 text-left text-red-600"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Log out</span>
        </Button>
      </div>

      <Paywall open={paywall} onClose={() => setPaywall(false)} />
      <StreakMoment open={streak} onClose={() => setStreak(false)} />
    </div>
  );
}

function RowLink({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 py-4">
      <Icon className="text-ink h-5 w-5" />
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="text-muted h-5 w-5" />
    </Link>
  );
}
