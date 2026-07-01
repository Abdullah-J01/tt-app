# Getting started

## Prerequisites

- Node.js **22** (`.nvmrc` provided — run `nvm use`)
- npm 10+
- Access to the TaskuTark (TT) API (optional to start — the app runs on mock data without it)
- Xcode (iOS) / Android Studio (Android) — only for mobile packaging

## 1. Install

```bash
npm install
cp .env.example .env   # then fill in values
```

## 2. Data (TaskuTark backend)

This app has **no database of its own** — it reads from the **TT backend**.

- Leave `TT_API_BASE_URL` empty (or set `USE_MOCK_DATA=1`) to run on local mock
  data — the app works immediately.
- Set `TT_API_BASE_URL` (and `TT_API_KEY` if required) in `.env` to hit TT.

The endpoints TT needs to expose are specified in
[TT_API_ENDPOINTS.md](./TT_API_ENDPOINTS.md); the client lives in `src/lib/tt-api.ts`.

## 3. Run the web app

```bash
npm run dev
# http://localhost:3000
```

Key routes: `/` (landing), `/onboarding`, `/login`, `/feed`, `/explore`,
`/studybook/a-very-serious-snowman-story`, `/library`, `/profile`, `/admin`.

## 4. Quality gates

```bash
npm run typecheck
npm run lint
npm run format
npm run build
```

## 5. Mobile (later)

See [MOBILE_PACKAGING.md](./MOBILE_PACKAGING.md).
