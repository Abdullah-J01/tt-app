"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { OfflineModal } from "@/components/network/OfflineModal";
import { checkReachability, useNetworkStatus } from "@/hooks/useNetworkStatus";

interface NetworkContextValue {
  /** Whether the device currently has a working connection. */
  isOnline: boolean;
  /** True while a reachability probe (Retry / reconnect) is in flight. */
  isReconnecting: boolean;
  /** The URL a blocked navigation was heading to, if any. */
  pendingNavigation: string | null;
  setPendingNavigation: (url: string | null) => void;
  /** Probe the network; on success, resume the pending navigation. */
  retry: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/** Access network state from any client component. */
export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used within <NetworkProvider>");
  return ctx;
}

/** Is this route already in the SW cache (visited HTML or RSC payload)? */
async function isRouteCached(url: URL): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const cache = await caches.open("pages-cache");
    const match =
      (await cache.match(url.href, { ignoreSearch: true })) ??
      (await cache.match(url.pathname, { ignoreSearch: true }));
    return Boolean(match);
  } catch {
    return false;
  }
}

/** Should this click be treated as an in-app navigation we can intercept? */
function eligibleAnchor(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented) return null;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null;
  const anchor = (event.target as Element | null)?.closest("a");
  if (!anchor) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return null;
  if (anchor.hasAttribute("download") || anchor.target === "_blank") return null;
  if (anchor.getAttribute("rel")?.includes("external")) return null;
  return anchor;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isOnline, reconnected } = useNetworkStatus();

  const [showModal, setShowModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Refs so the global click listener always sees fresh values without re-binding.
  const isOnlineRef = useRef(isOnline);
  const pendingRef = useRef<string | null>(null);
  const showModalRef = useRef(false);
  isOnlineRef.current = isOnline;
  pendingRef.current = pendingNavigation;
  showModalRef.current = showModal;

  const resumePending = useCallback(() => {
    setShowModal(false);
    const target = pendingRef.current;
    setPendingNavigation(null);
    if (target) {
      const url = new URL(target);
      router.push(url.pathname + url.search + url.hash);
    } else {
      // Scenario 5: refresh possibly-stale content after reconnecting.
      router.refresh();
    }
  }, [router]);

  const retry = useCallback(async () => {
    setIsReconnecting(true);
    const ok = await checkReachability();
    setIsReconnecting(false);
    if (ok) resumePending();
  }, [resumePending]);

  // Scenario 5: when the OS reports we're back online while the modal is up,
  // auto-retry the blocked navigation and dismiss the modal.
  useEffect(() => {
    if (isOnline && showModalRef.current) resumePending();
  }, [isOnline, reconnected, resumePending]);

  // Intercept in-app navigation while offline (Scenario 3 + 4).
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isOnlineRef.current) return; // online → let Next navigate normally
      const anchor = eligibleAnchor(event);
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // external → don't block

      // Offline: block the default now (sync), then decide from the cache (async).
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        if (await isRouteCached(url)) {
          // Scenario 3: cached → navigate, SW serves it with no network.
          router.push(url.pathname + url.search + url.hash);
        } else {
          // Scenario 4: uncached → stay put, open the offline modal.
          setPendingNavigation(url.href);
          setShowModal(true);
        }
      })();
    };

    // Capture phase so we run before Next's own Link handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPendingNavigation(null);
  }, []);

  return (
    <NetworkContext.Provider
      value={{ isOnline, isReconnecting, pendingNavigation, setPendingNavigation, retry }}
    >
      {children}
      <OfflineModal
        open={showModal}
        isReconnecting={isReconnecting}
        onRetry={retry}
        onClose={closeModal}
      />
    </NetworkContext.Provider>
  );
}
