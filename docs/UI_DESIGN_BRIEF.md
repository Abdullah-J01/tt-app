# StudyBooks — UI Design Brief (for mockups)

**Purpose of this document:** a self-contained brief you can hand to a designer / design AI to produce UI mockups. It defines the visual system, navigation, and a screen-by-screen spec for every MVP screen. Read the MVP Plan for scope/timeline; this doc is purely the *look, layout, and interaction* layer.

---

## 1. Product in one line

A cross-platform **"bite-sized learning, TikTok-style"** app: users scroll a vertical feed of short, beautifully designed learning cards drawn from **studybooks**, save the ones that matter, and build a daily learning habit.

- **Engine / interaction model:** Deepstash (vertical card feed, save-to-library, personalized feed, streaks).
- **Visual language + catalog model:** **TaskuTark (TT)** — `taskutark.ee`. Mockups must feel like a close cousin of TT.
- **Platforms to mock:** mobile app (primary), desktop web, and a marketing landing page. iOS/Android share the mobile app layout.

> **The novel screen is the vertical card feed** — TT does not have it. Everything else (landing, catalog, book detail) should closely mirror TT's style; the feed reinterprets TT's style into a full-screen immersive format.

---

## 2. Visual system (matched to TaskuTark)

> These hex values are **eyeball approximations from the live site**. Please open `taskutark.ee`, inspect, and sample the exact tokens for final fidelity.

### 2.1 Color palette

| Token | Approx. hex | Usage |
|---|---|---|
| **Primary / Violet** | `#6C4CE3` | Primary buttons, active states, links, price pills text |
| Primary dark (hover) | `#5A3ED0` | Button hover/pressed |
| Primary tint (bg) | `#F1EEFB` | Hero/banner panels, section backgrounds, selected chips |
| **Brand green** | `#43A863` | Logo, small brand accents, "success/streak" moments |
| Plum gradient (cards) | `#4B3B66` → `#7A6A9E` | Feature-card backgrounds (with illustrations), immersive feed backgrounds |
| Ink (text) | `#1E1A2E` | Headings, primary text |
| Muted (text) | `#6E6E7A` | Secondary text, captions, counts |
| Surface | `#FFFFFF` | Cards, sheets |
| Border/hairline | `#E7E7EE` | Card borders, dividers |
| Amber / accent | `#F4A93B` | Streak flame, highlights (use sparingly) |

Feel: **friendly, playful-educational, light, airy.** Violet is the hero color; green is a secondary brand cue; plum gradients + 3D illustrations add personality.

### 2.2 Typography

- Headings: a **geometric/rounded sans** (TT uses one with rounded terminals). Recommend **Poppins** (or Montserrat). Bold, generous sizes.
- Body/UI: **Inter** (or the same family as headings at regular weight).
- Scale (mobile → desktop): H1 28/40, H2 22/30, H3 18/22, Body 15/16, Caption 12/13.
- Headings are **bold and near-black**; never thin. Lots of line-height and whitespace.

### 2.3 Shape, elevation, spacing

- **Corner radius:** cards ~16px, buttons ~10–12px, chips/price pills **fully rounded (pill)**, images ~14px.
- **Shadows:** soft and subtle (e.g. `0 8px 24px rgba(30,26,46,0.08)`). Avoid harsh borders; hairline `#E7E7EE` where needed.
- **Spacing:** generous. 8px base grid. Section padding 24–40px mobile, 64–96px desktop.
- **Layout:** centered hero, **3–4 column card grids**, **horizontal rails/carousels**, breadcrumbs on detail pages.

### 2.4 Components (design these as a shared library)

- **Buttons:** Primary (solid violet, white text), Secondary (white with hairline border, ink text), Text/ghost. Pill or 10–12px radius.
- **Price / meta pill:** small rounded pill, white bg + violet text (e.g. `1.90€`) or violet bg + white text.
- **Tag/chip:** rounded, light-violet bg for selected, grey outline for default (used for subjects, "Studybite", publisher, grade).
- **Subject card:** white card, **circular grey icon badge** (subject icon), bold title, muted count line ("1 442 items"). 4-up grid on desktop.
- **Studybook cover card:** portrait cover image, rounded corners, soft shadow; title + author below; used in rails and grids.
- **Studybite card (list form):** thumbnail left, title + truncated description, price pill + tags row. (This is the catalog representation of a card.)
- **Immersive card (feed form):** full-bleed — see §4.
- **Bottom nav bar (mobile), Top nav (desktop):** see §3.
- **Toasts / snackbars, empty states, loaders (skeletons), modals/bottom sheets.**

### 2.5 Illustration & imagery

- TT uses **playful 3D illustrations** (characters, planets, abstract shapes) on plum cards. Use a similar friendly 3D/spot-illustration style for hero, empty states, onboarding, and category art.
- Studybook covers are real cover art (portrait).
- Card backgrounds in the feed can use **per-subject color themes** or subtle gradients + a spot illustration/photo.

---

## 3. Navigation & layout model

**Mobile app (primary):** bottom tab bar, 4 tabs:
1. **Home** — the vertical "For You" card feed (default landing after login).
2. **Explore** — browse catalog by subject/grade + search.
3. **Library** — saved cards & studybooks (the user's stash).
4. **Profile** — stats, streak, settings, premium.

A persistent **streak/flame indicator** appears in the Home top bar.

**Desktop web:** TT-style top nav — logo (left), inline search, nav links (Home / Explore / Library), and right side: language selector, login/profile avatar. The vertical feed on desktop is a **centered single-card column** (phone-width, ~420–480px) with the action rail beside it; catalog/detail pages use the full width.

**Responsive:** design **mobile-first** for app screens; provide desktop variants for Landing, Explore/Catalog, Studybook detail, and the Feed (centered column). iOS and Android use the same layouts (respect safe areas / notch).

---

## 4. ⭐ The vertical card feed (the core screen — design carefully)

Two variants share the same card design:
- **"For You" feed** — mixed cards from many studybooks (Home tab).
- **Studybook reader** — sequential cards from one studybook (opened from a studybook detail page).

### 4.1 Immersive card anatomy (full-screen on mobile)

- **Background:** per-card themed color/gradient (plum family or per-subject color), optional spot illustration or image. High contrast with text.
- **Top bar:** thin **progress indicator** (segmented bar = card X of Y in this studybook) + small subject/grade chip; on Home, a streak flame + settings.
- **Body (center):** the "bite" —
  - a large **headline insight** (1 line, bold), and
  - **supporting text** (2–4 short lines), and/or a small illustration/diagram.
  - Keep it skimmable in ~5 seconds.
- **Right action rail (vertical stack of icon buttons, TikTok-style):**
  - **Save/Bookmark** (to library) — with saved-count.
  - **Like** — with like-count + tap animation.
  - **Share** — opens share sheet / copies link.
  - **Studybook** — small round cover thumbnail; tap opens the studybook detail / reader.
- **Bottom attribution:** studybook title + author, subject tag, and a subtle **"swipe up for next"** hint on first use.

### 4.2 Interactions / gestures

- **Swipe up** → next card. **Swipe down** → previous card. Snap one card at a time (paged).
- **Swipe left/right (optional, note as nice-to-have)** → jump to next/previous studybook.
- **Tap Save/Like** → animated fill + micro-haptic; toast "Saved to Library".
- **Tap cover thumbnail** → open studybook detail.
- **End of a studybook** → a "completion card" (streak +1, "X cards learned", CTA: *Save all*, *Next studybook*, *Back to feed*).
- Design **empty/paused states** and a **first-run coach mark** ("Swipe up to learn more").

### 4.3 States to provide

Default card, long-text card (scroll-within or truncate rule), image/diagram card, saved state, liked state, completion card, loading skeleton, offline/error card.

---

## 5. Screen inventory (what to mock, in priority order)

**Priority 1 (core loop):**
1. Vertical "For You" feed (mobile + desktop centered column) — §4
2. Studybook detail page (TT-style) — §6.3
3. Studybook reader (feed variant, entered from detail) — §4
4. Explore / Catalog: subject + grade browse (TT grid) — §6.4
5. Library (saved cards & studybooks) — §6.6

**Priority 2 (onboarding + account):**
6. Onboarding: interest/subject + grade selection — §6.1
7. Sign up / Log in — §6.2
8. Profile (stats + streak) — §6.7
9. Search + results — §6.5

**Priority 3 (marketing + monetization):**
10. Marketing landing page (TT-style) — §6.8
11. Premium / paywall — §6.9
12. Streak / daily-goal moment (modal or screen) — §6.7
13. (Optional, low fidelity) Admin CMS dashboard — §6.10

---

## 6. Screen-by-screen spec

### 6.1 Onboarding (interest + grade)
- 2–3 friendly steps with progress dots and a spot illustration per step.
- Step 1: pick **grade/level** (Preschool → Gymnasium) as large selectable chips/cards.
- Step 2: pick **subjects/interests** (multi-select chips using subject icons; min 3).
- Step 3 (optional): set a **daily goal** (e.g. 3 / 5 / 10 cards) + notifications opt-in.
- Primary violet "Continue" button; skippable. End → drops user into the For-You feed.

### 6.2 Sign up / Log in
- Clean centered card on light-lavender bg. Email + password, **Continue with Google**, and "magic link"/reset.
- Minimal fields; social login prominent. Mobile full-screen; desktop centered modal/page.

### 6.3 Studybook detail page (mirror the TT ebook page closely)
- **Layout matches TT's ebook page:** light-lavender banner at top; **portrait cover on the left**; on the right: breadcrumb (E.g. *Studybook › Category*), **large bold title**, muted **author + year**, then a **primary violet CTA** with an inline price pill (TT: "Laenuta 30 päevaks · 1.90€" → ours: e.g. **"Start learning"** free, or **"Unlock · 1.90€"** / **"Included with Premium"**), plus a **secondary "Preview"** button.
- Add a small **"X cards · ~Y min"** meta row and subject/grade chips.
- Below the banner: **synopsis** (full-width text), then a **"cards preview"** rail (first few bite thumbnails), then **"You may also like"** rail of studybook covers (exactly like TT's recommendation rail).
- Provide desktop + mobile.

### 6.4 Explore / Catalog (mirror TT landing's subject grid)
- Top: search bar. **Grade filter tabs** (All / Preschool / 1–3 / 4–6 / 7–9 / Gymnasium).
- **Subject grid**: 4-up (desktop) / 2-up (mobile) white cards with **circular icon badge, bold subject name, muted count**. Exactly TT's pattern.
- Below: **"New / Freshly added" rail**, **"Popular studybooks" rail** (cover cards), and a **"Studybites for you" rail** (studybite list cards).
- Tapping a subject → filtered list of studybooks (cover grid).

### 6.5 Search
- Full-screen search with recent + suggested queries, subject chips.
- Results grouped: **Studybooks** (cover cards), **Studybites/cards** (list cards), **Subjects**. Empty + no-results states.

### 6.6 Library (the user's stash)
- Tabs: **Saved cards** (grid/list of saved bites) and **Studybooks** (in-progress + saved, with progress bars).
- Optional "Collections/Folders" shown as **Phase 2** (design a single flat list for MVP; you may show an empty "Create collection" affordance greyed/coming-soon).
- Empty state with friendly illustration + CTA to the feed.

### 6.7 Profile + streak/gamification
- Header: avatar, name, **streak flame + day count**, edit/settings.
- Stats row: **cards learned, day streak, studybooks completed** (simple counters — not badges/levels; those are Phase 2).
- Settings list: account, notifications, language, premium, log out.
- **Streak moment**: a celebratory modal/bottom sheet on daily goal completion (flame animation, "3-day streak!", CTA "Keep going").

### 6.8 Marketing landing page (TT-style, desktop + mobile)
- **Top nav** like TT (logo, search, links, login, language).
- **Hero**: light-lavender rounded panel, big bold headline (e.g. *"Learn something new in the time it takes to scroll."*), subtitle, primary CTA ("Get started"), and a **phone mockup showing the vertical feed**.
- **3 feature cards** on plum gradient with 3D illustrations + white CTA buttons (mirror TT's Teemalehed/E-raamatud/ÕPI trio) → e.g. *Bite-sized cards*, *Thousands of studybooks*, *Learn on any device*.
- **Subject grid** section (same as catalog) with counts.
- **"Freshly added" studybook rail.**
- Social proof / how-it-works (3 steps) + footer (quick links, subjects, grades, legal) mirroring TT's footer.
- App Store / Google Play badges.

### 6.9 Premium / paywall
- Simple, honest paywall: value bullets (unlimited saves, offline, audio, all studybooks), plan toggle (monthly/annual), primary violet CTA.
- Present as a bottom sheet (mobile) triggered when hitting a gated studybook or a save limit; full page on desktop.
- **Note:** payment entry itself is standard; just design the plan-selection + confirmation states.

### 6.10 Admin CMS (optional, low fidelity)
- One dashboard mock: list of studybooks (table), "create studybook" form (title, subject, grade, cover, synopsis), and a **card editor** (add/reorder bite cards with text + image). Desktop only. Utilitarian, not marketing-polished.

---

## 7. Key motion / micro-interactions to note (for annotations, not full animation)
- Feed paging snap; save/like fill + haptic; streak flame celebration; skeleton loaders on rails; sheet slide-ups for share/paywall; subtle card parallax on the immersive background.

---

## 8. Deliverables requested from the designer
- **Screens:** all Priority 1 & 2 screens in **mobile (390×844)**; plus **desktop (1440)** variants for Landing, Explore/Catalog, Studybook detail, and Feed (centered column).
- **States:** include the empty/loading/saved/completion states called out above.
- A **mini design-system board**: colors, type scale, buttons, chips/pills, cards, nav bars, icons.
- **Prototype links** for the core loop: Feed → Save → Studybook detail → Reader → Library.
- Keep everything consistent with the TT-matched visual system in §2.

## 9. Out of scope for these mockups (Phase 2 — do not design)
Audio player, offline manager, social/following & comments, badges/levels/leaderboards, collections/folders (beyond a coming-soon affordance), multi-language content screens, rich push-notification templates, quiz/video card types.

---

### Quick reference: TT pages to imitate
- **Landing / catalog style:** `https://www.taskutark.ee/`
- **Studybook detail style:** `https://www.taskutark.ee/ebook/114186/uks-vaga-tosine-lumememmelugu`

*Match TT's spacing, rounded cards, violet primary, green brand accent, playful 3D illustrations, and clean education-portal feel — then layer the TikTok-style vertical feed on top.*
