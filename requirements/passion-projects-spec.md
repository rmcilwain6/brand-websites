# Passion Projects: Requirements Spec

**Brand:** Evryday Archive Co
**Apps affected:** `apps/evrydayarchive-web`, `apps/admin`, `packages/core`, `packages/db`
**Target:** campaign launch Fri Nov 6, 2026. Backend, voucher table, and email changes ideally done by Nov 2; landing page and home page block by Nov 4.
**Status:** ready to build. Visual design for the campaign is still in progress (see Section 9).

---

## 0. How to use this spec

This spec describes what the site should do. It is not a line-by-line implementation plan.

- Items marked **Decided** were settled with Reed and should be built as written.
- Everything else is guidance. Use judgment on implementation details (schema shape, component structure, file layout), following the conventions in `CLAUDE.md` and `AGENTS.md`.
- **If anything here contradicts itself, contradicts the existing codebase in a way that matters, or is unclear enough that you would be guessing, stop and ask Reed before building that part.** A short question is always better than a confident wrong guess. Note your assumptions in the PR description when you make small ones.
- Copy in this spec is placeholder direction, not final wording. Reed will refine copy. Keep strings easy to find and edit.

---

## 1. Context

Passion Projects is a fall/winter 2026 campaign (launch through roughly March 2027). Reed is asking his network to help him find people putting real time into a craft, a project, or a business, so he can photograph them and tell their story.

Core idea (for tone, not for verbatim use everywhere):

> Somewhere close by, someone is putting years into a craft, a project, or a business. They deserve to have that story told, in photographs and in their own words, even if they wouldn't think to ask. I'd like to tell it, and I need your help finding them.

How it works for a client:

- They book a normal session at normal pricing and tick **"Apply to be featured in Passion Projects."**
- Featured subjects get a recorded conversation during the shoot and a story-led feature on the website and Instagram. They review the story before it goes live.
- Reed chooses features for variety. Anyone not featured still gets their session.
- Whoever referred them gets a voucher for a future session.

Goal: a published first edition with at least 8 profiles by March.

The campaign voice is first person (Reed speaking). This intentionally relaxes the brand's usual "we" for this campaign.

---

## 2. Scope

### In scope for this build

1. Booking flow changes on **all** booking surfaces (new fields, referral field, voucher code field)
2. Passion Projects application fields behind an apply toggle
3. A campaign value stored on bookings (replaces the spring sale boolean pattern)
4. A voucher table, automatic referral voucher creation, and an admin view
5. Resend email updates so the new information shows up
6. A `/passion-projects` landing page with a combined package routing + builder + booking form
7. A Passion Projects block on the home page
8. A Passion Projects nav item

### Out of scope (follow-up work, do not build now)

- Admin switch to close the round (hide the toggle, show a "round closed" message)
- A send-code button / email that delivers voucher codes to holders
- Referral links that prefill the referrer field (e.g. `?ref=`)
- Funnel analytics events
- Automatic voucher validation or automatic price adjustment
- The feature article template and features index (separate task, later)
- Privacy policy and terms pages (separate task)
- Final campaign visual identity (separate task, see Section 9)

If something you are building would be much easier with one of these in place, flag it rather than quietly building it.

---

## 3. Packages and the campaign rule

**Decided:** Passion Projects is an application attached to an existing package. It is not a package of its own.

Eligible packages: **Evryday** (`evryday`), **Together** (`together`), **In Practice** (`in-practice`). As It Unfolds is not eligible.

**Decided:** the package follows what the photos are for.

- Personal project or hobby, one person: Evryday
- Personal project or hobby, two or more people: Together
- Business or commercial use: In Practice. Commercial work is a higher rate because more effort goes into aligning with a professional brand.

All three keep their normal pricing and modifiers. Evryday's default duration stays at 45 minutes.

The `/inquire` recommendation logic (`apps/evrydayarchive-web/app/inquire/recommendation.ts`) already maps `business` to `in-practice` and group answers to `together`. Reuse or stay consistent with that mapping where it helps. The `/inquire` questionnaire itself is being reworked separately; avoid changes that would conflict with it, and ask if the two start to overlap.

---

## 4. Booking fields

### 4.1 Existing fields (unchanged)

From `packages/core/src/schemas/booking-form.ts`:

| Field                               | Required |
| ----------------------------------- | -------- |
| Location (city)                     | Yes      |
| Preferred date                      | Yes      |
| Preferred time                      | No       |
| Full name                           | Yes      |
| Email                               | Yes      |
| Phone                               | No       |
| Anything else I should know (notes) | No       |

### 4.2 New fields on all booking surfaces

These apply to `/book` (reached from the package builder) and to the landing page form.

| Field                        | Required | Notes                                                                                                                                                                                                                                    |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location ideas               | No       | Sits directly under city. Prompt along the lines of: "Anywhere in mind? A market, your studio, a park, your home."                                                                                                                       |
| Referrer name                | No       | Prompt along the lines of: "Did someone send you my way?" Inline note: "If you book, the person who sent you gets $25 off a session."                                                                                                    |
| Referrer contact             | No       | Shown once a referrer name is entered. **Decided:** open text field, store whatever is typed (Instagram handle, email, phone). No parsing or validation.                                                                                 |
| Voucher code                 | No       | Dedicated field, not the notes field. **Decided:** confirmation copy must not state an amount, since voucher values vary. Something like "Your voucher code will be confirmed by email." **Decided:** the price summary is not adjusted. |
| How did you hear about this? | No       | Select: tagged in a post, a friend, Instagram, the website, other.                                                                                                                                                                       |

The $25 in the referrer note is the current referral amount. Keep it in one easy-to-change place rather than scattered through components.

### 4.3 Passion Projects fields (shown only when the apply toggle is on)

| Field                                    | Required (when toggle is on) | Notes                                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apply to be featured in Passion Projects | n/a                          | Checkbox/toggle. Available for Evryday, Together, and In Practice only.                                                                                                                                                                                                                         |
| What are you working on?                 | Yes                          | One line. E.g. "A sewing business." "Restoring a 1972 sailboat." Reed scans this for variety.                                                                                                                                                                                                   |
| Tell me a bit about it                   | No                           | Short textarea. Prompt with how long they've been at it and what a typical day of it looks like.                                                                                                                                                                                                |
| Link to the work                         | No                           | Instagram, website, or shop. Light validation is fine; do not reject handles that aren't URLs.                                                                                                                                                                                                  |
| Anyone else involved?                    | No                           | Bandmates, staff, a partner. Helps flag sessions that are really Together.                                                                                                                                                                                                                      |
| Feature acknowledgement                  | Yes                          | Checkbox: featured sessions include a recorded conversation and a story on the website and Instagram, reviewed by the subject before publishing. Wording should match the client contract's feature section, which is still being written; use placeholder wording and leave it easy to update. |

### 4.4 Toggle availability

- **Landing page:** toggle is checked by default.
- **Regular `/book` flow:** toggle is available but unchecked by default, for eligible packages only.
- Support pre-selecting the toggle via a URL parameter so the landing page and home block can link into it. The spring sale used `?sale=1` on `/book`; a similar pattern is fine.

### 4.5 Form principle

**Decided:** keep the form as short as possible. Long forms hurt applications and the feel of the brand. Every new field except "What are you working on?" and the acknowledgement is optional. Use progressive disclosure (e.g. referrer contact only after a name, campaign fields only when the toggle is on). If the form starts to feel heavy, raise it.

---

## 5. Data and storage

The current flow stores most booking details in `Inquiry.payload` (JSON) with a thin `BookingRequest` row (`apps/admin/app/api/public/bookings/route.ts`). This build will need schema changes and a migration. The exact schema shape is up to you; below is what it needs to support.

### 5.1 Booking data

A booking needs to be able to record:

- **Campaign value.** **Decided:** a campaign identifier, e.g. `passion-projects-fw26`, rather than a boolean, so a spring round needs no schema change. Bookings without a campaign have none. Reed should be able to filter bookings by campaign in the admin.
- Passion Projects answers (Section 4.3). These may change between rounds, so a flexible structure is reasonable.
- Location ideas
- Referrer name and referrer contact
- Voucher code entered by the booker (raw text)
- How did you hear about this
- **Applicant status** for campaign bookings: pending, accepted, not featured. Reed sets this manually in the admin.

### 5.2 Spring sale cleanup

The spring sale ended May 31, 2026. Its `springSale` boolean flows through the builder (`package-builder/builder-card.tsx`), `/book`, the booking schema, the admin route (discount line item), the header, and `/spring-sale`.

**Decided:** replace the spring sale boolean pattern with the general campaign value, reusing what's useful from how the sale was wired (URL param handoff, auto opt-in helpers, header behaviour). Removing dead spring sale code and the `/spring-sale` route is in scope. If anything spring-sale related looks like it's still used elsewhere, or removing it would change historical data, ask first.

### 5.3 Voucher table

**Decided:** a single combined table. One row per voucher, with referrer details on the row. No separate referrers table.

Each voucher needs:

| Field                              | Notes                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Code                               | **Decided:** format `EAC-XXXX`, 4 random characters. Exclude confusable characters (0/O, 1/I/L). Must be unique.                 |
| Type                               | e.g. `referral`. Other types are created manually later.                                                                         |
| Amount                             | **Decided:** stored per voucher, never hardcoded in UI or email copy. Referral vouchers are $25 (2500 cents).                    |
| Original referrer name and contact | For referral vouchers.                                                                                                           |
| Current holder name and contact    | Defaults to the referrer. Editable when a voucher is transferred.                                                                |
| Source booking                     | **Decided:** link to the booking that named the referrer, so every referral voucher traces back to the booking that produced it. |
| Redeemed-on booking                | Link to the booking it was used on, when redeemed.                                                                               |
| Status                             | See below.                                                                                                                       |
| Status timestamps                  | When it moved to each status.                                                                                                    |
| Expiry                             | **Decided:** referral vouchers expire Dec 31, 2027.                                                                              |
| Notes                              | Free text for Reed. Optional but useful.                                                                                         |

**Statuses (Decided):**

1. **Pending.** Created automatically on a booking request that names a referrer. Not yet usable.
2. **Active.** The holder has been sent their code. Reed sends codes manually (email, text, socials) and flips this himself.
3. **Redeemed.** Used on a booking.
4. **Void.** Cancelled, invalid, or expired.

**Rules (Decided):**

- A referral voucher is created automatically, with a generated code, whenever a booking request includes a referrer name. One referral voucher per booking.
- Referral vouchers are created whether or not the booking is a campaign booking or ends up featured. Referrals are a permanent site-wide feature; Passion Projects is the first user.
- Self-applications (no referrer) create no voucher.
- One-time use. Stacks with any builder adjustments.
- Transferable: the holder contacts Reed and Reed edits the current holder.
- Validation and redemption are manual for now. Design the table so automatic validation could be added later.

Open questions to raise if they come up: whether a referrer named on a booking that later gets cancelled should have their voucher auto-voided (default: no, Reed voids manually), and how to handle the same person being named as referrer several times (default: separate vouchers, one per booking).

---

## 6. Admin

Extend the existing admin (`apps/admin/app/bookings`, `AdminShell`). Match existing admin patterns.

### 6.1 Bookings

- Show all new booking fields on the booking detail page.
- Show the campaign value and Passion Projects answers clearly when present.
- Let Reed set the applicant status (pending / accepted / not featured).
- Filter the bookings list by campaign.
- Link from a booking to any voucher it created (source) and any voucher it redeemed.
- **Decided:** when a booker entered a voucher code, show whether it matches a voucher in the table, and that voucher's status and holder. This is informational only; it does not change anything automatically. Redeeming is still Reed's manual action.

### 6.2 Vouchers

A new admin section:

- List with filter by status and type
- Easy copy of a code
- Referrer and current holder contact visible
- Links to source and redeemed-on bookings
- Change status (with timestamps recorded)
- Edit current holder
- Mark redeemed against a booking
- Create a voucher manually (type, amount, holder, expiry, notes)

No send-code button in this build.

---

## 7. Email (Resend)

Templates live in `apps/admin/emails/` (`booking-confirmation.tsx`, `booking-notification.tsx`) and are sent from `apps/admin/app/lib/email.ts`.

**Baseline (in scope):**

- Reed's notification email shows every new field: campaign value, Passion Projects answers, location ideas, referrer name and contact, voucher code entered (and whether it matches a known voucher, if cheap to include), how they heard, and the generated referral voucher code if one was created.
- The client confirmation stays largely the same. If a voucher code was entered, it says the code will be confirmed by email, with no amount.
- Remove the spring sale discount line item logic.

**Stretch (only if time allows, ask before starting):** a distinct confirmation email for Passion Projects applicants, explaining that Reed replies within 24 to 48 hours, usually sets up a short call, and chooses features for variety with photos either way.

---

## 8. Public pages

### 8.1 Navigation

**Decided:** add **Passion Projects** as the right-most item in the header nav (after Packages), linking to `/passion-projects`. It sits before the Inquire button if that button is separate from the nav list. Check desktop and the mobile menu (`mobile-menu.tsx`). If it doesn't fit cleanly at some breakpoint, raise it rather than shrinking type or hiding other items.

### 8.2 Home page block

**Decided:** add a Passion Projects block to the home page (`apps/evrydayarchive-web/app/page.tsx`).

- A short headline and one or two lines in the campaign voice
- An image slot (placeholder for now)
- A link to `/passion-projects`
- Reuse existing home page section patterns (`Frame`, `Placard`, existing section spacing). Placement is your call; somewhere after the hero and before the footer, where it reads as a current invitation. Note the choice in the PR.

### 8.3 Landing page: `/passion-projects`

**Decided:** one page that explains the campaign and lets someone apply without leaving it.

Suggested structure (adjust if a different order reads better, and note why):

1. **Hero.** Image slot plus the campaign line ("I need your help.") and a short version of the core idea.
2. **What this is.** Who Reed is looking for, with a few specific examples (makers, musicians, market vendors, people building small businesses, other photographers, people who love their work).
3. **How it works.** Book a session, a conversation while shooting, a story on the site and Instagram, review before it goes live. Features are chosen for variety; everyone who applies gets photographed either way. Reed replies within 24 to 48 hours, usually with a short call.
4. **Referrals.** If you send someone and they book, you get $25 off a session.
5. **Features.** Section that will list published features. For now an empty state, e.g. "First features coming this winter."
6. **Apply / book.** The combined form (below).

**Combined booking section:**

- Two routing questions, shown prominently at the top of the section:
  1. Is this a personal project or a business?
  2. Is it just you, or are other people involved?
- **Decided:** answers pre-select the package. Personal + just me = Evryday. Personal + others = Together. Business = In Practice (regardless of the second answer).
- **Decided:** not locked. Changing an answer updates the builder, and the user can also switch package directly.
- **Decided:** short copy explains why each package was chosen. For In Practice, mention that commercial work takes more effort to align with a professional brand.
- Below that, the builder for the selected package only (time and image modifiers, live price), limited to the three eligible packages. Reuse the existing builder logic (`package-builder/builder-card.tsx`) rather than duplicating pricing logic. Do not embed the full multi-package builder page.
- Then the booking fields from Section 4, with the apply toggle checked by default.
- One submit, through the same API and Resend flow as other bookings.

Also:

- SEO metadata and canonical URL, consistent with other pages
- Add to `sitemap.ts`
- OG image: use a static placeholder for now. A dynamic OG image system is a separate task; don't build it here.
- Works in light and dark mode
- Mobile first; test at phone widths

---

## 9. Design status

**Decided:** the campaign's visual identity is not finished. For this build:

- Scaffold all functionality using existing site components, typography, colours, and spacing.
- Mark image slots and campaign-specific copy clearly as placeholders so they can be swapped later.
- Structure components so a later design pass (different colour ratios, a quote typeface, an arch motif, issue numbering) can be applied without restructuring.
- Do not invent a new visual style.

---

## 10. Acceptance checklist

- [ ] `/book` shows the new fields; referrer contact appears only after a referrer name
- [ ] Apply toggle appears for Evryday, Together, In Practice only; campaign fields appear only when it's on
- [ ] Acknowledgement is required when the toggle is on; "What are you working on?" is required when the toggle is on
- [ ] Submitting with a referrer name creates exactly one Pending referral voucher with a unique `EAC-XXXX` code, linked to the booking
- [ ] Submitting without a referrer creates no voucher
- [ ] Entering a voucher code stores it, shows amount-free confirmation copy, and does not change the price
- [ ] Bookings store the campaign value; admin can filter by it
- [ ] Admin booking detail shows all new fields, applicant status control, voucher links, and voucher-match info
- [ ] Admin voucher section supports list, filters, status changes, holder edits, manual creation, marking redeemed
- [ ] Reed's notification email includes all new fields and any generated code; client email handles voucher copy with no amount
- [ ] Spring sale boolean and dead paths removed or replaced (after confirming nothing else depends on them)
- [ ] `/passion-projects` routing questions pre-select the package and can be changed; builder and price update
- [ ] Landing page submit works end to end
- [ ] Home page block links to `/passion-projects`
- [ ] Nav shows Passion Projects as the right-most item on desktop and in the mobile menu
- [ ] Light and dark mode, mobile widths checked
- [ ] Migration committed; `pnpm format`, `lint`, `typecheck`, `build` pass; tests added or updated for schema validation and voucher code generation

---

## 11. Suggested order

1. Schema and migration (campaign value, new booking fields, voucher table)
2. `packages/core` validation updates
3. Admin API: persist new fields, create referral vouchers
4. `/book` form fields and toggle
5. Emails
6. Admin bookings and vouchers UI
7. Spring sale cleanup
8. `/passion-projects` page and combined form
9. Home page block and nav

Commit granularly as `CLAUDE.md` describes. Open questions go to Reed, not into guesses.
