# Q3/Q4 2026 Roadmap — Evryday Archive Co

**Status:** Draft — scoped from conversation with Reed, 2026-08-07
**Purpose:** A single index of the initiatives planned for Q3/Q4, each at whatever depth it currently warrants. Some already have detailed specs (linked below); others are one paragraph until they're scoped properly. This document tracks status and rough priority tiers — it does not replace a dedicated spec once an initiative is ready for one.

This sits alongside, not instead of, existing GitHub issues/PRs — where one already exists, this points to it rather than duplicating it.

**This is a living document, not a locked schedule.** The ordering below is a starting opinion, not a commitment — Reed calls what happens when, and that call is expected to shift as work lands, priorities change, or an initiative turns out bigger/smaller than it looked from the outside. Revisit and re-sequence freely; update the change log when priority calls change materially.

---

## Initiatives

### 1. Gallery Experience V2

**Detailed spec:** [`gallery-experience-v2-roadmap.md`](./gallery-experience-v2-roadmap.md)
**Status:** Scoping complete, no phase started
**Size:** Largest single initiative in this roadmap — multi-PR, phased A–E

Sections, wall text, per-image captions/plaques, curated desktop layout, full-bleed mobile scroll-snap viewer, and eventually an admin visual builder. See the linked doc for the full phase breakdown, risks, and open questions.

---

### 2. Land gallery description/headline/shoot-date

**Reference:** [PR #92](https://github.com/rmcilwain6/brand-websites/pull/92) — `feat/gallery-metadata`
**Status:** Open PR, ready for review/test-plan sign-off
**Size:** Small — already built

Surfaces `description`, adds `headline` and `shootDate` to galleries end-to-end (schema → admin → API → frontend). Purely a matter of finishing the test plan and merging. Worth doing first — it's a dependency-free, already-done piece, and the wall-text/caption concepts in Gallery Experience V2 (Initiative 1) will build on the same surfaced-metadata pattern this PR establishes.

---

### 3. Dynamic OG image generation

**Reference:** [Issue #86](https://github.com/rmcilwain6/brand-websites/issues/86)
**Status:** Scoped, not started
**Size:** Small–medium, self-contained

Per-page Open Graph images via Next.js `ImageResponse` — gallery pages get a cover-image + title + location card instead of the current blank preview when shared to iMessage/Slack/social. Already has a clear proposed approach in the issue. Natural prerequisite for Initiative 4 below.

**Follow-on, not in this pass:** [Issue #87](https://github.com/rmcilwain6/brand-websites/issues/87) (in-gallery social share button + brandable downloadable client card) explicitly depends on #86's infrastructure. Worth doing in the same quarter once #86 lands, but keep them as separate PRs — #87 has its own open questions (fixed template vs. client-chosen images, per-client private share tokens) that shouldn't block #86.

---

### 4. Frame wall refresh

**Status:** Not started
**Size:** Depends on how far the rework goes — treat as more than an asset swap

Reed's read: this isn't just dropping in newer photos. The rolling-hero mechanic itself (`rolling-hero.tsx`, hardcoded image set in `public/images/top-brand-images/*.webp`, currently **off** by default behind `ROLLING_HERO`) needs a real look at both the content and the mechanics before it's worth turning on — new images alone won't be enough if the underlying motion/behavior isn't already right.

**Open questions:** what specifically feels off about the current mechanics (pacing, drag behavior, the fixed-text variant vs. plain rolling)? And separately: keep the image set hardcoded in the repo, or make it admin-managed so future refreshes aren't a code change?

---

### 4a. Existing prototypes generally need a design + mechanics pass, not just wiring

**Status:** Cross-cutting note

A theme across Initiatives 4, 6, and 7: code existing in the repo (rolling hero, `FilingCabinet`, the `/inquire` questionnaire) is not the same as those features being finished. Each was built to a point and left — the interaction design, visual polish, and in some cases the underlying mechanics still need real evaluation and iteration, not just a data-wiring pass. Treat "already built" in the notes below as "a starting point that's been sitting," not "mostly done."

---

### 5. Home page "meet the photographer" intro

**Status:** Not started
**Size:** Small — content/design, no backend

Today this is the plain-text "Photographer philosophy" block (`page.tsx`, Section 2) — a literary zigzag paragraph ending in a quiet text link ("Meet the photographer →"). Reed wants a photo added and the section made brighter, friendlier, and more clearly clickable — likely means treating it more like an inviting card/CTA than a subtle text link. Small, self-contained, good candidate for an early quarter win once a photo is chosen.

---

### 6. Dynamic, interactive reviews on the home page

**Status:** Not started; a candidate building block exists but isn't assumed sufficient
**Size:** Medium — treat as a real design pass, not a drop-in

The home page's testimonials are a hardcoded 3-quote array (`TESTIMONIALS` in `page.tsx`) explicitly marked as a placeholder. There's also `FilingCabinet` (`app/components/filing-cabinet.tsx`) — a tabbed review browser with real data fetching (`fetchPublicReviews`) and bespoke tab-transition animations — sitting unused in the codebase. That's a useful starting point, not a finished answer: per Reed, what exists isn't necessarily where it needs to land design- or mechanics-wise, and "more engagement/interaction" may call for something beyond what `FilingCabinet` currently does. Scope this as evaluate-and-likely-rework, with retiring the static array as the one certain outcome.

**Open question:** does the filing-cabinet interaction (or a reworked version of it) satisfy "more engagement," or is Reed picturing something else entirely (filtering by session type, linking out to the source gallery more prominently, something more exploratory)?

---

### 7. `/inquire` interactive questionnaire

**Status:** UI exists but isn't considered finished; recommendation engine is a stub
**Size:** Medium–large — real UX/mechanics work plus a data-wiring dependency

An interactive questionnaire already exists (`questionnaire.tsx`, 686 lines, built against `requirements/guided-questionaire.md`), but per Reed it isn't yet where it needs to be — this should be scoped as genuinely building out `/inquire`, not just patching the one known gap. That known gap is real too: `recommendation.ts` isn't wired to real package/pricing data, which is the same underlying gap as "Package Builder dynamic price calculation" (tracked in the stale root `ROADMAP.md`) — those two should be scoped and built together rather than each reinventing pricing logic. But the data wiring is necessary, not sufficient; expect a UX/interaction review of the questionnaire itself as part of this initiative.

---

### 8. Custom page view / click tracking in admin

**Status:** Not started, least defined of this list
**Size:** Unclear until scoped — could range from small to a real sub-project

Reed wants visibility beyond Vercel's free-tier analytics, surfaced in the admin dashboard. This is the one item here with a genuine build-vs-buy fork worth deciding explicitly before writing code:

- **Self-hosted/embedded tool** (e.g. Plausible, Umami, PostHog) — fastest to working dashboards, less custom, but another service/dependency to run and another login, and less native inside the existing admin UI.
- **Custom-built** — a `PageView`/`ClickEvent` table, a lightweight client-side beacon, and a new admin "Analytics" section rendering it. Fully native and exactly the shape Reed wants, but is a real mini-project: needs a decision on what's tracked (page views only, or specific CTA clicks too), retention/volume handling, and basic privacy consideration (no PII, IP handling akin to what the private-gallery access log already does).

Given the size of everything else in this quarter, this is a good candidate for a short, dedicated scoping conversation of its own before deciding which path — recommend not starting it opportunistically alongside the others.

---

## Priority tiers (Reed's call, revisited as we go)

Grouped rather than strictly numbered — within a tier, order is genuinely interchangeable and should follow whatever Reed's actually in the mood to tackle or has fresh input on (a new photo arrives, a design idea clicks, etc.). Tiers themselves can be reshuffled too; this is the starting opinion, not the plan.

**Land now / lowest friction**

- PR #92 — already built, just needs the test plan closed out.

**Near-term, self-contained, don't depend on anything else landing first**

- Frame wall (Initiative 4) — pending Reed's read on what specifically needs to change mechanically.
- Home page intro redesign (Initiative 5).
- Dynamic OG images (Issue #86).

**Real design/rework passes — bigger than they look from the outside**

- Home page reviews (Initiative 6).
- `/inquire` questionnaire + recommendation engine (Initiative 7), bundled with Package Builder pricing.

**Anchor project — multi-quarter, start when ready**

- Gallery Experience V2 (Initiative 1), Phase A.

**Needs its own scoping conversation before it has a place in sequence**

- Admin analytics (Initiative 8).

This grouping is meant to be argued with — if something in "near-term" turns out to need real rework once Reed digs in (the way the frame wall and reviews already did), it moves down a tier without needing to renegotiate the whole document.

---

## Not included in this pass (existing untriaged backlog)

These have open GitHub issues but weren't part of tonight's conversation — listed so this roadmap doesn't accidentally hide them, not because they're being deprioritized:

- [#89](https://github.com/rmcilwain6/brand-websites/issues/89) — client payment portal (Stripe)
- [#68](https://github.com/rmcilwain6/brand-websites/issues/68) — Playwright e2e test suite
- [#66](https://github.com/rmcilwain6/brand-websites/issues/66) — `turbo-ignore` per-app Vercel builds (one-line config change)
- [#53](https://github.com/rmcilwain6/brand-websites/issues/53) — no-JS / AI-agent discoverability audit
- [#52](https://github.com/rmcilwain6/brand-websites/issues/52) — finish coming-soon page polish
- [#43](https://github.com/rmcilwain6/brand-websites/issues/43) / [#42](https://github.com/rmcilwain6/brand-websites/issues/42) / [#41](https://github.com/rmcilwain6/brand-websites/issues/41) — site-wide photography presence, package builder carousel, package builder intro copy
- [#38](https://github.com/rmcilwain6/brand-websites/issues/38) — transactional email (Resend) for inquiries
- [#36](https://github.com/rmcilwain6/brand-websites/issues/36) — real Instagram link

Also: the root `ROADMAP.md` is a whole-project tracker last updated 2026-03-21 and is now noticeably stale (predates private galleries, the process/FAQ rewrite, and everything in this document). Worth a separate pass to reconcile it once this quarter's priorities settle — not urgent tonight.

---

## Change log

- 2026-08-07: Initial draft from conversation with Reed.
