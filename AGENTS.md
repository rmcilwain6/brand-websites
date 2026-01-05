# AGENTS.md
Guidelines for AI agents (Codex) working in this repository

This repo is a pnpm + Turborepo monorepo with multiple Next.js apps and shared packages. These rules exist to keep changes safe, consistent, and easy to review.

## 1) Prime directives
- Keep the repo shippable at all times. Never leave the workspace in a broken state.
- Prefer small, verifiable changes over sweeping refactors.
- Do not introduce new frameworks or architectural patterns unless explicitly requested.
- Do not change public behavior without updating docs and tests (when present).

## 2) Repository layout (do not break)
- `/apps/*` are deployable applications.
  - `apps/evrydayarchive-web` (public marketing/service site)
  - `apps/admin` (admin CMS)
  - `apps/reed-web` (placeholder in Q1)
- `/packages/*` are shared libraries. Apps may only share code through packages.
  - `packages/ui` (shared React UI components)
  - `packages/core` (types, utilities, validation)
  - `packages/db` (database layer: schema + client + migrations later)

### Hard rule
- **Apps must not import from other apps.**
- Allowed imports: `@repo/ui`, `@repo/core`, `@repo/db` (or equivalent workspace aliases).

## 3) Working style
When implementing a task:
1) Identify the smallest set of files that must change.
2) Implement.
3) Run checks.
4) Summarize what changed and why.
5) Call out any tradeoffs.

Avoid “drive-by” edits unrelated to the requested change.

## 4) Tech choices (do not deviate unless asked)
- Next.js App Router
- TypeScript everywhere, strict mode
- Tailwind for styling
- Zod for validation (when needed)
- PostgreSQL is the expected DB later (via Prisma or Drizzle), but do not add DB tooling unless the task requires it.
- No user accounts for the public site in Q1. Admin-only auth only, when implemented.

## 5) Code quality standards
- Keep components small and composable.
- Prefer explicit names over clever abstractions.
- Add types for any non-trivial object shape.
- Use Zod for validating request payloads where it matters.
- Handle errors thoughtfully (no silent failures).
- Add `aria-*` attributes and keyboard focus states for interactive UI.

## 6) Styling and UI conventions
- Use Tailwind classes for layout and styling.
- Keep UI consistent and minimal.
- Use shared components from `packages/ui` for buttons, inputs, cards, etc.
- Avoid heavy animation unless explicitly requested.

## 7) Environment variables
- Never hardcode secrets.
- Add new env vars to the relevant `apps/<app>/.env.example`.
- Read env vars only in the app that needs them.
- If you add a required env var, also update README with setup steps.

## 8) Data and schema conventions (when DB is added)
- Prefer normalized tables for core entities.
- Store “submission payloads” as structured JSON only when it’s genuinely flexible.
- Use timestamps (`createdAt`, `updatedAt`) consistently.
- Always include migrations and keep them committed.

Expected Q1 entities (do not implement unless asked):
- Gallery, ImageAsset, Package, PackageModifier, TimeSlot, Inquiry, BookingRequest

## 9) Booking and payments constraints (important)
- Booking is **request-based** in Q1.
- The calendar can show real slots, but selecting a slot does not auto-confirm.
- No payments collected in-app for Q1.

## 10) Testing and verification
After any meaningful change, run:
- `pnpm lint`
- `pnpm build`
- If relevant: `pnpm dev` sanity check

If a change touches multiple workspaces, prefer running checks at the repo root.

## 11) Commit / PR hygiene (if generating commits)
- Keep commits focused.
- Write messages that explain intent, not just files changed.
- Example: `feat(admin): add gallery CRUD scaffold` not `update files`.

## 12) Documentation expectations
When you introduce a new feature or workflow, update:
- `README.md` for developer setup
- relevant `apps/*/README.md` if present
- `.env.example` files for new configuration

## 13) What to do when uncertain
If requirements are ambiguous:
- Make the most reasonable, minimal assumption.
- Document the assumption in the output notes.
- Do not pause for clarification unless absolutely necessary.

## 14) Security and privacy
- Do not log sensitive data (emails, phone numbers, inquiry payloads) in server logs.
- Validate and sanitize all public form inputs.
- Rate limit public endpoints if adding submission routes.
- Prefer server-side revalidation of any client-side calculated pricing.

## 15) Performance basics
- Use Next.js Image for images where appropriate.
- Avoid shipping large client bundles by default.
- Keep pages server components unless interactivity is required.

