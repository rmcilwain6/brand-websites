# Roadmap: Gallery Experience V2

**Scope:** `apps/evrydayarchive-web` (portfolio rendering), `apps/admin` (gallery authoring), `packages/db` (schema), `packages/core` (schemas)
**Status:** Scoping — no phase started as of 2026-08-07
**Horizon:** Q3/Q4, multi-PR

---

## Context

Portfolio galleries currently render as a uniform two-column CSS-columns masonry (`apps/evrydayarchive-web/app/portfolio/[slug]/page.tsx`), driven by nothing more than `GalleryImage.order`. That's a reasonable v1, but it treats every gallery as an undifferentiated bag of photos in a fixed grid — no curatorial voice, no room for context, and mobile is just the same grid collapsed to one column.

The goal of V2 is to make a gallery feel like an intentionally composed exhibit — closer to a photo essay or a real gallery walkthrough than a photo grid — while staying inside the site's existing "art gallery / museum crossed with archival" language (paper canvas, grain, frames, Placard-style labels — see `apps/evrydayarchive-web/app/globals.css` and `tailwind.config.ts` for the existing token/motion vocabulary this should extend, not replace).

This document exists so the work can be picked up, handed off, or resumed across multiple PRs without re-deriving the shape of the problem each time. It is a living document — expect it to change as each phase surfaces things we didn't know yet.

---

## What a gallery is made of (V2 mental model)

Conversation with Reed (2026-08-07) converged on a gallery being composed of, in principle:

1. **Sections** — a gallery may be divided into distinct parts, each potentially with its own identity, rather than one continuous scroll of photos.
2. **Wall text** — real documentation/context, or reflective prompts ("questions to ponder") — museum-didactic-panel style prose, not a photo caption. May belong to a section or to the gallery as a whole; not necessarily anchored to one specific image.
3. **Image-level captions/plaques** — short label-style info tied to an individual photo (the existing `Placard` component is the right building block here).
4. **Per-image layout intent** — how a given image is presented: size/alignment on desktop; fit/offset within a full-bleed frame on mobile.
5. **(Future / unscoped) Interactive elements** — some mechanism for viewer engagement. Explicitly not designed yet; flagged so it isn't forgotten, not because it's next.

Desktop and mobile are **two different renderings of the same authored intent**, not one derived from the other via responsive CSS:

- **Desktop** — an editorial composition: sections, varied image sizes/alignment within a constrained grid vocabulary, wall text blocks interspersed between images, image plaques positioned beside/under frames (mirroring how `Frame`'s existing `placard`/`placardPosition` props already model a real museum label sitting next to, not on top of, the work).
- **Mobile** — a full-bleed, vertical scroll-snap viewer (TikTok-adjacent mechanic): each scroll-snap point is dominated by one image at near-full viewport, with a per-image fit mode (true full-bleed / inset-offset / smaller-in-frame) and text (caption or wall text) integrated into that same vertical rhythm rather than living in a side panel.

---

## Guiding principles

- **Design toward the real V2, not the cheapest slice.** Phases below are a sequencing strategy, not a scope-cutting exercise — the goal is the full end state, built incrementally.
- **Additive and opt-in.** Existing galleries keep rendering through the current masonry unchanged. New fields/rendering paths only activate where explicitly authored, so nothing live breaks mid-rollout. A likely mechanism: a `layoutMode` flag on `Gallery` (`CLASSIC` vs the new mode) — TBD in Phase A.
- **Prove the rendering vocabulary before building tooling for it.** A visual admin builder is expensive to build and easy to build wrong for a layout language nobody has stress-tested. Validate the data model and rendering engine against real galleries first, even with a bare-bones (dropdown) admin interface, before investing in a builder UI.
- **Keep the layout vocabulary closed, not freeform.** A small enum of size/alignment/fit roles is dramatically easier to render predictably (and to art-direct from admin) than free pixel/position values. Expand the vocabulary only when a real gallery needs a role that doesn't exist yet.
- **This has a content dependency, not just an engineering one.** Wall text and section framing are editorial/creative work — the roadmap should assume Reed is writing real museum-style text for pilot galleries alongside each phase, not that it appears for free.

---

## Phases

### Phase A — Data model foundations

Extend the schema to carry curatorial intent without touching how anything renders yet.

- Add a way to group images into **sections** within a gallery (new model or a nullable `sectionId`/section label on `GalleryImage` — TBD).
- Add a **wall text** content type — distinct from `ImageAsset.caption` (which stays as the short label/plaque text) — attachable to a gallery or a section, supporting real prose length.
- Extend `GalleryImage` with closed-vocabulary layout roles: a desktop size/alignment role, and a mobile fit/offset role.
- Add the `layoutMode` (or equivalent) opt-in flag so existing galleries are provably unaffected.
- Sanitize/shape all of this through `packages/core` Zod schemas per existing convention.

**Exit criteria:** schema + migration merged, admin can set the new fields via raw form controls (no visual polish required yet), nothing on the live public site has changed.

### Phase B — Desktop rendering engine

- Build the compositor that interprets section/order/size/alignment/wall-text into an actual layout — CSS Grid with a fixed column count and size roles mapped to spans is the likely mechanism, versus true freeform positioning.
- Ship against 1–2 real galleries, hand-authored through Phase A's bare admin controls, to pressure-test the vocabulary against real (imperfect) photos before anyone builds tooling around it.
- Expect to discover edge cases here: orphaned single images in a row, portrait photos forced into a role that assumes landscape, wall text overflow at certain spans.

**Exit criteria:** at least one real gallery live in V2 layout mode, holding up across common desktop widths.

### Phase C — Mobile full-bleed scroll-snap viewer

- Separate rendering path: CSS scroll-snap, one dominant image per snap point, per-image fit mode (full-bleed / inset / smaller-in-frame), text integrated into the vertical rhythm.
- Likely to surface new questions about how sections and wall text translate to a vertical feed metaphor that don't have answers yet — treat this as its own mini design pass once Phase A's data model is proven on desktop, not a mechanical port.

**Exit criteria:** the same pilot gallery(ies) from Phase B have a working, on-brand mobile experience distinct from — not a squeeze of — the desktop layout.

### Phase D — Admin visual builder

- A drag/arrange authoring interface: see sections, image order, size/alignment, and text placement roughly as they'll render, instead of picking enum values from dropdowns and republishing to check.
- Largest standalone investment in this roadmap. Deserves its own spec once Phases A–C have validated what the vocabulary actually needs to express — building a visual editor for a layout language that's still shifting is wasted work.

**Exit criteria:** Reed can compose a new V2 gallery end-to-end without touching raw form dropdowns or guessing at render output.

### Phase E — Interactive elements (unscoped / future)

- Flagged from the original conversation as a long-term idea for viewer engagement within a gallery. No shape yet — needs its own ideation pass once A–D exist to build on. Not a near-term commitment.

---

## Where the risk actually lives

- **Combinatorial visual QA**, not the migration. Image aspect ratio × size role × alignment × wall-text presence × viewport width is a large surface — this is inherent to the feature, not a sign something's wrong, but it means Phase B/C need real photos and real widths, not a handful of happy-path screenshots.
- **Admin builder scope creep** (Phase D) is the single biggest way this roadmap could balloon. Explicitly sequenced last and behind a design pass for exactly that reason.
- **Schema churn risk if Phase A locks in the wrong vocabulary too early** — mitigated by proving it against real content in Phase B before Phase D depends on it.
- **Not a risk to what's live today** — the opt-in `layoutMode` approach means this can ship incrementally, gallery by gallery, with the existing masonry as a permanent fallback for anything not migrated.

---

## Open questions to resolve (in order of when they'll bite)

1. **Sections** — a real structural concept with their own identity/heading, or just a visual grouping cue with no independent presence? Affects Phase A's schema shape directly.
2. **Wall text placement** — can a section be text-only (no images), or does wall text always accompany at least one image? Affects both the data model and the desktop compositor.
3. **Mobile snap granularity** — is a scroll-snap point always exactly one image, or can a "spread" (e.g. a diptych) occupy one snap point? Affects Phase C's rendering model.
4. **Is `CLASSIC` masonry a permanent supported mode**, or a deprecated stepping stone once V2 proves out? Affects how much long-term maintenance burden we accept from running two renderers.
5. **Interactive elements (Phase E)** — roughly what kind of engagement is Reed picturing? Not urgent, but worth capturing early thoughts before they're lost.

---

## Change log

- 2026-08-07: Initial roadmap drafted from conversation with Reed, following the shipped private-gallery-sharing feature.
