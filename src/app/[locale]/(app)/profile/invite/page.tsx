import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { InviteView } from "@/features/profile";
import { BackButton } from "@/components/layout/BackButton";
import { Container } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_app_profile_invite_page");
  return { title: t("metaTitle") };
}

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
