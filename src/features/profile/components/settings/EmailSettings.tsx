"use client";

import { useState } from "react";
import { List, Row, Toggle } from "./ui";
import { SITE } from "@/config/site";

const ITEMS = [
  { id: "daily", title: "Daily Recommendations", subtitle: "Recommended stories and impactful ideas" },
  { id: "weekly", title: "Weekly Progress", subtitle: "Review of your reading habits and stashed ideas" },
  {
    id: "product",
    title: "Product Announcements",
    subtitle: `New features to upgrade your ${SITE.name} experience`,
  },
];

export function EmailSettings() {
  const [on, setOn] = useState<Record<string, boolean>>({ daily: true, weekly: true, product: true });

  return (
    <List>
      {ITEMS.map((it) => (
        <Row
          key={it.id}
          title={it.title}
          subtitle={it.subtitle}
          right={
            <Toggle
              checked={!!on[it.id]}
              onChange={(v) => setOn((s) => ({ ...s, [it.id]: v }))}
              label={it.title}
            />
          }
        />
      ))}
    </List>
  );
}
