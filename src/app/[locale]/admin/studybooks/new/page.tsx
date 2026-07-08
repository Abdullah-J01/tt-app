import type { Metadata } from "next";
import { getTranslations } from "@/i18n/server";
import { StudybookForm } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app_admin_studybooks_new_page");
  return { title: t("metaTitle") };
}

/** Create a studybook. Cards are added on the edit screen after creation. */
export default async function NewStudybookPage() {
  const t = await getTranslations("app_admin_studybooks_new_page");
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-ink text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <StudybookForm />
    </div>
  );
}
