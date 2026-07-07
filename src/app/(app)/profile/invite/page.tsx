import type { Metadata } from "next";
import { InviteView } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Invite Friends" };

export default function InvitePage() {
  return (
    <div>
      <Container className="max-w-lg pt-4">
        <BackButton fallbackHref="/profile" label="" />
      </Container>
      <InviteView />
    </div>
  );
}
