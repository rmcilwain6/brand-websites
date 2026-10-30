# Passion Projects: Implementation Plan

**Spec:** [`passion-projects-spec.md`](./passion-projects-spec.md)
**Status:** Phases 1–2 merged and checked on production. Checkpoint done Oct 29. Phase 3 rewritten below and ready to start.
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

### ✅ Checkpoint (done Oct 29)

Reed ran the updated `/book` flow on production with a real referral through admin and email. Answers:

- **Form feel.** Solid as it is and not overwhelming. Nothing hidden, merged or dropped.
- **Referral amount.** $15, as already set in `packages/core/src/referrals.ts`. The Notion brief has been brought in line.
- **Campaign opt-in.** Campaign fields sit behind an explicit checkbox ("Apply to be featured in Passion Projects"). Checking it expands the campaign fields (spec §4.3) plus a short disclaimer about what being featured involves. Unchecked by default on `/book`, checked by default on the landing page (spec §4.4).
- **Entry points.** Both. `/book` must support applying on its own, for people who wander into the regular flow.
- **Landing page form.** The full embedded version from spec §8.3, delivered as a staged flow: concept → routing questions → builder for the matched package → booking form with campaign fields. Earlier answers stay editable at every stage. Accepted as the bigger build because the page stays up for about six months.

---

## Phase 3: Passion Projects

Everything here sits behind **`PASSION_PROJECTS_ENABLED`**, a server-side env var in both apps (`true` in local + Vercel Preview, `false` in Production until launch). Launch is an env change + redeploy in Vercel, not a code release. Afterwards it doubles as the "close the round" switch.

Target dates follow the Notion tasks: booking side by **Nov 2**, landing page by **Nov 4**, launch **Nov 6**.

### PR 10 · `feat/campaign-schema`

- `packages/core/src/campaigns.ts`: `{ id: 'passion-projects-fw26', eligibleSlugs: ['evryday-package', 'together', 'in-practice'], ackVersion: 1 }` plus `isCampaignEligible(slug)`.
- Flag helper `isPassionProjectsEnabled()` in both apps, read from server env.
- Migration (additive, nullable): `BookingRequest.campaign String?` (indexed), `campaignAnswers Json?` (`whatWorkingOn`, `aboutIt`, `link`, `othersInvolved`, `acknowledgedAt`, `ackVersion`), `applicantStatus ApplicantStatus?` with enum `PENDING | ACCEPTED | NOT_FEATURED`.
- `booking-form.ts` schema: client sends `applyToCampaign: boolean` and `campaignAnswers`. When `applyToCampaign` is true, `whatWorkingOn` and the acknowledgement are required. Link is free text, not URL-validated.
- `/api/bookings`: the server stamps `campaign` and `applicantStatus = PENDING`, and only when the flag is on and the package is eligible. Otherwise `applyToCampaign` is dropped quietly so a stale tab can't fail the booking. Route tests for flag off, ineligible package, missing required answers.

### PR 11 · `feat/book-campaign-optin`

- `app/book/booking-fields/campaign-fields.tsx`: the opt-in checkbox, the disclaimer, and the §4.3 fields, revealed on check. Rendered only when the flag is on and the selected package is eligible.
- Placement: its own `BookingStep` after contact details and before notes, so it reads as a deliberate choice and not part of the required path. Confirm on Preview.
- Disclaimer and acknowledgement copy live in one constant next to `ackVersion`. The contract feature section isn't written yet, so ship placeholder wording and bump `ackVersion` when the contract lands.
- `/book?apply=1` pre-checks the box. `/package-builder` carries `apply=1` through to `/book` when present.
- Selection summary shows a small "Applying to Passion Projects" line when checked.

### PR 12 · `feat/campaign-emails-admin`

- Reed's notification email: campaign block with the answers and acknowledgement timestamp. Client confirmation gets one added line acknowledging the application. The distinct applicant confirmation email stays a stretch.
- Admin bookings: campaign badge on the list, campaign filter, applicant status control on the booking detail.
- Accepted and not-featured replies: copy from Reed, stored as templates Reed sends by hand for now.

### PR 13 · `refactor/builder-state`

- Extract `usePackageBuilder(pkg, initial?)` from `app/package-builder/builder-card.tsx` (624 lines, all state in local `useState`). Returns items, price breakdown, a `selection` in the shape `/book` already consumes, and `reset(pkg)`.
- `BuilderCard` becomes a view over the hook. `/package-builder` behaviour and output URLs unchanged. Pricing parity tests against current totals for all eligible packages.
- Check that `BookingForm` handles a `selection` prop that changes after mount (it is only fed from URL params today). Fix any state that assumes the selection is fixed for the form's lifetime.

### PR 14 · `feat/passion-projects-page`

- Route `/passion-projects`. Returns 404 while the flag is off in Production.
- Content sections per spec §8.3 (hero, what this is, how it works, referrals, features empty state), then the staged apply flow:
  1. **Questions.** Personal project or business? Just you or others involved? Answers map to a package: personal + solo → Evryday, personal + others → Together, business → In Practice. One line of copy explains the match.
  2. **Builder.** Revealed once both are answered. `usePackageBuilder` for the matched package only, with a switcher limited to the three eligible packages.
  3. **Booking form.** Revealed by a "Continue to booking" action under the builder. Reuses `BookingForm` with the live selection and the campaign checkbox pre-checked.
- Stage and answers live in the URL (`?type=personal|business&people=solo|group&package=<slug>&stage=build|book`), so refresh, back and shared links land in the same place.
- Changing an answer after editing the builder: if the matched package changes, the builder resets to that package's defaults with a one-line note; if it doesn't change, modifiers are kept. The form stays revealed and its contents are kept.
- Structure and spacing on existing tokens first, visual identity applied once it's settled. Works in light and `.dark`, tested at phone widths.
- Metadata, canonical, `sitemap.ts`, static OG placeholder.

### PR 15 · `feat/passion-projects-nav-home`

- Nav item and home page block (spec §8.1–8.2), both behind the flag.

### Launch (Nov 6)

- Set `PASSION_PROJECTS_ENABLED=true` in Vercel Production, redeploy, then submit one test application through the landing page and one through `/book?apply=1` and check admin and both emails. Void the test bookings afterwards.

### Fallback if the landing page slips past Nov 4

PRs 10–12 make `/book?apply=1` a complete way to apply on their own. If PR 13 or 14 runs late, launch with the content sections and routing questions, with the questions linking to `/package-builder` → `/book?apply=1`, and switch the stages in-page after launch. No content or copy is thrown away.

---

## Risks

- **Timeline.** Phase 3 is six PRs in eight days, and the embedded landing flow (PRs 13–14) is the largest piece. See the fallback above.
- **Visual identity** is due Oct 30 and feeds PR 14. Build structure on existing tokens so the page isn't blocked on it.
- **Acknowledgement wording** must match the contract feature section, which is due Nov 21. Ship placeholder copy with `ackVersion` so later changes are traceable per booking.
- **Production rollout.** Each release runs `pnpm db:deploy` on the Neon production branch. All Phase 2 migrations are additive/nullable. Smoke-test admin on production after the first migration release.
- **PRs 2–3** touch the live booking path. They're mitigated by having no behaviour change, pricing unit tests, and before/after total checks.
- **Slugs** are editable in admin. Renaming an eligible package's slug would break campaign eligibility.
