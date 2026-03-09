[evryday_archive_co_ui_design_requirements.md](https://github.com/user-attachments/files/25757224/evryday_archive_co_ui_design_requirements.md)

# Evryday Archive Co — UI Design & Requirements (Working Doc)

> Purpose: capture the **visual language, interaction model, and page-by-page requirements** for the public Evryday Archive Co website. This document is meant to be referenced by you + AI agents when building.

## 0) Non‑negotiables

- **Tone:** calm · warm · grounded.
- **Metaphor:** _Archive Gallery_ — documentation presented with care.
- \*\*Site should feel custom and “built,” not template‑portfolio.
- **Two distinct experiences in one UI:**
  - **Desktop:** mouse/keyboard first; scrolling + precise navigation.
  - **Mobile:** touch-first; gestures can be first-class, especially inside galleries.
- **Conversion goal:** make it easy to understand offerings and send an inquiry/booking request.
- **Performance goal:** photos must feel instant and smooth (no jank, no giant downloads).

---

## 1) Core design language

### 1.1 Visual motifs

1. **Paper Canvas**

- Warm off‑white background with subtle grain/speckle.
- Creates the feeling of a physical surface (gallery wall / desk).

2. **Frames & Mats**

- Photos appear as mounted pieces: mat border + soft shadow.
- Frames feel like objects placed on paper.

3. **Placards (Labels)**

- Small informational cards with title/subtitle/date.
- Used consistently: gallery titles, photo captions, packages, process steps, testimonials.

4. **Exhibit Typography**

- Large, quiet headlines and numerals (gallery signage feel).
- Avoid hype/sales tone.

5. **Curation, not chaos**

- Layout can be slightly offset/“pinned,” but always with underlying system rules.
- “Imperfect but consistent.”

### 1.2 Interaction motifs

- **Exhibit panels:** pages are composed of sections that read like exhibits.
- **Subtle motion:** fades + small translates; no loud animations.
- **Swipe language is contextual:**
  - Desktop: optional enhancement (trackpad drag), never required.
  - Mobile: gestures can be primary _inside galleries_.

---

## 2) Platform split: Desktop vs Mobile

### 2.0 Optional brand intro (splash) — "Sunrise" logo reveal

**Idea:** on first site entry, show a very subtle, smooth intro: a sunrise-like reveal where the logo emerges, then fades into the paper-canvas home.

**Primary goal:** intentional brand moment **without** harming perceived performance.

**Rules / guardrails:**

- **Optional + skippable:** tap/click to skip immediately.
- **Respect `prefers-reduced-motion`:** no animation; show static logo briefly or skip entirely.
- **Time-boxed:** target **350–700ms**; hard max **1200ms**.
- **Do not block critical rendering:** page can load behind; intro is an overlay that can fade out as soon as the home is ready.
- **Only show sometimes:** default to **first visit per device** (persist flag in localStorage), with an option to re-enable for special campaigns.
- **Never show on deep links** (e.g., someone lands directly on a gallery or packages).

**Implementation notes (high-level):**

- Full-screen overlay on paper canvas.
- Simple shapes/gradients + logo mark; avoid heavy video/lottie unless later justified.
- When the intro ends (or user skips), transition to Home entry sequence.

### 2.1 Desktop experience (mouse/keyboard)

**Navigation model**

- Standard top nav + deep links.
- Scroll is primary within pages.
- Galleries: click/keyboard arrows for photo navigation; optional drag/trackpad.

**Visual rhythm**

- More negative space.
- Exhibit layout: two-column compositions, wider margins.

### 2.2 Mobile experience (touch-first)

**Navigation model**

- Simpler primary nav (likely hamburger / bottom sheet) + strong CTAs.
- Within galleries, adopt a **gesture-first viewer**.

**Gesture map for Gallery Viewer (mobile)**

- **Vertical swipe (up/down):** move between galleries/exhibits (optional, see guardrails).
- **Horizontal swipe (left/right):** move between photos within current gallery.
- **Pinch-in:** zoom into photo (standard).
- **Intentional pinch-out (when zoomed-out / at base scale):** return to gallery overview.

**Guardrails to avoid “too social app”**

- Default pace feels slow:
  - Frictionless but not addictive.
  - No autoplay, no infinite dopamine loops.
- UI encourages pause:
  - Minimal overlays.
  - Clear “caption/placard” moment.
  - Optional “details” drawer.

---

## 3) Content hierarchy & CTA posture

### 3.1 Core user goals

1. See if the work fits them.
2. Understand what sessions cost and what they get.
3. Feel confident you’re professional + the process is simple.
4. Send an inquiry / request a slot.

### 3.2 CTA vocabulary (to decide)

- **Primary CTA:** `Inquire` OR `Book` OR `Check availability`.
- **Secondary CTA:** `View packages` / `See process` / `Explore galleries`.

(We’ll lock exact wording later; pages should be designed to accommodate either without redesign.)

---

## 4) Global UI system

### 4.1 Layout tokens (to implement as CSS variables)

- **Canvas:** paper background, subtle texture.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 72…
- **Radii:** small (placards), medium (cards), large (frames).
- **Shadows:** soft, warm; never harsh.
- **Borders:** thin, muted.

### 4.2 Core components (primitives)

- `PaperSurface` (background + texture)
- `Container` (max widths)
- `Stack` / `Grid`
- `Text` (typography roles)
- `Button` (primary/secondary/ghost)
- `Link`
- `Frame` (photo mat + border + shadow, variants)
- `Placard` (label card: title/subtitle/meta)
- `Divider`
- `Callout`
- `Accordion` (FAQ)
- `FormField` + inputs
- `InlineStatus` (success/error)
- `Skeleton` / `LoadingState`

### 4.3 Gallery components (domain)

- `GalleryWall` (curated layout)
- `GalleryCard` (cover frame + placard)
- `PhotoViewerDesktop` (click + keys + optional drag)
- `PhotoViewerMobile` (gesture-first viewer)
- `CaptionDrawer` (mobile optional)

---

## 5) Motion & transitions

### 5.1 Principles

- Motion supports orientation, not flair.
- No continuous parallax, no bouncy springy stuff by default.

### 5.2 Timing defaults

- **Fast:** 120–160ms (hover/focus)
- **Standard:** 180–240ms (panel transitions)
- **Slow:** 260–360ms (viewer transitions)

### 5.3 Page navigation

- Desktop: minimal (fade content in).
- Mobile: optional “panel slide” feel for select flows (e.g., entering the viewer).

---

## 6) Media rules (performance)

- Never ship originals by default.
- Known width/height for layout stability.
- Responsive sizes + modern formats.
- Blur placeholders preferred.
- Lazy load everything below fold.
- Viewer must prefetch _next_ image quietly.

---

## 7) Accessibility & usability

- Keyboard navigation works everywhere.
- Focus styles visible on paper background.
- Viewer controls reachable without gestures.
- No gesture-only critical path.
- Reduce motion support.

---

# 8) Page-by-page visualization & requirements

> We’ll refine each page with a **desktop layout**, **mobile layout**, and **interaction notes**.

## 8.1 Home (Mobile-first)

### Purpose

- Set the emotional tone immediately (calm / warm / grounded).
- Show the work fast.
- Communicate the “archive gallery” premise + pricing philosophy.
- Provide a clear path to **Packages / Package Builder** and **Inquire**.

### Entry & load experience (mobile)

**Goal:** the page should feel like an intentional “exhibit reveal,” not a standard template load.

**Two-stage entry model:**

1. **Optional brand intro overlay** ("Sunrise" logo reveal)
2. **Home staged reveal** (text → frame → CTA → header)

**Brand intro overlay (if enabled):**

- Shows on first visit only (default), skippable.
- Ends immediately if the home route is ready.

**Home staged reveal (recommended):**

1. **Primary text appears first** (Exhibit headline / brand stance line) — quick fade-in.
2. **Framed hero image appears next** — slight delay, fade + 4–8px rise.
3. **Secondary line + CTA row appears last** — reinforces action after mood.
4. **Header expands in last** (or becomes fully visible at the end of the sequence).

**Constraints:**

- Do not block rendering on heavy animations.
- Must respect `prefers-reduced-motion` (in reduced mode: no staged reveal; render static).
- Keep total staged reveal under ~600–900ms.

### Mobile layout (recommended v1)

> Principle: on mobile, reduce to **one primary story**: _work → why → social proof → pricing → operate area → CTA._

#### Section 1 — Top chrome (header)

**Goal:** give standard navigation affordances without stealing attention from the hero.

**States (mobile):**

1. **Expanded header (reveals after initial hero load / on scroll-up):**
   - Left: hamburger
   - Center: logo mark + short wordmark/text (optional)
   - Right: compact CTA button (label flexible)
2. **Collapsed header (on scroll-down):**
   - A **skinny bar** with **logo mark only** aligned top-left
   - No CTA, no wordmark

**Reveal behavior:**

- **On initial page entry:** header can start in a minimal/hidden state and **fully reveal last** in the staged load.
- **Scroll up:** expand to full header.
- **Tap/click on collapsed bar area:** expand to full header.

**Sticky behavior:**

- Header is sticky.
- Collapsed bar persists (does not fully disappear).

**Accessibility / usability requirements:**

- Collapsed bar remains a clear tap target (minimum 44px height).
- Hamburger and CTA remain keyboard focusable in expanded state.
- Expansion/collapse must respect `prefers-reduced-motion`.

#### Section 2 — Hero exhibit (above the fold)

**Chosen direction:** _Option B_ — text first on the paper canvas, then the framed hero as an object that arrives.

**Text composition:** _Option B_ — strong line + one quiet supporting line (copy is iterable).

**Mobile placement constraint:** while we like “offset” placement, mobile must remain readable:

- Default: headline block at top, frame below (can still be subtly offset within safe margins).

- **Top:** primary exhibit text block (headline + supporting line). This is the first element to render in the staged load.
- **Then:** framed hero image, slightly offset (intentional placement rather than perfectly centered).
- **Then:** secondary line + CTA row.

**Motif options:**

- A small **placard** can sit near the frame edge (anchored to the frame, not floating arbitrarily).

**CTA flexibility requirement:**

- CTA row must support:
  - 1 primary button + 1 secondary link
  - OR 2 buttons (e.g., “Explore packages” + “Build your own”)
  - Without layout breakage.

#### Section 3 — “Why / What” brand stance (short)

**Direction:** treat this as **text on the wall** — simple typography on the paper canvas.

- Prefer a single paragraph + optional emphasized line.
- Can be visually separated with a subtle background shift, but default is to feel like an extension of the hero exhibit.

#### Section 4 — Featured galleries (carousel)

**Goal:** a playful, gallery-consistent exploration element that also supports direct intent (“take me to that gallery”).

- Horizontal carousel of **framed covers**.
- Each item includes:
  - Frame (cover image)
  - Placard (title + 1-line descriptor)

**Interaction pattern (mobile):**

- Do **not** rely on hover.
- Base interaction should be **tap/press to reveal** an explicit navigation affordance.
  - Example behaviors (final TBD):
    - A small placard/label animates in with a **“View gallery”** action.
    - A subtle outline/spotlight appears and a button/label appears.
    - Press opens a tiny preview sheet with “Enter exhibit”.

**Interaction pattern (mobile):**

- **Tap/press on frame:** reveals a clear “enter exhibit” affordance (not a generic link).
  - Example behaviors (pick one later):
    - A small placard/label animates in with a **“View gallery”** action.
    - A subtle outline/spotlight appears and the frame becomes the active target.
- **Second tap** (or tap on the revealed affordance) navigates to the gallery.

**Direct navigation:**

- Provide an explicit “View all galleries” link below.

#### Section 5 — Social proof (reviews)

**Primary acceptable formats:**

- **Wall quotes (vertical):** simple quote blocks on the canvas (calm, readable).
- **Quote + image pairing (optional):** small framed thumbnail beside/above quote if it doesn’t feel busy.

**Guideline:**

- Don’t require images here; reviews should work as pure text.

#### Section 6 — Pricing philosophy + Packages / Builder CTA

**Role on Home:** this section _is_ the Home’s “packages presence.” Home should not become a full packages page.

**Recommended v1 composition (mobile):**

- Exhibit heading + 2–4 lines of calm copy (pricing philosophy).
- **Two primary actions** (copy flexible):
  - Button A: **Explore packages** (goes to /packages)
  - Button B: **Build your own** (goes to /package-builder)

**Home packages rule (explicit):** Home contains **no package lineup or package details**.

- This section exists to communicate **pricing philosophy + intent** only.
- The only package-related elements on Home are **two CTAs**:
  - Button A: **Explore packages** (goes to /packages)
  - Button B: **Build your own** (goes to /package-builder)

**Guardrails:**

- Do not list every package.
- Avoid comparison tables on Home.
- Keep the visual emphasis on the work (galleries) and the philosophy (clarity), not feature lists.

#### Section 7 — Where you operate

- Short, concrete: “Ottawa–Gatineau” (or your real service area) + travel note.
- Optional: simple map thumbnail (static) or just text + placard.

#### Section 8 — Final CTA + Footer

- Final CTA panel repeats primary action with reassurance:
  - “No pressure. Tell me what you’re thinking.”
- Footer minimal: contact, socials, copyright.

### Desktop layout (placeholder; to be refined later)

- Desktop will mirror the same narrative but with more negative space and multi-column exhibit compositions.

### Mobile interactions

- Frames: gentle lift + shadow on press.
- Carousel: snap points; no autoplay.
- CTA: always reachable within ~1–2 screens from top.

### Content requirements (Home)

- Hero image + alt text
- Hero headline + subcopy
- Featured galleries list (title, slug, cover image, short descriptor)
- 2–6 reviews/testimonials
- Pricing philosophy copy block + link targets
- Operating area string + optional travel note

### Open decisions (Home)

- CTA labels are intentionally **mutable** (copy will iterate). Design must support swapping labels without layout breakage.
- Logo usage (mark-only vs wordmark)
- Accent color usage intensity (subtle vs present)

---

## 8.2 Portfolio (Galleries Index) — Mobile-first

### Purpose

- Provide a calm, browseable **index of exhibits**.
- Distinct from the gallery viewer: this page is **free-flowing scroll**, not snap panels.
- Encourage exploration while keeping direct intent (“view this gallery”) frictionless.

### Mobile layout (v1)

**Primary layout:** vertical **Gallery Wall List**

- One gallery per row.
- Each row includes:
  1. **Framed cover** (varied aspect ratios allowed)
  2. **Placard block** with:
     - Title
     - Date (optional)
     - 1–2 line description (required)
  3. **Explicit CTA** to enter the gallery (button or subtle action row)

**Visual variance (intentional, not random):**

- Allow controlled variation in cover aspect ratio:
  - Some covers portrait, some landscape (based on the cover image’s natural orientation).
- Optional slight alignment variance (e.g., frame slightly offset) as long as:
  - Tap targets remain clear
  - Rhythm stays consistent

### Interaction model (mobile)

- **Tap on cover**: opens gallery (or optionally focuses the row; v1 can be direct open).
- **CTA button**: always present and clearly labeled (v1 simplest: `View gallery`).
- **Metadata**: tap on title may also open gallery.
- No hover assumptions.

### Entry to viewer

- Index → Gallery viewer opens at **Intro Panel** (`?p=0`).
- When user returns via browser back, restore:
  - index scroll position
  - last viewed panel index preserved in viewer URL when applicable.

### Desktop layout (placeholder)

- Desktop can be a grid/wall composition later; mobile-first spec drives content requirements.

### Content requirements (Galleries Index)

Per gallery:

- `title`
- `slug`
- `coverImage` (url + width/height + alt)
- `description` (1–2 lines)
- `date` (optional)
- `location` (optional)
- `tags/sessionType` (optional, for future filtering)

### Open decisions (Galleries Index)

- Whether tapping the cover opens immediately or first reveals a CTA (v1: open immediately, keep explicit CTA anyway).
- How much layout variance is acceptable before it feels messy.

---

## 8.3 Portfolio (Gallery Detail)

### Desktop layout

- Top area: gallery title placard + small meta
- Main: photo grid OR single-photo viewer entry
- Recommended: **grid first** with “View as exhibit” toggle

### Mobile layout (gesture-first viewer)

- Default entry can be viewer-first (one image at a time)
- UI chrome minimal:
  - top: back + gallery title
  - bottom: tiny dots / count + “details” button

### Gestures (mobile)

- Left/right: next/prev photo
- Pinch: zoom
- Pinch-out: return to gallery overview
- Up/down: next/prev gallery (optional; only if it doesn’t confuse)

### Viewer controls (required)

- Tap to show/hide UI
- Buttons for next/prev and exit (for accessibility)

---

## 8.4 Packages — Mobile-first

### Purpose

- Convert interest into action by making options **clear, calm, and confidence-building**.
- Maintain the Archive Gallery tone while acknowledging this is a commercial page.

### Metaphor / vibe options

- **Preferred framing:** _The Curator’s Notes_ (not a gift shop).
  - Packages are presented as “ways to commission work,” written plainly.
  - Keeps it warm and grounded without feeling transactional.
- (Optional alternate framing: “Print desk / front desk” at the gallery—helpful staff, not sales.)

### What’s common on photographer sites (reference pattern)

Most photographer package pages include:

- A headline + short intro
- 2–6 packages with price, time, inclusions
- Add-ons
- A comparison table (sometimes)
- A booking/inquiry form or strong CTA

### Recommended approach for Evryday (v1)

**Principles:**

- Lead with **copy and philosophy**, then show packages beneath.
- Avoid aggressive sales structure.
- Provide a clear “none of these fit? inquire anyway” safety valve.

#### Section 1 — Intro / philosophy (copy-first)

- Exhibit headline (calm, direct)
- 1–2 short paragraphs explaining:
  - Transparent pricing
  - How you think about time/coverage/deliverables
  - What to do if none fits
- Include an **explicit reassurance callout**:
  - “If you don’t see your situation here, reach out anyway.”

#### Section 2 — Packages list (the options)

- 3–6 package cards (placard-forward):
  - Name
  - Intended use (1 line)
  - Time / scope
  - Deliverables
  - Starting price (or price)
- **Actions per package (required):**
  - Primary: **Inquire about this** (links to inquiry flow with package preselected)
  - Secondary: **Open in builder** (launches Package Builder seeded with this package)
- Keep each card scannable; details can expand.

#### Section 3 — Add-ons / upgrades (optional) / upgrades (optional)

- Calm list of optional extras (no upsell tone).

#### Section 4 — Gentle comparison (optional)

- Prefer a **small comparison block** or “Which one is right?” guide over a giant table.
- If a table exists, keep it minimal and mobile-friendly.

#### Section 5 — Inquiry CTA + safety valve + Builder CTA (end)

- A reassuring close + clear next steps.
- Include both:
  - CTA A: **Reach out / Inquire** (primary)
  - CTA B: **Build your own package** (secondary)
- Copy explicitly states that custom situations are welcome.

### Mobile layout recommendations

- Philosophy section is above fold or near top.
- Packages below fold in a vertical stack.
- Each package card supports expand/collapse for details.

### Content requirements (Packages)

- Global philosophy copy
- Packages array with:
  - `name`, `slug`
  - `summaryLine`
  - `duration` / `scope`
  - `deliverables`
  - `price` or `startingAt`
  - `notes` (optional)
- Optional add-ons list

### Open decisions (Packages)

- Whether prices are exact or “starting at”
- Whether to include any comparison table in v1
- Whether to embed an inquiry form on this page

### Planned overhaul (next iteration)

- The current `/packages` implementation is a v0 — basic cards with limited detail.
- The page needs a significant expansion: more packages, more detail per package (duration, deliverables, scope, notes), and richer visual treatment.
- The lighter card format currently on `/packages` will become the “packages at a glance” section on `/inquire`.
- This overhaul is **deferred** until the `/inquire` and `/book` flows are built.

---

## 8.5 Package Builder

### Desktop layout

- Two-column:
  - Left: “choices” (placards / toggles)
  - Right: sticky “summary placard” with totals + CTA

### Mobile layout

- Stepper flow (3–5 steps) OR single scroll with sticky bottom summary

### Interactions

- Every selection updates summary instantly
- Always show what’s included (avoid hidden surprises)

---

## 8.6 Process

### Desktop layout

- Exhibit headline
- 4–6 steps as large placards in a grid
- Optional framed behind-the-scenes image

### Mobile layout

- Vertical placards, with subtle separators

---

## 8.7 FAQ

### Desktop layout

- Exhibit headline
- Accordion sections
- Sidebar callout: CTA + “Still unsure? Inquire”

### Mobile layout

- Accordion, with search optional later

---

## 8.8 Inquire (`/inquire`) — Guided Onboarding Flow

### Purpose

- Primary conversion page for users who are interested but don't yet know what they want.
- Acts as a **guided questionnaire** that helps someone find the right package for their situation.
- Also serves as an entry point for users arriving with a specific package already in mind (via `?package=` query param).
- All major CTAs across the site (hero, gallery closing panel, packages, FAQ, header) point here.

### Overall page structure

Two sections stacked vertically:

1. **Top — Guided questionnaire** (primary interaction surface)
2. **Bottom — Packages at a glance** (secondary/escape hatch for users who prefer to self-select)

The questionnaire is the featured path. The packages section below exists for users for whom the questionnaire is too high a burden, or who already know what they want.

---

### Section 1 — Guided questionnaire

#### Philosophy

- This should feel like a **thoughtful conversation**, not a form.
- Simple questions, simple answers — one or two at a time.
- The user fills this out in good faith because they want photos and they want you to give them the right answer. Design for that intent, not for churn reduction.
- Questions can be numerous; do not artificially limit step count to prevent abandonment. Depth serves accuracy.

#### Question categories (to be configured in admin — see Section 11)

The following are the types of questions the flow should support. Exact wording, order, and branching are admin-configurable:

1. **Who is this session for?** (e.g., just me, me + partner, family, group, other)
2. **How many people?** (number or range input)
3. **What's the occasion?** (e.g., milestone birthday, anniversary, maternity, engagement, casual portraits, other)
4. **Where are you thinking?** (e.g., outdoor natural, urban, studio, at home, flexible/open)
5. **Rough budget?** (range selector — communicate that all budgets get a honest answer)
6. **Style preference?** (e.g., candid/documentary, directed/posed, mix of both — optionally with visual examples)
7. **How many photos do you want to walk away with?** (a range or rough expectation)
8. **Is there anything about your idea that doesn't fit the above?** (open text — captures “special requests” and non-standard situations)
9. _(Additional questions to be defined and ordered in admin)_

#### Interaction model

- **Step-by-step presentation**: questions appear one or two at a time, with clear forward/back navigation.
- Answers can be: single-select chips, multi-select chips, number input, range slider, or short text.
- Progress is shown (e.g., step indicator or subtle progress bar) but should not feel clinical.
- The flow should feel calm and unhurried — consistent with the overall site tone.

#### Recommendation output

After completing the questionnaire, the user receives a **”here's what might work for you”** result — not a hard sell, but an honest suggestion.

**Result screen includes:**

- 1–3 recommended options (package + optional modifiers), ranked or clearly distinguished.
- A brief **plain-language explanation** of why each option is suggested — especially important when the recommendation involves trade-offs (e.g., “Given your budget and the number of people, here's what I'd suggest — and here's where there's some give/take”).
- Each recommendation shows:
  - Package name + summary
  - Suggested modifiers (add-ons or adjustments) and their effect on scope/price
  - Trade-off note if applicable (e.g., fewer deliverables, shorter session time)
- Users can optionally expand/click into the reasoning for a suggestion.

**Actions on result screen:**

- **Primary:** “Book this” — proceeds to `/book` with the recommended package + modifiers pre-filled.
- **Secondary:** “Adjust in builder” — opens `/package-builder` seeded with the recommendation.
- **Tertiary:** “Start over” — resets the questionnaire.

#### State & navigation

- Questionnaire answers are held in local component state (no persistence required for v1).
- Back navigation within the questionnaire is supported (user can revise previous answers).
- If user arrives with `?package=` param, the questionnaire can optionally pre-fill or skip certain steps and surface that package prominently in the result.

---

### Section 2 — Packages at a glance (secondary)

- A **lighter version of the `/packages` page** — cards with enough info to recognize what each option is, but not the full detail of the dedicated packages page.
- Intended for users who self-identify with a specific option and don't need the guided flow.
- Each card includes: package name, one-line summary, starting price.
- **Actions per card:**
  - **”Inquire about this”** → goes to `/book?package={slug}` (bypasses questionnaire entirely)
  - **”Customize in builder”** → goes to `/package-builder?package={slug}`
- A “See full details” or “View all packages” link leads to `/packages`.

---

### Mobile layout

- Questionnaire takes most of the viewport; one question visible at a time with clear navigation.
- Result screen is a scrollable card set (not a table).
- Packages at a glance: vertical stack below a clear visual separator.

### Desktop layout

- Questionnaire centered with generous margins; step layout with left/right nav or next button.
- Result screen: up to 3 recommendation cards side by side.
- Packages at a glance: 2–3 column card grid.

### Open decisions (Inquire)

- Exact question wording and ordering (to be finalized in admin config).
- Whether to show a visual progress bar or step count.
- Whether any questions support branching (e.g., skip budget question if “flexible” is selected).
- Whether the recommendation result screen is a new visual step or a page transition.
- How to handle the edge case where no packages are a good fit (result: friendly “reach out directly” message).

---

## 8.9 Book (`/book`) — Formal Booking Request

> **New route** — not previously in requirements. This is the final step in every conversion path.

### Purpose

- The formal “send your request” page. All conversion flows eventually land here:
  - Questionnaire result → Book this
  - `/packages` → Inquire about this
  - `/package-builder` → Proceed to booking
  - Direct nav from header/footer CTA
- Collects the user's contact info, date preference, and any remaining details.
- Optionally accepts a deposit to confirm serious intent.

### Tone

- Warm and reassuring. The user has committed to reaching out — don't make it feel bureaucratic.
- Confirmation state should feel like a handshake, not a ticket number.

### Pre-fill behavior

- Accepts query params (`?package=`, `?modifiers=`) from upstream flows to pre-populate the selected package/modifiers.
- If arriving from the questionnaire result, the recommended package + modifiers are shown in a summary above the form.
- If arriving without a pre-fill (e.g., direct nav), the form still works — user can describe their idea in the notes field.

### Form fields (required)

- **Name** (first + last, or full name — TBD)
- **Email**
- **Phone number**
- **Preferred date** — calendar date picker (not time slots; date is a preference, not a confirmed booking)
- **Additional details / notes** — open text field for anything not captured upstream (required if no upstream package context; optional if package is pre-filled)

### Date selection behavior

- Present a calendar UI.
- Clearly communicate: **”Date requests are not final. I'll reach out to confirm availability and discuss details.”**
- The calendar does not need to show real-time availability in v1 — it is a preference capture only.

### Deposit (optional / future)

- The page should be designed to accommodate a deposit step in a future iteration.
- v1: no payment processing required. The form submission is the commitment signal.
- _(Flag for later: deposit amount, payment provider, when to require it)_

### Package summary panel

- If a package is pre-filled, show a summary panel (placard-style):
  - Package name
  - Selected modifiers
  - Estimated price (with “subject to confirmation” note)
- This panel is read-only — link to builder if the user wants to change it.

### Desktop layout

- Two-column:
  - Left: form
  - Right: package summary placard + “what happens next” note
- “What happens next” note: brief, friendly — e.g., “I'll review your request and get back to you within 48 hours to confirm the date and discuss any details.”

### Mobile layout

- Package summary (if present) at top.
- Form below.
- “What happens next” note below the submit button.

### Confirmation state

- Full-page or inline confirmation — not just a toast.
- Warm copy: acknowledges the submission, sets expectation for follow-up timeline.
- CTA: “While you wait, explore the portfolio” or similar.

### Open decisions (Book)

- Whether to split name into first/last or keep as one field.
- Exact copy for “what happens next.”
- Whether to add deposit support in v1 or defer entirely.
- Whether to allow time-of-day preference in addition to date.
- Whether confirmation state is a new page (`/book/confirmation`) or an in-place transition.

---

## 8.10 Contact (`/contact`)

### Desktop layout

- Minimal: contact methods + social + location
- Optional framed portrait/work image

### Mobile layout

- Stack + tap-friendly buttons

### Note

- `/contact` nav link currently exists but the page is not yet built.
- Decide: redirect to `/inquire` (since that is the primary contact path), or build as a lightweight standalone page with direct contact methods (email, phone, socials).
- _(Open decision: resolve before building)_

### Desktop layout

- Minimal: contact methods + social + location
- Optional framed portrait/work image

### Mobile layout

- Stack + tap-friendly buttons

---

# 9) Gallery experience (Mobile-first)

> This section defines the mobile-first interaction model for viewing a gallery/exhibit.

## 9.1 Core concept

- On **mobile**, a gallery should feel like a **sequence of discrete views** (one “piece” at a time), not free scrolling.
- User advances via a **sticky/threshold scroll** (snap), similar to familiar vertical video patterns, but calmer and more intentional.
- Two viewing modes:
  1. **Gallery Mode**: paper canvas + frame/mat + placard.
  2. **Frameless Mode**: image only (immersive), minimal overlay on tap, with clear exit.

## 9.2 Gallery structure (beginning / middle / end)

Each gallery includes:

1. **Opening Panel (Exhibit Intro)**

- Title
- Short story / context (1–4 short paragraphs)
- Optional metadata (date, location, session type)
- Primary actions (optional): “Start exhibit” / “Jump to favourites”

2. **Photo Panels (the exhibit)**

- One photo per panel.
- Panel includes either:
  - Gallery Mode UI (frame + placard)
  - Frameless Mode UI (image only)

3. **Closing Panel (Exhibit Outro)**

- Thank you note (from you)
- Optional testimonial/review (if appropriate)
- Clear next step CTA: “Explore packages” / “Inquire” / “View another gallery”

## 9.3 Navigation + snapping behavior (mobile)

**V1 Decision:** use **pure CSS scroll-snap panels** (lower risk, native performance).

**Implementation shape:**

- One scroll container sized to viewport (`100svh`).
- Each panel is a full viewport “piece” (`min-height: 100svh`).
- CSS: `scroll-snap-type: y mandatory` on container; `scroll-snap-align: start` on panels.

**Vertical axis (primary):** next/previous panel

- Scroll advances to next panel when the user crosses the browser’s snap threshold.
- “Sticky” feel comes from snap settling; partial scroll typically returns to the current panel.

**Controls & accessibility (required):**

- Provide on-screen controls (next/prev) as an alternative to gestures.
- Maintain a visible progress indicator (e.g., `5 / 24`).
- Ensure keyboard navigation works on desktop/tablet (arrow keys / PageDown / Space as appropriate).

**Deep linking / shareability (recommended):**

- Support linking to a specific panel index (e.g., via query param `?p=5` or hash), scrolling to it on load.
- Back button should behave predictably (avoid trapping users in a custom history loop).

**Zoom/pinch interaction guardrails:**

- If the image is zoomed beyond base scale, vertical snap navigation should not fight the user.
  - V1 simplest rule: while zoomed, disable snap by preventing vertical scroll in the container (or keep the user in frameless mode until they exit/return to base scale).
- Never require pinch-out to exit; always provide an explicit X/back.

## 9.4 Mode switching: Gallery Mode ↔ Frameless Mode: Gallery Mode ↔ Frameless Mode

**Default:** Gallery Mode (frame + placard) to reinforce brand metaphor.

**Enter Frameless Mode:**

- Tap a clearly indicated control (e.g., “Immersive”) OR double-tap gesture (configurable).

**Frameless Mode UI:**

- Full-bleed image
- On tap: minimal overlay appears:
  - Top-right: **X** to exit
  - Bottom: subtle progress indicator (e.g., “5 / 24”) and optional “details”

**Exit Frameless Mode:**

- Tap X
- Optional: pinch-out at base zoom (only if it feels natural and doesn’t conflict with standard zoom)

## 9.5 Placards & metadata per photo

In Gallery Mode, each photo panel can include a placard with:

- Short caption (optional)
- A small meta line (location/date/session)
- Discreet “save” affordance (see favourites)

Placards should be readable and consistent, but not overly chatty.

## 9.6 “Favourites” / crowd-sourced top images (bonus feature)

**Concept:** double-tap to “favourite” an image using a **branded reaction** (not a heart). The site can optionally surface a “Top Favourites” view.

**Design guardrails:**

- Keep it calm; avoid addictive feedback loops.
- No streaks, no infinite prompts, no notifications.
- The reaction animation should be subtle (small mark, gentle fade).

**Product guardrails:**

- This is a **bonus** feature; do not let it complicate core launch.

**Implementation constraints (no public accounts):**

- **Local favourites:** always supported via localStorage (private to the device).
- **Crowd-sourced favourites (optional):**
  - Requires an anonymous API endpoint to record favourites.
  - Must include rate limiting + abuse protection.
  - Consider a simple per-device identifier (stored locally) rather than user accounts.
  - Consider moderation toggles (ability to disable globally).

**Surfaces:**

- Per-gallery: “View favourites” jump.
- Global: optional “Top Favourites” page.

## 9.7 Performance requirements (gallery)

- Snap navigation must be smooth (no jank).
- Preload only the **next** (and optionally previous) image.
- Maintain layout stability (known aspect ratios / sizes).
- Frameless mode should not trigger extra downloads beyond required responsive sizes.

## 9.8 Browser gesture compatibility (mobile)

**Principle:** do not fight the browser. Edge-swipe back/forward gestures should remain usable and feel natural.

**Decision:** treat **edge swipe back** as a valid and supported exit from the gallery viewer.

**Requirements:**

- Leaving the viewer (via browser back or in-app back) should return to the prior context (gallery index or portfolio list) with **position preserved**.
- Persist the current panel/frame index while viewing (e.g., via URL `?p=12` and/or history state).
- On re-entry, restore to the saved panel/frame.

**Interaction guardrails:**

- Do not implement horizontal swipe navigation that conflicts with edge-swipe back.
- If any horizontal gestures are added later, only recognize them from an inner safe region (avoid left/right edges).

## 9.9 Open decisions (gallery)

- Whether vertical swipe moves between **photos only** or between **galleries** as well.
- Whether horizontal swipe is introduced (and what it controls).
- Exact mode-toggle gesture (button vs gesture).
- Reaction symbol for favourites.
- Whether crowd-sourced favourites ships at all in Q1.

---

# 10) Open decisions / TODOs

1. CTA wording: Inquire vs Book vs Check availability
2. Gallery detail default: grid-first or viewer-first on mobile
3. Up/down swipe between galleries: include or not
4. Degree of “tactile desk” vs “clean gallery”
5. How often to show dates/locations on placards
6. Whether “Sunrise” intro ships in v1
7. Whether crowd-sourced favourites ships in Q1
8. `/contact` page: redirect to `/inquire` or standalone lightweight page?
9. `/book` deposit: defer entirely, or design for it now and implement later?
10. Questionnaire branching logic: flat sequence vs. conditional question paths?
11. Recommendation algorithm complexity: hardcoded rules v1, admin-configurable weights v2?

---

# 11) Admin — Questionnaire & Recommendation Engine

> This section describes the admin-side tooling needed to power the `/inquire` guided flow.

## 11.1 Purpose

The questionnaire on `/inquire` must be **configurable from the admin panel** — not hardcoded in the frontend. This allows question wording, order, response options, and the recommendation logic to be adjusted without code changes.

## 11.2 Data model (proposed, needs schema design)

### Question

- `id`
- `order` (display sequence)
- `text` (the question prompt)
- `type`: `single-select` | `multi-select` | `number` | `range` | `text`
- `options` (array, for select types): each option has a `label` and a `value`
- `isRequired`
- `conditionalOn` (optional — only show this question if a prior answer matches a condition; enables branching)

### Option → Package/Modifier Signal

Each response option can carry **signals** that influence the recommendation:

- `packageBoosts`: array of `{ packageId, weight }` — answers that make a package more likely to be recommended
- `modifierSuggestions`: array of `{ modifierId, reason }` — answers that suggest specific add-ons
- `tradeOffNote` (optional): a plain-language string that surfaces in the result when this answer creates a constraint (e.g., “Low budget + large group means fewer deliverables — I'll note that in the recommendation”)

### Recommendation Rule

- The engine scores each package based on the accumulated signals from all answers.
- Top-scoring packages (up to 3) are surfaced in the result with the relevant modifier suggestions and trade-off notes.
- Admin can set minimum thresholds or overrides (e.g., “always include Package X as an option regardless of score”).

## 11.3 Admin UI requirements (new pages needed)

- **Questionnaire editor**: list, create, reorder, edit, and delete questions.
- **Option editor**: per question, manage response options and their package/modifier signals.
- **Recommendation preview**: a dry-run tool to simulate the flow with sample answers and see what recommendation would be generated.
- _(Design for these pages is deferred — requirements only for now)_

## 11.4 API routes needed (new)

- `GET /api/questionnaire` — returns the full ordered question set (public, used by `/inquire`)
- `POST /api/questionnaire/recommend` — accepts a completed answer payload, returns ranked package recommendations with modifiers and trade-off notes
- `GET /api/admin/questionnaire` — admin: full question list with signals
- `POST /api/admin/questionnaire/questions` — create a question
- `PUT /api/admin/questionnaire/questions/:id` — update a question
- `DELETE /api/admin/questionnaire/questions/:id` — delete
- `PUT /api/admin/questionnaire/questions/reorder` — reorder

## 11.5 Open decisions (Admin / Questionnaire)

- Whether recommendation scoring is purely additive weights or supports exclusion rules (e.g., “if budget < X, never recommend Package Y”)
- Whether the admin can write free-text “recommendation rationale” templates or if those are auto-generated from signals
- Whether the questionnaire supports branching in v1 or starts as a flat sequence

---

- Mobile/desktop differences
- Interaction details + edge cases
