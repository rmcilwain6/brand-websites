# Passion Projects: Implementation Plan

**Spec:** [`passion-projects-spec.md`](./passion-projects-spec.md)
**Status:** Phases 1–2 committed. Phase 3 is a draft, to be revisited after the Phase 2 checkpoint.
**Campaign target:** launch Fri Nov 6, 2026

---

## How this plan is structured

The spec bundles three different kinds of work. They carry different levels of certainty, so they're planned differently:

| Phase                            | What it is                                                                                                                                                                   | Commitment                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **1. Cleanup**                   | Remove dead code and consolidate duplicated logic. No visible change.                                                                                                        | Committed                                |
| **2. Booking flow improvements** | Permanent, site-wide additions to the existing `/book` flow (referrals, vouchers, location ideas, source) plus the admin and email support for them. Ships visibly, no flag. | Committed                                |
| **3. Passion Projects**          | The campaign layer on top: apply toggle and campaign fields, `/passion-projects` landing page, nav, home block. Behind a production flag.                                    | **Draft.** Revisit after the checkpoint. |

**Why this order:** the form changes are significant. It's hard to judge how heavy the form feels until Reed has used it. Phase 2 lands the new fields on the existing `/book` flow first. Then there's a **checkpoint**: Reed uses it on Preview/production, and decides what the form should look like before the landing page builds on top of it. Phase 3 will likely change as a result, and that's expected.

Every PR leaves `main` shippable, is cut from its own branch, and passes `pnpm format`, `lint`, `typecheck`, `build`, `test` before merge. Phases 1 and 2 can each be released to production as they merge.

---

## Relevant findings from the codebase

- **The spring sale is fully inactive.** `isSaleAnnouncementActive()` returns false after June 4, 2026. `springSale` was **never persisted** (not in `Inquiry.payload` or any column; it only shaped the on-screen price and an email line item), so removing it doesn't affect historical data.
- **Spring sale code is in 12 places:** `lib/sale.ts`, `/spring-sale`, `site-header.tsx`, `layout.tsx` (mobile padding), `mobile-menu.tsx` (`bottomOffset`), `conditional-footer.tsx`, `date-picker.tsx`, `builder-card.tsx`, `book/page.tsx`, `booking-form.tsx`, `BookingFormSchema.springSale`, admin bookings route, and the two email preview fixtures.
- **Pricing logic is duplicated four times:** `book/page.tsx`, `booking-form.tsx`, `builder-card.tsx`, admin `lib/modifiers.ts`.
- **`booking-form.tsx` is 765 lines**, and the package summary is implemented twice (mobile card + desktop sidebar).
- **Booking data** is split between `Inquiry` (name/email/phone/notes + JSON `payload`) and `BookingRequest`. The admin pages, the resend route, and both emails read from `payload`.
- **Admin can hard-delete bookings.** Decided: deleting a booking also deletes the referral voucher it created (cascade). The delete confirmation names the voucher and its status, so Reed knows if a code was already sent out.
- **Package slugs:** production Evryday is **`evryday-package`**, not `evryday` as the spec says.
- **`/inquire` is not built or launched.** Some UI and a stub recommendation module exist, but nothing here depends on or reuses it. Its package mapping is not a reference.
- **Every eligible package has 4–5 builder controls** (images, session length, additional location, processing effort; In Practice also has an alignment call).
- **Bug:** Reed's notification email subject uses the client-facing wording ("I'll be in touch soon"). Fixed in Phase 2.
- **Existing `lib/feature-flags.ts` is client-only** (localStorage, toggleable from devtools). That's not suitable for gating production, so Phase 3 uses a server-side env var instead.

---

## Phase 1: Cleanup (committed)

### PR 1 · `chore/remove-spring-sale`

Remove the spring sale completely.

- Delete `lib/sale.ts` and `app/spring-sale/`. Permanently redirect `/spring-sale` → `/packages` (it was a Meta ad landing page; old links shouldn't 404).
- Header: remove the desktop sale toggle/panel and mobile sale bar. `layout.tsx` padding → `pb-16`. Remove `mobile-menu.tsx` `bottomOffset`.
- `conditional-footer.tsx`: drop the `/spring-sale` entry.
- `date-picker.tsx`: remove the sale date tint and legend.
- `builder-card.tsx`: remove `SpringSaleRow`, `sale=1`, discount display.
- `book/page.tsx` / `booking-form.tsx`: remove the `sale` param, `springSale` prop, discount math.
- `BookingFormSchema`: remove `springSale`. Admin route: remove the discount line item. Email preview fixtures: remove the sale line.
- No reuse planned. `/spring-sale` was a Meta ad page; the Passion Projects page is a different thing and is built from scratch. (Only the `sale=1` builder→`/book` handoff is a useful _pattern_ for `?apply=1` later. It's a few lines and easy to rewrite.)
- Verify: `/book`, `/package-builder`, header on desktop + mobile menu, light/dark.

### PR 2 · `refactor/shared-pricing`

The same "what does this modifier add to the price" rule (slider steps × price per step, incrementer units × price per unit, flat checkbox/toggle delta) is written out separately in four places:

| Where                              | What it does                                                            |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `book/page.tsx` (server)           | Total shown on `/book`                                                  |
| `book/booking-form.tsx` (client)   | Per-line prices in the summary panels                                   |
| `package-builder/builder-card.tsx` | Live price in the builder                                               |
| admin `lib/modifiers.ts`           | Line items in the admin booking page, both emails, and the resend route |

They agree today. But any pricing change (a new modifier type, a rule like the location → 90-minute minimum) has to be made four times, and nothing tests that they still match. This PR makes it one tested module. It's the most cuttable item in Phase 1: Phase 2 doesn't change pricing, so it could move to Phase 3, where a builder on a second page would add a fifth copy.

- `packages/core/src/pricing.ts`: `modifierDelta`, `estimateTotal`, `resolveSelectedModifiers`, `buildModifierLineItems`. Pure functions with unit tests covering each modifier type.
- `/book` (server + client), the builder, and admin (booking route, detail page, resend route) all use it.
- No behaviour change. Verify totals on `/package-builder` → `/book` → admin detail match for each package, before and after.

### PR 3 · `refactor/booking-form-structure`

Split `booking-form.tsx` before Phase 2 adds fields to it.

- Extract the field groups into `book/booking-fields/` (location, date/time, contact, notes) and one `SelectionSummary` component used for both the mobile and desktop layouts.
- `BookingForm` takes a single `selection` object (package, modifiers, values, total) instead of four props. This is also what a future landing page needs.
- No visual change.

---

## Phase 2: Booking flow improvements (committed)

These are permanent, site-wide features (the spec: "Referrals are a permanent site-wide feature; Passion Projects is the first user"). They go live on `/book` when released, with **no flag**. Referrers can earn vouchers from the first release onwards.

### PR 4 · `feat/referrals-schema`

- Prisma migration, all additive and nullable:
  - `BookingRequest`: `locationIdeas`, `referrerName`, `referrerContact`, `voucherCodeEntered`, `heardFrom` (`String?` columns).
  - `Voucher` model: `code` (unique, `EAC-XXXX`), `type` (`VoucherType` enum, `REFERRAL` only for now), `amountCents`, `status` (`PENDING`/`ACTIVE`/`REDEEMED`/`VOID`), `activatedAt`/`redeemedAt`/`voidedAt`, `expiresAt`, `referrerName`/`referrerContact`, `holderName`/`holderContact`, `sourceBookingId` (unique → BookingRequest, **`onDelete: Cascade`**), `redeemedBookingId` (→ BookingRequest, `SetNull`), `notes`, timestamps.
- `packages/core`:
  - `referrals.ts`: `REFERRAL = { amountCents: 1500, expiresAt: '2027-12-31' }`, the single source for the "$15" UI copy and the amount stamped on new vouchers. Also `HEARD_FROM_OPTIONS`.
  - `vouchers.ts`: `generateVoucherCode()` (alphabet without 0/O/1/I/L, `crypto.randomInt`), `normalizeVoucherCode()`.
  - `BookingFormSchema`: the new optional fields plus a honeypot. Voucher admin schemas.
- Tests: schema validation, code format/alphabet.
- Nothing visible.

### PR 5 · `feat/bookings-persist-referrals`

- Admin `POST /api/public/bookings` saves the new columns. When `referrerName` is present, it creates one `PENDING` `REFERRAL` voucher in the **same transaction** (holder defaults to referrer; amount and expiry from `REFERRAL`), retrying on a code collision. The honeypot returns 200 without saving.
- Deleting a booking deletes the referral voucher it created (DB cascade). If the deleted booking is where a voucher was _redeemed_, the voucher stays `REDEEMED` and just loses the link.
- Route tests: with/without referrer, collision retry, honeypot, delete cascades.
- Nothing visible yet (no form sends the fields).

### PR 6 · `feat/book-referral-fields`

- `/book`:
  - "Anywhere in mind?" under city.
  - "Did someone send you my way?". Referrer contact appears once a name is entered, with a note built from `REFERRAL.amountCents`.
  - Voucher code field.
  - "How did you hear about this?" select.
- Confirmation panel: if a voucher code was entered, say "Your voucher code will be confirmed by email." No amount, price summary unchanged.
- Start with everything visible as the spec describes. Progressive disclosure beyond referrer contact is decided at the checkpoint.
- Mobile widths, light/dark, keyboard + `aria-*`.

### PR 7 · `feat/booking-emails-referrals`

- Notification: location ideas, referrer + contact, voucher code entered + whether it matches a known voucher (status, holder), heard-from, the generated referral code.
- Confirmation: amount-free voucher line when a code was entered.
- Resend route rebuilds from the new columns. Fix the notification subject line.

### PR 8 · `feat/admin-bookings-referrals`

- Booking detail:
  - delete confirmation names any voucher that will be deleted with it, and its status
  - new fields
  - "Referral" section (referrer, contact, link to the voucher it created)
  - "Voucher entered" card (match status, holder, amount, link), with a manual **"Mark redeemed on this booking"** button when it matches an active voucher
  - flag when the referrer name matches the booker
- Booking list: referral indicator.

### PR 9 · `feat/admin-vouchers`

- "Vouchers" in `AdminShell`.
- `/vouchers` list: status filter, copy-code, referrer + holder, source/redeemed links, computed "Expired" badge (no cron; Reed voids manually).
- `/vouchers/[id]`: change status (stamps the matching timestamp), edit holder, mark redeemed against a booking, notes.
- `/vouchers/new`: manual create.
- API under `/api/vouchers`, all `requireAdminSession`. Route tests.

### ✋ Checkpoint

Reed uses the updated `/book` flow on Preview and/or production, with real referrals and vouchers flowing through admin and email. Decide:

- How the form feels. Which fields to hide behind links, merge, or drop (candidates: voucher code, preferred time, notes).
- Whether the landing page form should be one step or two.
- Which builder controls the landing page shows (spec: "time and image modifiers"; there are 4–5 per package).

Then rewrite Phase 3 below with those answers before starting it.

---

## Phase 3: Passion Projects (draft, revisit after checkpoint)

Everything here sits behind **`PASSION_PROJECTS_ENABLED`**, a server-side env var in both apps (`true` in local + Vercel Preview, `false` in Production until launch). Launch is an env change + redeploy in Vercel, not a code release. Afterwards it doubles as the "close the round" switch.

Rough shape, in order:

1. **Flag + campaign schema.** `campaigns.ts` (`id: 'passion-projects-fw26'`, eligible slugs `['evryday-package', 'together', 'in-practice']`), flag helpers in both apps, and migration: `BookingRequest.campaign` (indexed), `campaignAnswers` (JSON, incl. `acknowledgedAt` + `ackVersion`), `applicantStatus` enum. The server stamps the campaign; the client only sends `applyToCampaign`.
2. **Apply toggle on `/book`.** Eligible packages only, with `?apply=1` passed through from the builder (the old `sale=1` pattern). Campaign fields with progressive disclosure, plus API persistence and validation.
3. **Campaign in emails + admin.** Campaign block in the notification email, applicant status control, campaign filter on the bookings list.
4. **`/passion-projects` landing page, built from scratch.** An all-in-one _home_ for the campaign: the story, who Reed is looking for, how it works, referrals, a features section (empty state for now), and a clear way to apply. Metadata, sitemap, static OG placeholder.
   - **How applying works is open.** The spec asks for routing questions + an embedded builder + the full form on the page. After the checkpoint we may instead have the routing questions pre-select a package and hand off to the existing builder → `/book?apply=1` flow. That's less to build, and it doesn't put a second copy of a long form on the page.
   - Only if we choose the embedded version: extract builder state (`usePackageBuilder` + `ModifierRows`) so the builder and form can live on one page.
5. **Nav item + home block.**
6. **Launch:** flip the flag in production.

Parked until then: announcement bar, distinct applicant confirmation email (stretch), home block placement.

---

## Risks

- **Timeline.** Phases 1–2 are about 9 PRs. Phase 3 depends on checkpoint feedback, so it's realistically squeezed against Nov 6. Handing off to the existing builder → `/book` flow (Phase 3, step 4) is the lighter option if time is short.
- **Production rollout.** Each release runs `pnpm db:deploy` on the Neon production branch. All Phase 2 migrations are additive/nullable. Smoke-test admin on production after the first migration release.
- **PRs 2–3** touch the live booking path. They're mitigated by having no behaviour change, pricing unit tests, and before/after total checks.
- **Slugs** are editable in admin. Renaming an eligible package's slug would break campaign eligibility.
