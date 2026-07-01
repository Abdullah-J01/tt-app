import type { Metadata } from "next";
import { InviteView } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";

export const metadata: Metadata = { title: "Invite Friends" };

export default function InvitePage() {
  return (
    <div>
      <div className="mx-auto max-w-lg px-4 pt-4">
        <BackButton fallbackHref="/profile" label="" />
      </div>
      <InviteView />
    </div>
  );
}
