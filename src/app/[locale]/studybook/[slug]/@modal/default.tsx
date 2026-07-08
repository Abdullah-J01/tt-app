/**
 * Fallback for the `@modal` slot when no modal is active (e.g. on the plain
 * detail page, or on a hard load of /read where the intercept doesn't apply).
 */
export default function ModalDefault() {
  return null;
}
