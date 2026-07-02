import { ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";

/** Violet-gradient upsell banner linking to the paywall (UI brief §6.7 / §6.9). */
export function PremiumBanner() {
  return (
    // TODO(team): link to the /premium paywall
    <Button
      unstyled
      type="button"
      className="rounded-card from-violet to-violet-dark flex w-full items-center gap-3.5 bg-gradient-to-br p-4 text-left text-white transition-opacity hover:opacity-95"
    >
      <IconBadge icon={<Crown />} className="bg-white/20 text-white" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-semibold">Go Premium</p>
        <p className="text-xs text-white/85">Unlock every studybook &amp; offline.</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
    </Button>
  );
}
