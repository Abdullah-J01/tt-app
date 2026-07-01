# TT API — endpoints we need (proposal for TaskuTark)

This app has **no database of its own**. TaskuTark (TT) is the source of truth
for all content, and — pending confirmation — for user auth and engagement.

This document is a **proposed contract** for TT to confirm or adjust. The app
maps whatever TT returns into its own types in [`src/lib/tt-api.ts`](../src/lib/tt-api.ts);
if TT's real shapes differ, we only change the DTOs + mappers there.

> **Question for TT:** does an API like this already exist? If so, please share
> the base URL, auth method, and a few sample responses and we'll adapt.

---

## Conventions

- **Base URL:** configured as `TT_API_BASE_URL` (e.g. `https://api.taskutark.ee`). Paths below are relative, versioned under `/v1`.
- **Format:** JSON; `Accept: application/json`.
- **Auth:** `Authorization: Bearer <token>` (an API key for public content, a user token for `/me/*`). Confirm what TT expects.
- **Pagination:** cursor or page based — `?page=` / `?cursor=`, responses include `nextCursor` or `page`/`totalPages`.
- **Errors:** non-2xx with `{ "error": { "code": "not_found", "message": "…" } }`.
- **IDs & slugs:** studybooks and subjects addressable by human-readable `slug`.

---

## A. Content (required for MVP)

These unblock the whole frontend. **If we get section A, the app works.**

### A1 · List subjects
`GET /v1/subjects`

```json
{
  "subjects": [
    { "slug": "math", "name": "Mathematics", "itemCount": 5936, "iconKey": "Calculator" },
    { "slug": "estonian", "name": "Estonian", "itemCount": 9077, "iconKey": "BookOpen" }
  ]
}
```

### A2 · List studybooks (browse / filter)
`GET /v1/studybooks?subject={slug}&grade={slug}&page={n}`

- `subject`, `grade` optional filters; `grade` one of `preschool|1-3|4-6|7-9|gymnasium`.

```json
{
  "studybooks": [
    {
      "id": "sb_114186",
      "slug": "a-very-serious-snowman-story",
      "title": "A Very Serious Snowman Story",
      "author": "Johanna Unt",
      "year": 2026,
      "subjectSlug": "estonian",
      "grade": "4-6",
      "category": "For children and youth",
      "synopsis": "A small, boring town…",
      "coverUrl": "https://…/cover.jpg",
      "priceCents": 190
    }
  ],
  "page": 1,
  "totalPages": 12
}
```

### A3 · Studybook detail (+ cards)
`GET /v1/studybooks/{slug}`

Same object as A2 **plus** the ordered `cards` array (the bite-sized units).
If cards are large, expose them separately as **A4** instead.

```json
{
  "studybook": {
    "id": "sb_114186",
    "slug": "a-very-serious-snowman-story",
    "title": "A Very Serious Snowman Story",
    "author": "Johanna Unt",
    "year": 2026,
    "subjectSlug": "estonian",
    "grade": "4-6",
    "category": "For children and youth",
    "synopsis": "A small, boring town…",
    "coverUrl": "https://…/cover.jpg",
    "priceCents": 190,
    "cards": [
      { "id": "c_1", "order": 0, "heading": "A story is a promise to the reader.", "body": "The opening sets an expectation.", "imageUrl": null },
      { "id": "c_2", "order": 1, "heading": "Conflict is a plan meeting reality.", "body": "The contest collides with a snowless winter." }
    ]
  }
}
```

### A4 · Studybook cards (optional, if not inlined in A3)
`GET /v1/studybooks/{slug}/cards` → `{ "cards": [ … ] }`

### A5 · Related studybooks (“you may also like”)
`GET /v1/studybooks/{slug}/related` → `{ "studybooks": [ … ] }` (A2 shape)

### A6 · Feed (“For You”)
`GET /v1/feed?cursor={c}`

Ordered studybooks/cards for the vertical feed. Personalized if a user token is
sent; otherwise a sensible popular/newest ordering.

```json
{ "studybooks": [ /* A2 shape, each with cards */ ], "nextCursor": "eyJvIjoyMH0" }
```

### A7 · Search
`GET /v1/search?q={query}&type=studybook|subject|card`

```json
{ "studybooks": [ /* A2 shape */ ], "subjects": [ /* A1 shape */ ] }
```

---

## B. User & auth (please confirm)

Needed for sign-in, the streak, and anything under `/me`. **Confirm whether TT
provides these or whether we implement sign-in ourselves.**

### B1 · Authenticate
`POST /v1/auth/login` with `{ "email", "password" }` **or** an OAuth/redirect flow.

```json
{ "token": "…", "user": { "id": "u_1", "name": "…", "email": "…", "avatarUrl": null } }
```

### B2 · Current user
`GET /v1/me` (Bearer user token) → `{ "user": { … }, "isPremium": false }`

---

## C. Engagement (please confirm)

The app’s save/like/streak features need to persist per user. **Confirm TT can
store these; otherwise we’ll add a thin service just for engagement.**

| Purpose        | Endpoint                                             |
| -------------- | ---------------------------------------------------- |
| List saves     | `GET /v1/me/saves` → `{ "cards": [ … ] }`            |
| Save a card    | `POST /v1/me/saves` `{ "cardId" }`                   |
| Unsave         | `DELETE /v1/me/saves/{cardId}`                       |
| Like a card    | `POST /v1/me/likes` `{ "cardId" }` / `DELETE …`      |
| Get progress   | `GET /v1/me/progress/{studybookSlug}`                |
| Save progress  | `PUT /v1/me/progress/{studybookSlug}` `{ "lastCardOrder", "completed" }` |
| Streak         | `GET /v1/me/streak` → `{ "current": 5, "best": 12, "lastActiveDate": "2026-06-30" }` |

---

## D. Entitlements / premium (please confirm)

If TT owns purchases/rentals (like its 30-day ebook rental), the app just reads
entitlements; otherwise payments stay on our side (Stripe).

`GET /v1/me/entitlements` → `{ "premium": true, "unlockedStudybookSlugs": ["…"] }`

---

## Minimum to unblock the frontend

1. **A1** subjects, **A2** studybooks, **A3** studybook + cards → catalog, detail, reader render live.
2. **A6** feed → the core "For You" screen.
3. **A7** search.
4. Then **B** (auth) + **C** (engagement) to make save/like/streak real.

Until these exist, the app runs on local mock data (`USE_MOCK_DATA=1`).

## Open questions for TT

1. Does a public/content API already exist? Base URL + auth method?
2. Auth: does TT issue user tokens we can use, or do we own sign-in?
3. Engagement (saves/likes/progress/streak): can TT store these per user?
4. Purchases/rentals: does TT own entitlements, or do we run payments?
5. Media: are cover/card image URLs absolute and CDN-served?
6. Rate limits / caching headers we should respect?
