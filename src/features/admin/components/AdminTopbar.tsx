import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Pill } from "@/components/ui/Pill";
import { AdminLogoutButton } from "./AdminLogoutButton";

interface AdminTopbarProps {
  /** Display name of the signed-in admin. */
  userName?: string | null;
}

/** Slim CMS header: brand + CMS badge on the left, session info + exit on the right. */
export async function AdminTopbar({ userName }: AdminTopbarProps) {
  const t = await getTranslations("features_admin_components_AdminTopbar");
  return (
    <header className="border-hairline bg-surface border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3 max-sm:gap-2">
          <Logo href="/admin" className="h-6" />
          <Pill variant="solid" className="max-sm:hidden">
            CMS
          </Pill>
        </div>
        <div className="flex items-center gap-4 max-sm:gap-1">
          {userName && (
            <span className="text-muted text-sm whitespace-nowrap max-md:hidden">
              {t.rich("signedInAs", {
                name: (chunks) => <span className="text-ink font-medium">{chunks}</span>,
                value: userName,
              })}
            </span>
          )}
          <Link
            href="/feed"
            className="text-violet hover:bg-lavender flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors"
          >
            {t("viewApp")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
