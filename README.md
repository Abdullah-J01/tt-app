# StudyBooks

**Bite-sized, TikTok-style learning from studybooks.** Users scroll a vertical
feed of short learning cards drawn from studybooks, save what matters, and build
a daily habit. Cross-platform: mobile web, desktop, iOS and Android, plus a
marketing landing page.

- Interaction model inspired by **Deepstash** (vertical card feed, save-to-library).
- Visual language + catalog inspired by **TaskuTark** (`taskutark.ee`).

This repo is the **MVP scaffold** — a runnable foundation for the team to build on.

---

## Quickstart

```bash
nvm use            # Node 22
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
```

Data comes from the **TaskuTark (TT) backend** — this app owns no database.
Until `TT_API_BASE_URL` is set, it runs on local mock data, so it works out of
the box. The endpoints TT needs to expose are specified in
**[docs/TT_API_ENDPOINTS.md](./docs/TT_API_ENDPOINTS.md)**.

Full setup: **[docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)**.

---

## Tech stack

| Concern      | Choice                                       |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19)            |
| Styling      | Tailwind CSS v4 — tokens in `globals.css`    |
| Server state | TanStack Query · **Client state** Zustand    |
| Auth         | NextAuth / Auth.js                           |
| Data         | **TaskuTark REST API** (no own DB)           |
| Payments     | Stripe                                       |
| Mobile       | Capacitor 8 (iOS + Android)                  |
| Icons        | lucide-react · **Validation** Zod            |

Why this stack: fastest, lowest-cost path to all platforms from one codebase.
Rationale + trade-offs in the MVP Plan §6 and **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**.

---

## Scripts

| Command             | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start the dev server                    |
| `npm run build`     | Production build                        |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm run lint`      | ESLint                                  |
| `npm run format`    | Prettier write                          |
| `npm run cap:sync`  | Build + sync native apps                |

---

## Project structure

Overview: **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)**. In short:
`src/app` (routes), `src/components` (`ui` / `layout` / `feed`), `src/lib`
(data, auth, stripe), `prisma` (schema + seed), `docs` (this).

---

## What's included vs. still to do

**Scaffolded and working:**

- ✅ All MVP screens as routes: landing, onboarding, auth, feed, reader, explore,
  studybook detail, library, profile, admin.
- ✅ The core **vertical card feed** with action rail + snap scrolling.
- ✅ Design system matched to TaskuTark (tokens, Button/Chip/Pill/Card, nav).
- ✅ Typed **TT API client** (`src/lib/tt-api.ts`) + data layer with mock fallback; NextAuth + Stripe stubs.
- ✅ Capacitor + PWA config; CI (typecheck/lint/build); ESLint/Prettier/TS strict.

**Intentional TODOs (marked `TODO(team)` in code):**

- ⬜ Point `TT_API_BASE_URL` at TT and confirm the endpoint contract (`docs/TT_API_ENDPOINTS.md`).
- ⬜ Wire auth (confirm TT auth vs. our own) and gate `(app)`.
- ⬜ Feed scroll tracking, progress saving, and personalized ordering.
- ⬜ Save/like/share persistence; streak logic; Stripe checkout + webhook.
- ⬜ Real icons/splash and app-store hardening (see MOBILE_PACKAGING.md).

---

## Documentation

- **[UI design brief](./docs/UI_DESIGN_BRIEF.md)** — visual system + screen-by-screen spec (hand this to design).
- **[TT API endpoints](./docs/TT_API_ENDPOINTS.md)** — the data endpoints TT needs to expose (hand this to TT).
- **[MVP plan](./docs/StudyBooks_MVP_Plan.docx)** — features, scope, timeline.
- [Getting started](./docs/GETTING_STARTED.md) · [Architecture](./docs/ARCHITECTURE.md) · [Project structure](./docs/PROJECT_STRUCTURE.md) · [Mobile packaging](./docs/MOBILE_PACKAGING.md) · [Contributing](./docs/CONTRIBUTING.md)

> Section references like "§4" throughout the code point to the UI design brief.
