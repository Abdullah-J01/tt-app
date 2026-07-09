"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const FOLLOWED = [
  { emoji: "💥", name: "Entrepreneurship", slug: "entrepreneurship" },
  { emoji: "🌱", name: "Personal Development", slug: "personalDevelopment" },
  { emoji: "📝", name: "Productivity", slug: "productivity" },
  { emoji: "⏰", name: "Time Management", slug: "timeManagement" },
];

const SUGGESTED = [
  { emoji: "⚕️", name: "Health", slug: "health" },
  { emoji: "💰", name: "Money & Investments", slug: "money" },
  { emoji: "❤️", name: "Love & Relationships", slug: "love" },
  { emoji: "🧠", name: "Psychology", slug: "psychology" },
  { emoji: "🏛️", name: "Philosophy", slug: "philosophy" },
];

export function FollowedTopics() {
  const t = useTranslations("features_profile_components_settings_FollowedTopics");
  const [following, setFollowing] = useState<Set<string>>(
    new Set(FOLLOWED.map((topic) => topic.name)),
  );

  const toggle = (name: string) =>
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <div>
      <div className="divide-hairline divide-y">
        {FOLLOWED.map((topic) => (
          <TopicRow
            key={topic.name}
            emoji={topic.emoji}
            label={t(`topic_${topic.slug}`)}
            following={following.has(topic.name)}
            onToggle={() => toggle(topic.name)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("suggestedTitle")}</h2>
        <ChevronRight className="text-muted h-5 w-5" />
      </div>
      <div className="divide-hairline mt-2 divide-y">
        {SUGGESTED.map((topic) => (
          <TopicRow
            key={topic.name}
            emoji={topic.emoji}
            label={t(`topic_${topic.slug}`)}
            following={following.has(topic.name)}
            onToggle={() => toggle(topic.name)}
          />
        ))}
      </div>
    </div>
  );
}

function TopicRow({
  emoji,
  label,
  following,
  onToggle,
}: {
  emoji: string;
  label: string;
  following: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("features_profile_components_settings_FollowedTopics");
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="bg-lavender grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl">
        {emoji}
      </span>
      <span className="text-ink flex-1 font-semibold">{label}</span>
      <Button
        unstyled
        type="button"
        onClick={onToggle}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-semibold transition-colors active:scale-95",
          following
            ? "border-hairline text-ink hover:bg-lavender border"
            : "bg-ink hover:bg-ink/90 text-white",
        )}
      >
        {following ? t("following") : t("follow")}
      </Button>
    </div>
  );
}
