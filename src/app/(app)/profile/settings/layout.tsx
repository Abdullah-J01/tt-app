import { Container } from "@/components/ui";

/**
 * Shared container for the settings screens (the list and each detail section).
 * Holds the narrow, centred column so every page only renders its own heading +
 * content — the width/padding lives in one place.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <Container className="max-w-2xl pb-24 md:pb-12">{children}</Container>;
}
