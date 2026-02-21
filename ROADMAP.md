# Project Roadmap & Execution Tracker

Last updated: 2026-02-19  
Scope: `brand-websites` monorepo (`apps/*`, `packages/*`)  
Primary source constraints: `AGENTS.md` + Q1 build brief

---

## 1) Purpose of this document

Use this file as the **single source of truth for current project status and next actions** so you can:

- pause/resume work quickly,
- hand tasks to Codex/agents with clear context,
- keep scaffolding quality high before feature acceleration.

This roadmap is intentionally execution-oriented (clear checklists, dependencies, and “next step” prompts).

---

## 2) Working rules (from AGENTS.md + your operating preferences)

These are non-negotiable guardrails for all upcoming work:

- Keep the repo shippable; prefer small, verifiable PRs.
- Apps must only share code through packages (`@repo/ui`, `@repo/core`, `@repo/db`); **no app-to-app imports**.
- Q1 focus: `apps/evrydayarchive-web` + `apps/admin`; `apps/reed-web` remains structural/skeleton.
- No public user accounts in Q1; booking is request-based; no in-app payments.
- TypeScript strict + Tailwind conventions + Zod validation for request payloads.
- For meaningful changes, run at repo root:
  - `pnpm lint`
  - `pnpm build`
  - and relevant runtime sanity checks as needed.
- PR hygiene: focused commits with intent-based messages.

Your added requirement (captured here):

- Every PR must be validated locally before merge (build/run confidence is mandatory).

---

## 3) Current state snapshot (based on static repo inspection)

### Monorepo/platform scaffolding

- ✅ Turborepo + pnpm workspace structure is in place (`apps/*`, `packages/*`, `turbo.json`, `pnpm-workspace.yaml`).
- ✅ Three apps exist:
  - `apps/evrydayarchive-web` (public site)
  - `apps/admin` (admin CMS)
  - `apps/reed-web` (placeholder)
- ✅ Shared packages exist and are wired:
  - `packages/core` (schemas/API helpers/tests)
  - `packages/ui` (base UI components)
  - `packages/db` (Prisma schema/client setup)

### Quality/tooling scaffolding

- ✅ Root scripts/docs include lint, build, format, test commands (`README.md`, root `package.json` workflows implied).
- ✅ CI workflow exists (`.github/workflows/tests.yml`) and runs:
  - install
  - prisma generate
  - typecheck
  - lint
  - format check
  - build
  - tests

### Product implementation progress (Q1)

- ✅ Public + admin gallery flows are scaffolded (routes/pages for gallery creation, publish, and public fetch).
- ✅ Inquiry and health API routes exist.
- ⚠️ Many Q1 feature surfaces from brief are still to be built or expanded (packages page UX, package builder UX + pricing logic, booking calendar request flow, richer CMS entities and workflows, notifications).
- ⚠️ `reed-web` appears intentionally minimal (aligned with Q1 scope).

---

## 4) Roadmap phases

## Phase 0 — Foundation hardening (do this first)

Goal: make daily agent-driven development low-risk and repeatable.

- [ ] Confirm/standardize root scripts and workspace task names used by humans + CI:
  - lint, typecheck, build, test, format:check
- [ ] Add/verify **PR checklist template** (`.github/pull_request_template.md`) requiring:
  - scope summary
  - local validation evidence (`pnpm lint`, `pnpm build`, app boot sanity)
  - risks/rollback notes
- [ ] Add/verify issue templates for bug/feature requests (`.github/ISSUE_TEMPLATE/*`).
- [ ] Add `CODEOWNERS` (if desired) for review routing.
- [ ] Tighten README “Getting Started in 10 minutes” with copy-paste commands and env setup for admin + public app.
- [ ] Add “Agent Workflow” section in README (how to reference this roadmap + request next step).
- [ ] Define and document Q1 testing strategy + PR testing expectations:
  - minimum required checks per PR
  - recommended depth by change type (docs, UI, API, schema)
  - what lightweight E2E smoke should include for this repo

Exit criteria:

- A new contributor can clone, configure env, run lint/build/test, and launch target apps with no ambiguity.

---

## Phase 1 — Q1 domain model and CMS completion

Goal: get admin foundation complete enough to power public site features.

- [ ] Validate current Prisma schema coverage for Q1 entities from brief:
  - Gallery, ImageAsset, Package, PackageModifier, TimeSlot, Inquiry, BookingRequest
- [ ] Implement missing schema pieces + migrations in `packages/db`.
- [ ] Add/expand admin APIs and pages for CRUD where incomplete:
  - packages + modifiers
  - availability slots
  - booking requests
  - inquiries management
- [ ] Ensure validation boundaries use shared Zod schemas in `@repo/core`.
- [ ] Add test coverage for critical admin route handlers and schema validation.

Exit criteria:

- Admin can manage all Q1 content/data needed by public site without direct DB edits.

---

## Phase 2 — Evryday public conversion flows

Goal: production-ready customer-facing experience for Q1.

- [ ] Complete/expand core page set:
  - Home, Portfolio, Packages, Package Builder, Process, FAQ, Book/Inquire, Contact
- [ ] Implement Package Builder V1:
  - base package selection
  - allowed modifiers
  - dynamic price update
  - summary + inquiry record creation
- [ ] Implement booking request UX:
  - available slots display
  - “choose slot” or “request custom time”
  - request submission only (no auto-confirm)
- [ ] Ensure accessibility and clear CTA-focused UX.
- [ ] Add integration tests for key route logic (pricing request payload validation, inquiry/booking request acceptance).

Exit criteria:

- A visitor can understand offerings, estimate package, and submit an inquiry/booking request cleanly.

---

## Phase 3 — Operational readiness & deploy confidence

Goal: reduce regressions and deployment friction.

- [ ] Add branch protections/check requirements to match CI gates.
- [ ] Add preview/deployment strategy docs per app (even if deploy infra remains external).
- [ ] Add error handling/logging guidelines with sensitive-data redaction constraints.
- [ ] Add smoke-check procedure per PR:
  - build passes
  - app boots
  - critical route(s) respond
- [ ] Optional: add lightweight E2E smoke tests for top public + admin flows.

Exit criteria:

- Each PR follows a repeatable local+CI quality bar and release path is documented.

---

## 5) Prioritized backlog (ordered)

1. **Foundation docs + contribution workflow hardening** (Phase 0).
2. **Schema/API completion for packages, modifiers, slots, bookings** (Phase 1).
3. **Public Package Builder + booking request flows** (Phase 2).
4. **Notifications + final UX polish for conversion pages** (Phase 2).
5. **Operational guardrails and smoke automation** (Phase 3).

---

## 6) PR execution template (copy for every task)

Use this lightweight loop:

1. Choose the top unchecked item from this roadmap.
2. Define smallest viable scope (1 PR).
3. Implement with shared package boundaries respected.
4. Validate locally:
   - `pnpm lint`
   - `pnpm build`
   - targeted runtime sanity checks (affected apps)
5. Open PR with:
   - what changed
   - why
   - validation evidence
   - tradeoffs / follow-ups
6. Mark roadmap item progress.

---

## 7) “Ask Codex for next step” prompt recipes

Use one of these prompts verbatim:

- **Execution prompt:**  
  “Read `ROADMAP.md`. Take the highest-priority unchecked item in Phase 0 and implement it in a minimal PR. Follow AGENTS.md rules. Run lint and build, then summarize.”

- **Planning prompt:**  
  “Read `ROADMAP.md` and AGENTS.md. Propose the next 3 PRs (smallest-first) with acceptance criteria and risks.”

- **Recovery prompt after time away:**  
  “Read `ROADMAP.md`, inspect current repo status, and tell me what is complete vs pending. Recommend the single best next PR to unblock momentum.”

---

## 8) Decisions captured from latest planning pass

- ✅ CI/CD approach: keep GitHub Actions-focused CI for now; this is sufficient for current phase.
- ✅ Testing depth decision moved into **Phase 0** as a concrete planning/delivery task.
- ✅ CMS content ownership assumption: single primary contributor for now (admin UX can prioritize clarity over multi-editor workflows).
- ✅ Roadmap format decision: keep a single `ROADMAP.md` file for now (no split).
- ⚠️ Notifications provider remains open; prefer a low-cost email-first API/service when selected.

### Remaining open question

1. Notifications: which provider should Q1 target for booking/inquiry emails (e.g., Resend, Postmark, SES), balancing lowest operational cost with reliable delivery?

---

## 9) Change log

- 2026-02-18: Initial roadmap created from repo inspection + AGENTS.md + provided build brief.
- 2026-02-19: Updated based on planning feedback (added Phase 0 testing-strategy task and captured resolved decisions from Section 8 responses).
