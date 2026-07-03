"use client";

import { ActionRail } from "./ActionRail";

interface SideActionsProps {
  /** Active card id — keys the persisted like/save state on the rail. */
  id: string;
  /** Title used for the native share sheet. */
  shareTitle?: string;
}

/**
 * Feed action rail placement. The icons themselves come from the shared
 * <ActionRail/> (Save / Like / Share) so the Like heart, its burst animation and
 * persisted state stay consistent with the rest of the app — no duplicate icons.
 *
 * Mobile/tablet: overlaid inside the card (bottom-right).
 * Desktop (lg+): moved outside the card to its right via left-full + margin.
 */
export default function SideActions({ id, shareTitle }: SideActionsProps) {
  return (
    <div className="absolute right-3 bottom-24 z-20 sm:right-4 sm:bottom-28 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-full lg:ml-5 lg:-translate-y-1/2">
      {/* On desktop (lg+) the rail sits outside the card on a white background, so
          the counts turn dark to stay readable; the icons stay white on every
          screen (the dark translucent circle gives them contrast). */}
      <ActionRail id={id} shareTitle={shareTitle} labelClassName="lg:text-ink" />
    </div>
  );
}
