# Landing Page Spec: Spring Sale

**Route:** `/spring-sale`  
**Brand:** Evryday Archive Co  
**Purpose:** Paid ad entry point — warm handoff to package builder, not a direct converter

---

## Context

This page is the destination for a Meta/Instagram ad campaign targeting Kamloops. The goal is to give someone who clicked an ad a more intentional entry point than the homepage — oriented around the sale offer, with a clear path into whichever package fits them. The page does not need to close anyone; it needs to orient them and get them one step closer to the right package.

---

## The Offer

- **10% off** any package
- **Deadline:** May 31, 2026
- **Geography:** Kamloops only (relevant for copy tone, not enforced technically)
- **No deposit extension on this page** — keep messaging clean; if someone asks after the deadline, handle it conversationally

---

## Page Structure

### 1. Header / Nav

- Use the existing site nav
- No modifications needed

### 2. Hero Section

- Full-width, large hero image (manually selected by Reed)
- Overlay or adjacent headline — direct, not clever
- Suggested headline direction: what the sale is + the deadline, in plain language
- One supporting line maximum — something that frames Evryday Archive Co's positioning (accessible, transparent, everyday moments)
- No CTA in the hero; let the image breathe and pull the user down

### 3. Offer Block

- Short, scannable — 2-3 sentences max
- Communicate: 10% off, any package, before May 31st
- Tone: confident and warm, not urgent or pushy
- No asterisks, no fine print

### 4. Image Gallery

- 3–5 images, manually curated by Reed
- Large format — these should feel editorial, not thumbnail
- **Desktop:** side-by-side or asymmetric grid layout
- **Mobile:** full-width stacked, one per row, no cropping — images are the product, treat them accordingly
- No captions needed

### 5. Package Selector

- Heading that invites self-selection — something like "Find the right fit"
- Four cards or tiles, one per package:
  | Label | Target |
  |---|---|
  | For me | Solo/individual package builder |
  | For me + some people | Small group package builder |
  | For my work or business | Commercial package builder |
  | For my event | Event package builder |
- Each card has a single CTA button that links directly into the package builder for that package
- Keep the cards visual but not complex — label, one-line descriptor, button
- **Mobile:** full-width stacked cards

### 6. Portfolio Nudge

- A single low-key line + text link pointing to the portfolio
- Not a section — just a line between the package selector and the end of the page
- Something like: "Not sure yet? Take a look at the work first." → links to `/portfolio`

### 7. Footer

- **Omitted on this page** — keep the user focused

---

## Mobile Considerations

Mobile is the primary entry point (ad click → phone). Design mobile-first:

- Hero image: full viewport height, portrait-friendly crop if possible
- Text: large enough to read without zooming, minimal line count
- Package cards: full width, generous tap targets on CTA buttons
- Gallery: single column, full width, no horizontal scroll
- No hover-dependent interactions

---

## Copy Tone

Consistent with the broader Evryday Archive Co voice:

- Plain language, no fluff
- Warm but not salesy
- Specific over vague (say "10% off before May 31st" not "limited time savings")
- No exclamation marks

---

## Links Required

The following links must be functional before this page goes live:

- Package builder URLs for all four packages (confirm these with Reed)
- `/portfolio` for the nudge link
- Existing nav links (inherited from site)

---

## Assets to Provide

- Hero image (1 image, Reed to supply)
- Gallery images (3–5 images, Reed to supply)
- Package builder URLs for each of the four packages

---

## Out of Scope

- Deposit extension mechanic (handle conversationally if asked)
- Any form or inquiry flow on this page
- Geo-restriction or audience detection
- Analytics events beyond what the existing pixel already captures (PageView fires automatically; no custom events required for this page unless a Lead event is added to the package builder entry — recommended but separate task)
