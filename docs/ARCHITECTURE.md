# Architecture

## Approach

One **Next.js** app (App Router) serves mobile web, desktop web, and the SEO
landing page. The same build is wrapped with **Capacitor** to ship native
iOS/Android apps. One codebase, every platform — the leanest path to the MVP
(see the MVP Plan, Section 6).

```
                    ┌─────────────────────────────┐
                    │        Next.js app          │
   Landing / SEO ──▶│  (App Router, RSC + API)    │◀── Mobile web + Desktop
                    │                             │
                    │  React 19 · Tailwind v4     │
                    └──────────────┬──────────────┘
                                   │ static export (out/)
                                   ▼
                         ┌───────────────────┐
                         │     Capacitor     │──▶ iOS (App Store)
                         │  native wrapper   │──▶ Android (Play Store)
                         └───────────────────┘

     Data:  TaskuTark REST API  (this app owns no database)
     Auth:  NextAuth (Auth.js)
     Pay:   Stripe
```

## Stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router, RSC)            |
| UI             | React 19, Tailwind CSS v4 (CSS tokens)  |
| Server state   | TanStack Query                          |
| Client state   | Zustand (light, e.g. feed UI)           |
| Auth           | NextAuth / Auth.js                      |
| Data source    | TaskuTark REST API (no own DB)          |
| Payments       | Stripe                                  |
| Mobile         | Capacitor 8 (iOS + Android)             |
| Icons          | lucide-react                            |
| Validation     | Zod                                     |

## Data flow / seams

- **UI → data:** pages call `src/lib/api.ts`, which delegates to
  `src/lib/tt-api.ts` (the TT REST client). It falls back to mock data when
  `TT_API_BASE_URL` is unset, so call sites never change.
- **Auth:** `src/lib/auth.ts` holds `authOptions` (stateless JWT, no DB). Confirm
  with TT whether users authenticate against TT — see docs/TT_API_ENDPOINTS.md §B.
- **Payments:** `src/lib/stripe.ts` + `src/app/api/stripe/checkout/route.ts`
  (add a webhook route to sync `Subscription`).

## Rendering

- Landing, catalog, and studybook detail are **server-rendered** for SEO.
- The card feed uses server components for content + small **client islands**
  (`ActionRail`, `BottomNav`) for interaction.

## Notes / decisions

- Design tokens live in `src/app/globals.css` under Tailwind v4 `@theme` — no
  `tailwind.config.js`. Tokens are matched to TaskuTark (see the UI brief §2).
- For Capacitor, enable `output: "export"` in `next.config.mjs`. API routes and
  server-only rendering must then be hosted separately (the app calls them over
  HTTPS). See MOBILE_PACKAGING.md for the trade-off.
