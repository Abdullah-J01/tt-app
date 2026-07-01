# Mobile packaging (iOS + Android)

The mobile apps are the web app wrapped with **Capacitor**. There are two ways
to run it; pick per your needs.

## Option A — Static export (recommended for MVP)

Ship the client app as static files inside the native shell; it calls your
hosted API/DB over HTTPS.

1. In `next.config.mjs`, enable:
   ```js
   output: "export",
   images: { unoptimized: true },
   ```
   Note: with static export, **API routes and server-rendered pages are not
   bundled** into the app — host them separately (e.g. the same Next.js app
   deployed on the web) and call them from the client.

2. Add native platforms (first time only):
   ```bash
   npm install
   npx cap add ios
   npx cap add android
   ```

3. Build + sync + open:
   ```bash
   npm run cap:sync      # next build → copies out/ into native projects
   npm run cap:ios       # opens Xcode
   npm run cap:android   # opens Android Studio
   ```

## Option B — Load the hosted URL

Point Capacitor at your deployed URL (`server.url` in `capacitor.config.ts`).
Keeps full SSR/API, but the shell requires connectivity and app-store review may
scrutinize a thin wrapper. Good for internal testing.

## App-store notes

- Add real icons/splash (see `public/icons/README.md`); generate with
  `@capacitor/assets`.
- Add native **push** and a proper offline shell before submission — Apple/Google
  scrutinize wrapped web apps (see MVP Plan §6 trade-offs).
- Bundle ID is `ee.taskutark.studybooks` (change in `capacitor.config.ts`).
