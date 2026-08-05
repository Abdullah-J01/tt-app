export const SITE = {
  name: "TaskuTark",
  tagline: "Learn something new in the time it takes to scroll.",
  description:
    "Bite-sized, TikTok-style learning from TaskuTark. Swipe through short cards, save what matters, build a daily habit.",
  /** Primary app navigation (mobile bottom tabs / desktop top nav). */
  // UI-cleanup test: Feed and Library are hidden from all navigation for now —
  // uncomment to bring their tabs/links back everywhere at once.
  nav: [
    { href: "/home", label: "Home" },
    // { href: "/feed", label: "Feed" },
    { href: "/explore", label: "Explore" },
    // { href: "/library", label: "Library" },
  ],
} as const;
