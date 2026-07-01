import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the STATIC export of the web app into iOS/Android shells.
 * Flow (see docs/MOBILE_PACKAGING.md):
 *   1. Enable `output: "export"` in next.config.mjs
 *   2. npm run cap:sync   (next build → copies `out/` into native projects)
 *   3. npm run cap:ios / cap:android
 */
const config: CapacitorConfig = {
  appId: "ee.taskutark.studybooks",
  appName: "StudyBooks",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
