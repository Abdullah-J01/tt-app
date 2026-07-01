"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { List, Row, Toggle, ValueChip } from "./ui";

const TIMES = ["7 AM", "8 AM", "9 AM", "10 AM", "6 PM"];

export function NotificationsSettings() {
  const [content, setContent] = useState(true);
  const [streak, setStreak] = useState(true);
  const [timeIdx, setTimeIdx] = useState(2);
  const time = TIMES[timeIdx]!;

  return (
    <List>
      {/* Content Recommendations */}
      <div className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink">Content Recommendations</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Daily and weekly ideas curated for you plus a few exceptional suggestions from our team
            </p>
          </div>
          <Toggle checked={content} onChange={setContent} label="Content recommendations" />
        </div>
        {content && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              You get new content at <span className="font-bold text-ink">{time}</span> daily.
            </p>
            <ValueChip onClick={() => setTimeIdx((i) => (i + 1) % TIMES.length)}>{time}</ValueChip>
          </div>
        )}
      </div>

      <Row
        title="Streak & Reading Habit"
        subtitle="Keep your streak going and win weekly reading challenges"
        right={<Toggle checked={streak} onChange={setStreak} label="Streak & reading habit" />}
      />

      <Link
        href="#"
        className="flex items-center justify-between py-4 transition-colors hover:text-violet"
      >
        <span className="text-lg font-bold">Open device settings</span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    </List>
  );
}
