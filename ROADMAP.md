# Project Roadmap & Execution Tracker

Last updated: 2026-03-21
Scope: `brand-websites` monorepo (`apps/*`, `packages/*`)
Primary source constraints: `AGENTS.md` + Q1 build brief

---

## 1) Purpose of this document

Use this file as the **single source of truth for current project status and next actions** so you can:

- pause/resume work quickly,
- hand tasks to Codex/agents with clear context,
- keep scaffolding quality high before feature acceleration.

---

## 2) Working rules (from AGENTS.md)

- Keep the repo shippable; prefer small, verifiable PRs.
- Apps must only share code through packages (`@repo/ui`, `@repo/core`, `@repo/db`); **no app-to-app imports**.
- Q1 focus: `apps/evrydayarchive-web` + `apps/admin`; `apps/reed-web` remains skeleton (out of scope).
- No public user accounts in Q1; booking is request-based; no in-app payments.
- TypeScript strict + Tailwind conventions + Zod validation for request payloads.
- Every PR must be validated locally before merge: `pnpm format` → `pnpm lint` → `pnpm typecheck` → build sanity.

---

## 3) Hosting decisions (captured)

- `evrydayarchive-web` → Vercel, domain: `evrydayarchive.co`
- `admin` → Vercel, domain: `admin.evrydayarchive.co`
- Database → Neon PostgreSQL (live, shared across local dev and production)
- Public site reads gallery/package data from the admin API (`ADMIN_API_BASE_URL`)
- Public site also writes directly to the DB for waitlist entries (`DATABASE_URL`)
- Coming-soon mode: `NEXT_PUBLIC_COMING_SOON=true` in public app env → middleware redirects everything to `/coming-soon`

---

## 4) Current state snapshot (as of 2026-03-21)

### Infrastructure & tooling

- ✅ Turborepo + pnpm workspace (apps + packages wired)
- ✅ CI pipeline (GitHub Actions): install, Prisma generate, typecheck, lint, format check, build, tests
- ✅ PR checklist template
- ✅ Testing strategy documented in README
- ✅ Vercel deployment for `evrydayarchive-web` (configured via Vercel project settings)
- ✅ Admin deployed to `admin.evrydayarchive.co`
- ⬜ Issue templates (`.github/ISSUE_TEMPLATE/*`) — not added
- ⬜ `CODEOWNERS` — not added

### Database & schema

- ✅ All Q1 entities defined in Prisma schema: Gallery, ImageAsset, GalleryImage, Package, PackageModifier, TimeSlot, Inquiry, BookingRequest, Review, WaitlistEntry
- ✅ Migrations in place

### Admin CMS (`apps/admin`)

- ✅ Single-password auth (login/logout)
- ✅ Sidebar navigation
- ✅ Galleries: full CRUD, image management (Cloudinary upload), cover image selection, publish/unpublish
- ✅ Packages: CRUD with per-package modifiers
- ✅ Reviews/testimonials: CRUD (linked to galleries)
- ⬜ Availability slots management UI
- ⬜ Booking requests management UI (view/respond to incoming booking requests)
- ⬜ Inquiries management UI (view/respond to inquiry submissions)
- ✅ Admin deployed to `admin.evrydayarchive.co`

### Public site (`apps/evrydayarchive-web`)

**Navigation & layout**

- ✅ Site header (archival stamp + animated nav)
- ✅ Site footer
- ✅ Mobile menu
- ✅ Theme toggle (dark mode)
- ✅ Coming-soon page with waitlist email capture
- ✅ Middleware coming-soon gate (`NEXT_PUBLIC_COMING_SOON`)

**Home page (`/`)**

- ✅ Rolling hero (fixed-text variant with cross-fading copy) — feature-flagged off by default
- ✅ Brand stance / intro section
- ⬜ Featured galleries section (needs real gallery data wired)
- ✅ Reviews/testimonials (filing cabinet UI)
- ⬜ Pricing philosophy section — needs review
- ✅ Location section
- ⬜ Final CTA wired to `/book`

**Portfolio (`/portfolio`, `/portfolio/[slug]`)**

- ✅ Gallery index (wall list, fetches from admin API)
- ✅ Gallery detail (image grid with native aspect ratios)
- ⬜ Mobile scroll-snap viewer (spec §9)

**Packages & builder**

- ✅ Packages list page (`/packages`) — fetches from admin API
- ✅ Package Builder UI (`/package-builder`) — base package selection + modifier toggles
- ⬜ Package Builder dynamic price calculation (currently no live pricing logic)
- ⬜ Package Builder → inquiry/booking submission flow

**Booking & inquiries**

- ✅ `/inquire` — guided questionnaire UI with package recommendation stub
- ⬜ `/inquire` — recommendation logic (currently a stub, not wired to real data)
- ✅ `/book` — page exists, date/time picker UI styled
- ⬜ `/book` — backend hookup (submit `BookingRequest` to DB)
- ⬜ `/book` — available slots display (needs admin slots data)
- ⬜ Email confirmation on booking/inquiry submission

**Other pages**

- ✅ `/contact` — contact form
- ✅ `/faq` — FAQ accordion
- ✅ `/process` — process steps

**Notifications**

- ⬜ Email provider not chosen yet (Resend, Postmark, or SES)
- ⬜ No transactional emails implemented (booking confirmation, inquiry acknowledgement)

---

## 5) Phase roadmap

### Phase 0 — Foundation hardening

- [x] Standardize root scripts and workspace task names
- [x] PR checklist template
- [x] Q1 testing strategy documented
- [x] README setup instructions
- [ ] Issue templates (`.github/ISSUE_TEMPLATE/*`)
- [ ] `CODEOWNERS`

### Phase 1 — Q1 domain model and CMS completion

- [x] Full Prisma schema coverage for Q1 entities
- [x] Admin galleries CRUD + image management
- [x] Admin packages + modifiers CRUD
- [x] Admin reviews/testimonials CRUD
- [ ] Admin availability slots management UI
- [ ] Admin booking requests management UI
- [ ] Admin inquiries management UI
- [ ] Test coverage for critical admin route handlers

### Phase 2 — Public conversion flows (MVP)

- [x] All core pages scaffolded and styled
- [x] Portfolio fetches live data from admin API
- [x] Package list fetches live data from admin API
- [x] Guided questionnaire on `/inquire`
- [ ] `/inquire` recommendation logic wired to real package data
- [ ] Package Builder dynamic price calculation
- [ ] Package Builder → inquiry submission
- [ ] `/book` backend hookup (BookingRequest creation)
- [ ] `/book` available slots display
- [ ] Email notifications (choose provider, send on inquiry + booking)
- [ ] Mobile scroll-snap gallery viewer (spec §9)
- [ ] Home page featured galleries wired to real data

### Phase 3 — Operational readiness

- [x] Vercel deployment for `evrydayarchive-web`
- [x] Admin deployed to `admin.evrydayarchive.co`
- [ ] Branch protections configured to match CI gates
- [ ] Error handling and logging guidelines
- [ ] E2E smoke tests (login, gallery publish, public portfolio render)

---

## 6) Prioritized backlog (ordered by impact)

1. **`/book` backend + email flow** — highest broken-link impact; many CTAs point here.
2. **Admin booking requests + inquiries management UI** — needed to act on submissions.
3. **Package Builder pricing logic + inquiry submission** — completes the conversion flow.
4. **`/inquire` recommendation logic** — currently a stub; needs to surface real packages.
5. **Email notifications provider** (Resend/Postmark/SES) — required for booking/inquiry emails.
6. **Admin availability slots UI** — needed for `/book` to show available dates.
7. **Mobile scroll-snap gallery viewer** (spec §9).
8. **Home page featured galleries** wired to real data.
9. **E2E smoke tests** for critical paths.

---

## 7) Open questions

1. **Email provider**: Which service for transactional emails? Resend is simplest to set up; Postmark has strong deliverability; SES cheapest at scale.
2. **`/book` slot UX**: Should visitors pick from available admin-managed slots, request a custom time, or both?
3. **Package Builder pricing**: Is pricing calculated client-side from package/modifier data, or should there be a server-side pricing endpoint?

---

## 8) Change log

- 2026-02-18: Initial roadmap created.
- 2026-02-19: Updated — added Phase 0 testing-strategy task, captured resolved decisions.
- 2026-02-26: Checked off foundation, testing, and schema-completion tasks.
- 2026-03-21: Major update — reflected all work done since Feb; added hosting decisions; restructured backlog by impact; added open questions.
