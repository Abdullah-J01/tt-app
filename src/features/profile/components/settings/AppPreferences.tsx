"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { List, Row, Toggle, ValueChip } from "./ui";
import { Button } from "@/components/ui/Button";

const THEMES = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
const SPEEDS = ["0.5x", "1x", "1.5x", "2x"];

export function AppPreferences() {
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
      <h2 className="text-lg font-bold">Appearance</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 pb-4">
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <Button
              unstyled
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-2xl border-2 p-3 transition-colors",
                active ? "border-violet bg-lavender/40" : "hover:bg-lavender/30 border-transparent",
              )}
            >
              <ThemeMock variant={t.id} />
              <span className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold">
                {active && <Check className="text-violet h-4 w-4" />}
                {t.label}
              </span>
            </Button>
          );
        })}
      </div>

      <List>
        <Row
          title="Dark OLED Theme"
          subtitle="Use a very dark theme when choosing dark mode or when system settings detect dark mode"
          right={<Toggle checked={oled} onChange={setOled} label="Dark OLED theme" />}
        />
        <Row
          title="Reading Animation"
          subtitle="Enable the background curtain animation while reading"
          right={
            <Toggle checked={readingAnim} onChange={setReadingAnim} label="Reading animation" />
          }
        />
        <Row
          title="Sounds"
          subtitle="Enable in-app sounds"
          right={<Toggle checked={sounds} onChange={setSounds} label="Sounds" />}
        />
        <Row
          title="Vibrations"
          subtitle="Enable vibrations for main actions"
          right={<Toggle checked={vibrations} onChange={setVibrations} label="Vibrations" />}
        />
        <Row
          title="Automatic Scroll"
          subtitle="Scroll to the first unread idea"
          right={<Toggle checked={autoScroll} onChange={setAutoScroll} label="Automatic scroll" />}
        />
        <Row
          title="Show Screenshot drawer"
          subtitle="Show a drawer with share options after taking a screenshot."
          right={
            <Toggle checked={screenshot} onChange={setScreenshot} label="Show screenshot drawer" />
          }
        />
        <Row
          title="Reading Speed"
          subtitle="Change the speed of the reading animation"
          right={
            <ValueChip onClick={() => setReadIdx((i) => (i + 1) % SPEEDS.length)}>
              {SPEEDS[readIdx]}
            </ValueChip>
          }
        />
        <Row
          title="Listening Speed"
          subtitle="Change the playback rate for audio"
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
