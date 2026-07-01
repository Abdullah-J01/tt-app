# Project structure

```
tt-app/
├─ src/
│  ├─ app/                        # Next.js App Router
│  │  ├─ layout.tsx               # root layout: fonts, <Providers>, metadata
│  │  ├─ providers.tsx            # SessionProvider + React Query
│  │  ├─ globals.css              # Tailwind v4 import + design tokens (@theme)
│  │  ├─ page.tsx                 # marketing landing (§6.8)
│  │  ├─ onboarding/page.tsx      # interest + grade (§6.1)
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx        # (§6.2)
│  │  │  └─ signup/page.tsx
│  │  ├─ (app)/                   # authed app shell (TopNav + BottomNav)
│  │  │  ├─ layout.tsx
│  │  │  ├─ feed/page.tsx         # ★ For You vertical feed (§4)
│  │  │  ├─ explore/page.tsx      # catalog (§6.4)
│  │  │  ├─ explore/[subject]/page.tsx
│  │  │  ├─ library/page.tsx      # saved stash (§6.6)
│  │  │  └─ profile/page.tsx      # stats + streak (§6.7)
│  │  ├─ studybook/[slug]/page.tsx        # detail (§6.3, mirrors TT ebook page)
│  │  ├─ studybook/[slug]/read/page.tsx   # reader (feed variant)
│  │  ├─ admin/page.tsx           # CMS placeholder (§6.10)
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts
│  │     ├─ studybooks/route.ts   # example read endpoint
│  │     └─ stripe/checkout/route.ts
│  ├─ components/
│  │  ├─ ui/                      # Button, Chip, Pill, Card, SubjectCard
│  │  ├─ layout/                  # TopNav, BottomNav, Logo, Footer
│  │  └─ feed/                    # CardFeed, StudyCard, ActionRail
│  ├─ config/                     # site.ts, subjects.ts (subjects/grades)
│  ├─ lib/                        # api.ts, tt-api.ts, auth.ts, stripe.ts, utils.ts, mock-data.ts
│  └─ types/                      # shared domain types
├─ public/                        # manifest.webmanifest, icons/
├─ docs/                          # this folder (brief + hand-over docs)
├─ capacitor.config.ts
├─ next.config.mjs · tsconfig.json · eslint.config.mjs · postcss.config.mjs
└─ .env.example · .nvmrc · .prettierrc.json
```

## Where to start (for the team)

1. **Feed** — `src/components/feed/*` + `src/app/(app)/feed/page.tsx`. This is
   the core screen; add scroll tracking + real data first.
2. **Data layer** — set `TT_API_BASE_URL`; confirm TT's response shapes in
   `src/lib/tt-api.ts` (contract in `docs/TT_API_ENDPOINTS.md`).
3. **Auth** — confirm TT auth vs. our own in `src/lib/auth.ts`, gate `(app)/layout.tsx`.
4. **Design tokens** — confirm exact colors/fonts against TaskuTark in
   `src/app/globals.css`.
