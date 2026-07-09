"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { List, Row, Toggle, ValueChip } from "./ui";
import { Button } from "@/components/ui/Button";

const THEMES = [{ id: "system" }, { id: "light" }, { id: "dark" }];
const SPEEDS = ["0.5x", "1x", "1.5x", "2x"];

export function AppPreferences() {
  const t = useTranslations("features_profile_components_settings_AppPreferences");
  const [theme, setTheme] = useState("system");
  const [oled, setOled] = useState(false);
  const [readingAnim, setReadingAnim] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [vibrations, setVibrations] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [screenshot, setScreenshot] = useState(true);
  const [readIdx, setReadIdx] = useState(1);
  const [listenIdx, setListenIdx] = useState(1);

  return (
    <div>
      <h2 className="text-lg font-bold">{t("appearance")}</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 pb-4">
        {THEMES.map((th) => {
          const active = theme === th.id;
          return (
            <Button
              unstyled
              key={th.id}
              type="button"
              onClick={() => setTheme(th.id)}
              className={cn(
                "rounded-2xl border-2 p-3 transition-colors",
                active ? "border-violet bg-lavender/40" : "hover:bg-lavender/30 border-transparent",
              )}
            >
              <ThemeMock variant={th.id} />
              <span className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold">
                {active && <Check className="text-violet h-4 w-4" />}
                {t(`theme_${th.id}`)}
              </span>
            </Button>
          );
        })}
      </div>

      <List>
        <Row
          title={t("oledTitle")}
          subtitle={t("oledSubtitle")}
          right={<Toggle checked={oled} onChange={setOled} label={t("oledTitle")} />}
        />
        <Row
          title={t("readingAnimTitle")}
          subtitle={t("readingAnimSubtitle")}
          right={
            <Toggle checked={readingAnim} onChange={setReadingAnim} label={t("readingAnimTitle")} />
          }
        />
        <Row
          title={t("soundsTitle")}
          subtitle={t("soundsSubtitle")}
          right={<Toggle checked={sounds} onChange={setSounds} label={t("soundsTitle")} />}
        />
        <Row
          title={t("vibrationsTitle")}
          subtitle={t("vibrationsSubtitle")}
          right={<Toggle checked={vibrations} onChange={setVibrations} label={t("vibrationsTitle")} />}
        />
        <Row
          title={t("autoScrollTitle")}
          subtitle={t("autoScrollSubtitle")}
          right={<Toggle checked={autoScroll} onChange={setAutoScroll} label={t("autoScrollTitle")} />}
        />
        <Row
          title={t("screenshotTitle")}
          subtitle={t("screenshotSubtitle")}
          right={
            <Toggle checked={screenshot} onChange={setScreenshot} label={t("screenshotTitle")} />
          }
        />
        <Row
          title={t("readSpeedTitle")}
          subtitle={t("readSpeedSubtitle")}
          right={
            <ValueChip onClick={() => setReadIdx((i) => (i + 1) % SPEEDS.length)}>
              {SPEEDS[readIdx]}
            </ValueChip>
          }
        />
        <Row
          title={t("listenSpeedTitle")}
          subtitle={t("listenSpeedSubtitle")}
          right={
            <ValueChip onClick={() => setListenIdx((i) => (i + 1) % SPEEDS.length)}>
              {SPEEDS[listenIdx]}
            </ValueChip>
          }
        />
      </List>
    </div>
  );
}

/** Mini phone mock with three colored content bars. */
function ThemeMock({ variant }: { variant: string }) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "border-hairline mx-auto flex aspect-[9/16] w-full max-w-[72px] flex-col gap-1.5 rounded-xl border p-2",
        dark && "bg-plum-1",
        variant === "light" && "bg-surface",
        variant === "system" && "from-surface to-plum-1 bg-gradient-to-br",
      )}
    >
      <span className="bg-amber/70 h-3 rounded" />
      <span className="bg-violet/50 h-3 rounded" />
      <span className="bg-brand-green/60 h-3 rounded" />
    </div>
  );
}
