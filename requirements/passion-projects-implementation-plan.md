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
| **3. Passion Projects**          | The campaign layer on top: apply toggle and campaign fields, `/passion-projects` landing page, nav, home block. Goes live with the launch release.                           | **Draft.** Revisit after the checkpoint. |

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

**There is no feature flag (decided Nov 1).** Phase 3 merges to `main`, which doesn't touch production, and publishing a release is the launch. So **nothing from `main` is released until the campaign is ready to go live.** Web previews talk to the production admin API, so test this work locally. Closing a round later is a code change and a release, until the admin switch in the spec's follow-up list exists.

Target dates follow the Notion tasks: booking side by **Nov 2**, landing page by **Nov 4**, launch **Nov 6**.

### PR 10 · `feat/campaign-schema`

- `packages/core/src/campaigns.ts`: `{ id: 'passion-projects-winter-2026', eligibleSlugs: ['evryday-package', 'together', 'in-practice'], ackVersion: 1 }` plus `isCampaignEligible(slug)`.
- Migration (additive, nullable): `BookingRequest.campaign String?` (indexed), `campaignAnswers Json?` (`whatWorkingOn`, `aboutIt`, `link`, `othersInvolved`, `acknowledgedAt`, `ackVersion`), `applicantStatus ApplicantStatus?` with enum `PENDING | ACCEPTED | NOT_FEATURED`.
- `booking-form.ts` schema: client sends `applyToCampaign: boolean` and `campaignAnswers`. When `applyToCampaign` is true, `whatWorkingOn` and the acknowledgement are required. Link is free text, not URL-validated.
- Admin `/api/public/bookings` looks up the package and, when it's eligible, stamps `campaign`, `applicantStatus = PENDING`, `acknowledgedAt` and `ackVersion`. Otherwise the application is dropped quietly so it can't fail the booking. Route tests for ineligible package, missing required answers.

### PR 11 · `feat/book-campaign-optin`

- `app/book/booking-fields/campaign-fields.tsx`: the opt-in checkbox and disclaimer, always visible so someone new to the campaign can decide, and the §4.3 fields, revealed on check. Rendered only when the selected package is eligible.
- Placement: its own `BookingStep` after contact details and before notes, so it reads as a deliberate choice and not part of the required path. Confirm locally.
- Disclaimer and acknowledgement copy live in one constant next to `ackVersion`. The contract feature section isn't written yet, so ship placeholder wording and bump `ackVersion` when the contract lands.
- `/book?package=<slug>&apply=1` pre-checks the box. `/package-builder` carries `apply=1` through to `/book` when present, and the "Back to builder" link keeps it. `/book?apply=1` with no package has nothing to apply against, so it redirects to `/package-builder?apply=1`.
- The step list and the "Three short steps" copy on `/book` are hardcoded today; both need to handle the optional extra step.
- Revisit the "How did you hear about this?" options so they match how people would answer. Instagram already covers being tagged in a post.
- Selection summary shows a small "Applying to Passion Projects" line when checked.

### PR 12 · `feat/campaign-emails-admin`

- Reed's notification email: campaign block with the answers and acknowledgement timestamp. Client confirmation gets one added line acknowledging the application. The distinct applicant confirmation email stays a stretch.
- Admin bookings: campaign badge on the list, campaign filter, applicant status control on the booking detail.
- Booking detail also shows the campaign answers and when they were acknowledged, next to the status control (spec §6.1).
- Accepted and not-featured replies: stored as templates in `apps/admin/app/lib/campaign-replies.ts` and shown on the booking detail for the chosen status, for Reed to copy and send by hand. The wording is a draft until Reed writes the final copy.

### PR 13 · `refactor/builder-state`

- Extract `usePackageBuilder(pkg, initial?)` from `app/package-builder/builder-card.tsx` (624 lines, all state in local `useState`). Returns items, price breakdown, a `selection` in the shape `/book` already consumes, and `reset(pkg)`.
- `BuilderCard` becomes a view over the hook. `/package-builder` behaviour and output URLs unchanged. Pricing parity tests against current totals for all eligible packages.
- Check that `BookingForm` handles a `selection` prop that changes after mount (it is only fed from URL params today). Fix any state that assumes the selection is fixed for the form's lifetime.

### Design decisions (Oct 31)

Settled on the design canvas and recorded on the Notion task "Passion Projects: visual identity discovery". What the build needs:

- **Type.** Newsreader (Google Fonts, via `next/font`, optical size axis) for campaign headings, names, quotes and feature body text. Plus Jakarta Sans stays for UI. JetBrains Mono for placard place/date lines and catalogue numbers.
- **Naming.** Editions are seasons (`Winter 2026`, then `Spring 2027`); stories are `Feature 01`, `Feature 02`. The campaign id is `passion-projects-winter-2026`.
- **Masthead strip.** Sun-coloured strip, "Passion Projects" in Newsreader, season in mono, feature number or count right-aligned, 2px orange bottom border. Desktop: directly under the sticky nav. Phone: first element on the page above the fixed bottom nav, with only the name on the left and the season on the right. It scrolls with the page on every breakpoint; it is never sticky. The same strip (orange top border) is the page footer, and it touches the site footer. As built, phones show wall photos 01 to 11 in number order at full width; `wall.test.ts` keeps the numbers consecutive and the rows free of holes when the spans change.
- **Orange band.** Full-width `#F06F42` with `#1b1a19` Newsreader text. One per page, used for the main ask or a pull quote. Buttons keep white text on orange.
- **Arch frames** mean "feature": `border-radius: 999px 999px 0 0` image with a 4–5px orange line under it. Used for feature cards only.
- Light and dark mode for everything.

### PR 14 · `feat/passion-projects-design`

- Newsreader via `next/font`, loaded in `app/passion-projects/layout.tsx` and exposed as a `font-campaign` Tailwind family. Not `font-serif`, which the site's decorative quote marks already use. PR 17's home block needs to load the font too if it uses it.
- Shared components under `app/passion-projects/_components/`: `MastheadStrip` (props: season, right label; `as="header" | "footer"`), `OrangeBand`, `ArchCard` (image, feature number, name, one-liner, href), `SectionHeading`, and the existing `Placard` with a mono subline variant.
- An `accent-text` colour token for small orange text, since the brand orange is too light to read at that size in light mode.
- Check the components on a temporary preview route (`/passion-projects/preview`, not indexed). **Delete it before launch.**

### PR 15 · `feat/passion-projects-page`

- Route `/passion-projects`.
- Page order: masthead strip → salon wall with the hero text placed in its top-left (grid cols 1–5, rows 1–11) → features row → how it works → orange referral band ("Somebody you know is working on something.", the $15 note, share button) → staged apply flow → masthead footer.
- **Salon wall.** 12-col grid, 40px rows, 12px gap, `grid-auto-flow: dense` on desktop; 6-col, 30px rows, 6px gap on phone. Slots come from `app/passion-projects/wall.ts` (image, alt, title, place, date, desktop span, phone span or `null` for desktop-only). The slot list and shapes are on the Notion landing page task ("Wall plan"); Reed fills it with photos exported as webp next to the home page images. Each frame has a number button: placard slides up on hover and focus (desktop); below 1024px, tapping a photo opens one caption bar instead, `aria-expanded` on the button, no transition under `prefers-reduced-motion`.
- **Features row.** Hidden when no features are published. Arch cards in a row: desktop shows four, previous/next buttons slide by four (transform transition, disabled at the ends, counter like "1–4 of 9"); phone is a native horizontal scroll with `scroll-snap-type: x mandatory` and the next card peeking. A season tab is added when Spring 2027 starts, not now.
- **Apply flow** (`id="apply"`, hero button scrolls to it smoothly, jump under reduced motion):
  1. **Questions.** Personal project or business? Just you or others involved? personal + solo → Evryday, personal + others → Together, business → In Practice. Chips with `aria-pressed`. Nothing below shows until both are answered. "Others too" also turns on In Practice's "Multiple people" toggle (2+ people, +$50), which the person can still change. It's found by that exact name in admin.
  2. **Package card.** Matched package name, base price, one-line reason, tabs to override with the other two eligible packages, then the builder rows from `usePackageBuilder` and the live total.
  3. **Booking steps.** `BookingForm` with the live selection; the Passion Projects step expanded and pre-checked; submit label "Send my application". Hide the step's "Find out more" link here, since it points at this page.
  - As built: the questions start unanswered, and the package card and booking steps appear together once there's a match, as in the mockup, with no separate "continue" step. The booking steps run in order, with the Passion Projects step's box ticked and its fields open when reached.
  - After sending, an application gets a signed note from Reed beside two wall photos, with a "Send someone my way" button, here and on `/book` (`app/book/campaign-confirmation.tsx`). A regular booking keeps the standard confirmation.
- Answers live in the URL (`?type=personal|business&people=solo|group&package=<slug>`), so refresh, back and shared links land in the same place.
- Changing an answer after editing the builder: if the matched package changes, the builder resets to that package's defaults with a one-line note; if it doesn't change, modifiers are kept. The form keeps its contents.
- Metadata, canonical, `sitemap.ts`, static OG placeholder.

### PR 16 · `feat/passion-projects-features`

Needed before the first feature publishes (target late November), not for launch.

- Content as MDX in `apps/evrydayarchive-web/content/passion-projects/<slug>.mdx`, frontmatter: `number`, `season`, `name`, `slug`, `intro`, `place`, `sessionDate`, `heroImage`, `archImage`, `oneLiner`, `published`. Unpublished files never build into pages or the features row.
- Route `/passion-projects/[slug]`, statically generated.
- Layout blocks as MDX components: `Entrance` (Feature number, name, intro, place and date, large print with placard), `Section` heading, body text in Newsreader, `Beside` (photo hung next to the passage), `QuoteBand` (orange), `Pinned` (sticky print beside a passage on desktop, inline on phone), `Pair`, `Run` (two to four photos, no text), `PullQuote`, `Referral` ("Know someone like …?"), `KeepReading` (arch cards for the other published features in the season).
- Masthead strip header shows the feature number; footer links to the next feature.
- The feature also appears in the hall's features row and sitemap once `published` is true.

### PR 17 · `feat/passion-projects-nav-home`

- Nav item and home page block (spec §8.1–8.2).
- As built: **Passion Projects** is the last header link, after Packages, on desktop and in the phone menu. Between 768 and 1024px the nav's gaps narrow and the logo leaves room for the "EST. 2025" stamp, which would otherwise run into "Portfolio".
- The block (`app/components/passion-projects-teaser.tsx`) sits between the philosophy section and Featured galleries, picked from the design canvas rounds (option P, frosted glass, at 60% blur). Eyebrow "Introducing Passion Projects", "I need your help.", the short paragraph, three arches ("Someone you know?", "A business you love?", "You?") with "Coming soon" tags, "Who would you put in the spotlight?" and "See how it works" → `/passion-projects`. Text beside the arches from `xl`, stacked below that; phones scroll the arches sideways.
- It's set in a file folder (canvas option 8C), in the filing cabinet's tab style: a "Winter 2026" tab on a cream folder, with a "Spring 2027" tab behind it (a dashed "+" tab was dropped: the Spring tab already says more seasons are coming). On hover the folder lifts a little, and each arch rises, its glass clears slightly and its sign gives a small rattle (option 13A). Hover only, not on touch screens, and nothing moves under reduced motion. The styles are in `globals.css` (`.pp-folder`, `.pp-teaser`). Hover and click styles for published features are left until the feature titles' layout is decided, and the rolling numbers were dropped.
- The arch photos are three portraits from past shoots with the blur baked into the files (`public/images/passion-projects/teaser-0*.webp`), so the sharp photos never reach the browser. Settings are in the component's comment. If the real features' photos go in later, blur them the same way.
- Loads Newsreader for the home page, for this block.

### PR 18 · `feat/passion-projects-assets`

Separate from #127. Waits on assets Reed is creating. The page works with the stand-ins until then.

- **OG share image.** Replace the placeholder (`/logo/og-image.jpg`) in `app/passion-projects/page.tsx` with Reed's image, 1200x630.
- **Wall photos.** Replace the stand-ins in `app/passion-projects/wall.ts`, keeping portrait photos in portrait slots and landscape in landscape. Check the phone crops, since slots 08 and 09 crop hardest. The note after applying uses two of these photos (`WALL[0]` and `WALL[2]`).
- **Caption style.** Reed may restyle the wall captions once the real photos are in.

### Launch (Nov 6)

- Add the "Multiple people" toggle to In Practice in production admin (1 person / 2+ people, +$50). It shows on `/package-builder` and `/book` as soon as it's saved.
- Publish a release. That runs the migration and puts the campaign live.
- Submit one test application through the landing page and one through `/book?package=<slug>&apply=1` and check admin and both emails. Void the test bookings afterwards.

### Fallback if the landing page slips past Nov 4

PRs 10–12 make `/book?apply=1` a complete way to apply on their own. If PR 13 or 15 runs late, launch with the content sections and routing questions, with the questions linking to `/package-builder` → `/book?apply=1`, and switch the stages in-page after launch. No content or copy is thrown away.

---

## Risks

- **Releases before launch.** With no flag, a release from `main` ships whatever campaign work has merged. An urgent production fix before launch has to branch from the `production` branch instead.
- **Timeline.** PRs 10–15 and 17 are needed for launch; PR 16 can follow before the first feature. The embedded landing flow (PRs 13 and 15) is the largest piece. See the fallback above.
- **Visual identity** is settled (see Design decisions above). Wall photos still need picking and exporting; PR 15 ships with the current home page images and PR 18 swaps them.
- **Acknowledgement wording** must match the contract feature section, which is due Nov 21. Ship placeholder copy with `ackVersion` so later changes are traceable per booking.
- **Production rollout.** Each release runs `pnpm db:deploy` on the Neon production branch. All Phase 2 migrations are additive/nullable. Smoke-test admin on production after the first migration release.
- **PRs 2–3** touch the live booking path. They're mitigated by having no behaviour change, pricing unit tests, and before/after total checks.
- **Slugs** are editable in admin. Renaming an eligible package's slug would break campaign eligibility.
