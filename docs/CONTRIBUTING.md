# Contributing / conventions

## Branching

- `main` is protected and always deployable.
- Branch names: `feat/…`, `fix/…`, `chore/…`.
- Open a PR; CI (typecheck + lint + build) must pass.

## Commits

Conventional Commits, e.g. `feat(feed): add scroll progress tracking`.

## Code style

- TypeScript strict; no `any` without a comment.
- Prettier + ESLint enforced (`npm run format`, `npm run lint`).
- Tailwind classes only — use the design tokens (`bg-violet`, `text-ink`, …),
  not raw hex. Tokens live in `src/app/globals.css`.
- Prefer **Server Components**; add `"use client"` only when you need state,
  effects, or event handlers.

## Adding a screen

1. Create the route under `src/app/…`.
2. Reuse `components/ui` + `components/layout`; add new shared components there.
3. Read data through `src/lib/api.ts` (never import `mock-data` in pages once the
   API is wired).
4. Reference the relevant section of `docs/UI_DESIGN_BRIEF.md`.

## Definition of done

Typecheck, lint, and build pass; screen matches the UI brief; loading/empty/error
states handled; works at mobile (390) and desktop (1440) widths.
