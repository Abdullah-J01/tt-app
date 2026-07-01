"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FOLLOWED = [
  { emoji: "💥", name: "Entrepreneurship" },
  { emoji: "🌱", name: "Personal Development" },
  { emoji: "📝", name: "Productivity" },
  { emoji: "⏰", name: "Time Management" },
];

const SUGGESTED = [
  { emoji: "⚕️", name: "Health" },
  { emoji: "💰", name: "Money & Investments" },
  { emoji: "❤️", name: "Love & Relationships" },
  { emoji: "🧠", name: "Psychology" },
  { emoji: "🏛️", name: "Philosophy" },
];

export function FollowedTopics() {
  const [following, setFollowing] = useState<Set<string>>(new Set(FOLLOWED.map((t) => t.name)));

  const toggle = (name: string) =>
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <div>
      <div className="divide-y divide-hairline">
        {FOLLOWED.map((t) => (
          <TopicRow key={t.name} {...t} following={following.has(t.name)} onToggle={() => toggle(t.name)} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">Suggested Topics</h2>
        <ChevronRight className="h-5 w-5 text-muted" />
      </div>
      <div className="mt-2 divide-y divide-hairline">
        {SUGGESTED.map((t) => (
          <TopicRow key={t.name} {...t} following={following.has(t.name)} onToggle={() => toggle(t.name)} />
        ))}
      </div>
    </div>
  );
}

function TopicRow({
  emoji,
  name,
  following,
  onToggle,
}: {
  emoji: string;
  name: string;
  following: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lavender text-xl">
        {emoji}
      </span>
      <span className="flex-1 font-semibold text-ink">{name}</span>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-semibold transition-colors active:scale-95",
          following
            ? "border border-hairline text-ink hover:bg-lavender"
            : "bg-ink text-white hover:bg-ink/90",
        )}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
