"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Check, Link2, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/Button";

/** "Invite friends" share sheet with functional share targets. */
export function InviteView() {
  const t = useTranslations("features_profile_components_InviteView");
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const message = t("shareMessage", { name: SITE.name, url });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const shareOthers = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SITE.name, text: message, url });
      } catch {
        /* dismissed */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 md:pb-12">
      <h1 className="mt-6 text-4xl leading-tight font-bold">{t("title", { name: SITE.name })}</h1>
      <p className="text-muted mt-4 text-lg">{t("subtitle")}</p>

      <p className="text-muted mt-10 text-xs font-bold tracking-wide uppercase">{t("inviteVia")}</p>

      <div className="mt-3 space-y-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-3 rounded-full text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>

        <a
          href={`sms:?&body=${encodeURIComponent(message)}`}
          className="flex h-14 items-center justify-center gap-3 rounded-full text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ backgroundColor: "#2f6fed" }}
        >
          <Send className="h-5 w-5" />
          {t("textMessage")}
        </a>

        <div className="grid grid-cols-2 gap-3">
          <Button
            unstyled
            type="button"
            onClick={copyLink}
            className="bg-ink flex h-14 items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
            {copied ? t("copied") : t("copyLink")}
          </Button>
          <Button
            unstyled
            type="button"
            onClick={shareOthers}
            className="bg-ink flex h-14 items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <MoreHorizontal className="h-5 w-5" />
            {t("others")}
          </Button>
        </div>
      </div>
    </div>
  );
}
