"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";

/**
 * Custom PWA install prompt.
 *
 * - Android/Chromium: captures the `beforeinstallprompt` event and shows our own
 *   button so we control when/where it appears (browsers no longer auto-show it).
 * - iOS Safari: no such event exists, so we surface a short "Add to Home Screen"
 *   hint instead.
 * - Hidden when already installed (standalone display-mode) or running inside the
 *   Capacitor native shell, where there is nothing to install.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isCapacitor() {
  return typeof window !== "undefined" && "Capacitor" in window;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const t = useTranslations("components_pwa_InstallPrompt");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || isCapacitor()) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS never fires the event; show a manual hint after a short delay.
    if (isIos()) {
      const t = setTimeout(() => setShowIosHint(true), 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    const onInstalled = () => setDeferred(null);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (!deferred && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-20 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4 dark:border-white/10 dark:bg-neutral-900/95"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{t("title")}</p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {showIosHint ? t("iosHint") : t("addToHome")}
        </p>
      </div>
      {deferred && (
        <button
          onClick={install}
          className="shrink-0 rounded-full bg-[#6c4ce3] px-4 py-2 text-sm font-semibold text-white"
        >
          {t("install")}
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="shrink-0 rounded-full p-2 text-neutral-400 hover:text-neutral-600"
      >
        ✕
      </button>
    </div>
  );
}
