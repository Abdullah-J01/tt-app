"use client";

import { useState } from "react";
import Link from "@/i18n/Link";
import { useTranslations } from "@/i18n/client";
import { ChevronRight } from "lucide-react";
import { List, Row, Toggle, ValueChip } from "./ui";

const TIMES = ["7 AM", "8 AM", "9 AM", "10 AM", "6 PM"];

export function NotificationsSettings() {
  const t = useTranslations("features_profile_components_settings_NotificationsSettings");
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
            <p className="text-lg font-bold text-ink">{t("contentTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {t("contentDesc")}
            </p>
          </div>
          <Toggle checked={content} onChange={setContent} label={t("contentAria")} />
        </div>
        {content && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {t.rich("newContent", {
                time,
                b: (chunks) => <span className="font-bold text-ink">{chunks}</span>,
              })}
            </p>
            <ValueChip onClick={() => setTimeIdx((i) => (i + 1) % TIMES.length)}>{time}</ValueChip>
          </div>
        )}
      </div>

      <Row
        title={t("streakTitle")}
        subtitle={t("streakSubtitle")}
        right={<Toggle checked={streak} onChange={setStreak} label={t("streakAria")} />}
      />

      <Link
        href="#"
        className="flex items-center justify-between py-4 transition-colors hover:text-violet"
      >
        <span className="text-lg font-bold">{t("deviceSettings")}</span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    </List>
  );
}
