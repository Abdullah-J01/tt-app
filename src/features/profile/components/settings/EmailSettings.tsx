"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { List, Row, Toggle } from "./ui";
import { SITE } from "@/config/site";

const ITEMS = [{ id: "daily" }, { id: "weekly" }, { id: "product" }];

export function EmailSettings() {
  const t = useTranslations("features_profile_components_settings_EmailSettings");
  const [on, setOn] = useState<Record<string, boolean>>({ daily: true, weekly: true, product: true });

  return (
    <List>
      {ITEMS.map((it) => {
        const title = t(`${it.id}Title`);
        return (
          <Row
            key={it.id}
            title={title}
            subtitle={t(`${it.id}Subtitle`, { name: SITE.name })}
            right={
              <Toggle
                checked={!!on[it.id]}
                onChange={(v) => setOn((s) => ({ ...s, [it.id]: v }))}
                label={title}
              />
            }
          />
        );
      })}
    </List>
  );
}
