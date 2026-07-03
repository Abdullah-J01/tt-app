/**
 * Layout for a studybook route. Renders the normal page (`children`) plus a
 * parallel `@modal` slot. The slot is what lets the reader open as an overlay
 * on top of the detail page (via the intercepting route `@modal/(.)read`) so the
 * detail page stays mounted and dimmed behind it — same feel as the Preview.
 */
export default function StudybookLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
