## PR Checklist

### 1) Summary of scope

- [ ] Briefly describe what changed (and what did **not** change).
- [ ] List affected apps/packages.

### 2) Why this change is needed

- [ ] Explain the user or engineering problem this PR solves.
- [ ] Link issue/ticket/spec (if applicable).

### 3) Local validation evidence

> Keep this aligned with CI in `.github/workflows/tests.yml`.

- [ ] `pnpm lint` — outcome: <!-- pass/fail + key notes -->
- [ ] `pnpm build` — outcome: <!-- pass/fail + key notes -->
- [ ] Relevant app sanity check(s) — outcome: <!-- e.g., `pnpm --filter <app> dev` + manual smoke result -->

Optional CI-parity checks (recommended when relevant):

- [ ] `pnpm typecheck` — outcome:
- [ ] `pnpm format:check` — outcome:
- [ ] `pnpm test` — outcome:

### 4) Risk / rollback notes

- [ ] Risk level: <!-- low/medium/high -->
- [ ] Main risks and impacted areas:
- [ ] Rollback plan (revert steps, flags, or migrations):

### 5) Follow-ups

- [ ] None.
- [ ] If needed, list follow-up tasks with owner and scope.
