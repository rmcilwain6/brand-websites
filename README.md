# Brand Websites Monorepo

Multi-site Next.js workspace powered by pnpm workspaces and Turborepo.

## Workspace layout

```
apps/
├── evrydayarchive-web   public photography site
├── admin                admin CMS
└── reed-web             placeholder — out of scope
packages/
├── core                 shared types, Zod schemas, API helpers
├── db                   Prisma schema, client, and migrations
└── ui                   shared React components
```

Apps must not import from other apps. All shared code goes through `@repo/core`, `@repo/db`, or `@repo/ui`.

---

## Local setup

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment variables

Two files need to exist locally. They are gitignored and never committed.

**`packages/db/.env`** — read by Prisma CLI (`db:migrate`, `db:deploy`, `db:studio`, etc.):

```bash
cp packages/db/.env.example packages/db/.env
# Set DATABASE_URL to the neondb_owner connection string for the development branch
```

Use the **`neondb_owner` role** here. Migrations require DDL permissions (ALTER TABLE, CREATE TABLE) that Neon only grants to the owner role — application roles are restricted to DML only.

**`apps/admin/.env`** — read by the running Next.js admin app:

```bash
cp apps/admin/.env.example apps/admin/.env
# then fill in all values
```

| Variable                | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `DATABASE_URL`          | Neon dev branch — `local_development` role |
| `ADMIN_PASSWORD`        | Login password for the admin UI            |
| `AUTH_SECRET`           | Session signing secret (any random string) |
| `RESEND_API_KEY`        | Resend — transactional email               |
| `NOTIFICATION_EMAIL`    | Address that receives booking alerts       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account — image uploads         |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                      |

Use the **`local_development` role** here. The running app only needs DML permissions (SELECT, INSERT, UPDATE, DELETE) — using a restricted role limits blast radius if credentials are ever exposed.

Both files point at the same Neon `development` branch, but with different roles: owner for migrations, application role for the app.

**`apps/evrydayarchive-web/.env`** — the public site does not connect to the DB directly (it goes through the admin API), so `DATABASE_URL` is not needed here:

```bash
cp apps/evrydayarchive-web/.env.example apps/evrydayarchive-web/.env
```

| Variable             | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `ADMIN_API_BASE_URL` | Base URL of the admin app (e.g. `http://localhost:3001`) |

### 3) Start the apps

```bash
pnpm dev                             # all apps in parallel
pnpm --filter evrydayarchive-web dev # public site only (port 3000)
pnpm --filter admin dev              # admin only (port 3001)
```

---

## Database

### Setup

One Neon project (`brand-websites-db-production`) with two branches:

| Branch        | Used by                                |
| ------------- | -------------------------------------- |
| `production`  | Vercel production deployment           |
| `development` | Local dev + Vercel preview deployments |

Your local `DATABASE_URL` always points to the `development` branch. Get the connection string from the Neon console: open the project → select the `development` branch → Connection details → choose the `local_development` role.

### The two commands — and when to use each

| Command           | When                                                         | What it does                                                                                                                             |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate` | **Local dev only.** After editing `schema.prisma`.           | Creates a new `.sql` migration file in `packages/db/prisma/migrations/`, applies it to your local DB, and regenerates the Prisma client. |
| `pnpm db:deploy`  | **Deploying.** Applying migrations to production or preview. | Applies any pending migration files that are already in the repo. Creates nothing new.                                                   |

The short version: **`migrate` creates migration files. `deploy` applies them.**

Once a migration file exists in the repo (i.e. you ran `migrate` and committed), you never need to run `migrate` again for that change — only `deploy` on each target environment.

### Workflow: making a schema change

```bash
# 1. Edit packages/db/prisma/schema.prisma

# 2. Create the migration and apply it locally
pnpm db:migrate
# Prisma will prompt for a migration name (e.g. "add_user_preferences")

# 3. Commit the migration file alongside your code changes
git add packages/db/prisma/migrations/
git commit -m "..."

# 4. Apply to production after merging (see Deploying migrations below)
```

### Deploying migrations to production

After merging code that includes a new migration, apply it to the production branch before or immediately after the Vercel deployment goes live:

```bash
DATABASE_URL="<production-branch-neondb_owner-connection-string>" pnpm db:deploy
```

Get the connection string from Neon: select the `production` branch → Connection details → **`neondb_owner` role**. The same DDL permission requirement applies — application roles cannot run migrations.

Apply to the preview/development branch the same way if it has drifted:

```bash
# packages/db/.env already points at development branch, so just:
pnpm db:deploy
```

### Other useful commands

```bash
pnpm db:status   # show which migrations are applied vs pending on the connected DB
pnpm db:studio   # open Prisma Studio (visual DB browser) against your local DB
```

Run from `packages/db` directly for commands not aliased at the root:

```bash
pnpm --filter @repo/db db:reset        # drop and recreate all tables (destructive — dev only)
pnpm --filter @repo/db db:reset:force  # same, skips confirmation prompt
```

---

## Deployment & hosting

| App                  | Host              | Domain                         |
| -------------------- | ----------------- | ------------------------------ |
| `evrydayarchive-web` | Vercel            | `evrydayarchive.co`            |
| `admin`              | Vercel            | `admin.evrydayarchive.co`      |
| Database             | Neon (PostgreSQL) | `brand-websites-db-production` |

Both apps are deployed as separate Vercel projects configured via the Vercel dashboard. There is no `vercel.json` in the repo — all deployment config lives in the Vercel UI.

### Vercel environment variables

`DATABASE_URL` is scoped per environment in Vercel:

| Vercel environment | `DATABASE_URL` points at  |
| ------------------ | ------------------------- |
| Production         | Neon `production` branch  |
| Preview            | Neon `development` branch |

The public site's `ADMIN_API_BASE_URL` is set in its Vercel project env vars and points to `admin.evrydayarchive.co`.

---

## Admin authentication

Single-password session auth. Set in `apps/admin/.env`:

```
ADMIN_PASSWORD=your-strong-password
AUTH_SECRET=some-random-string
```

Visit `/login` in the admin app to sign in.

---

## Quality checks

Always run these in order before committing (also enforced by CI):

```bash
pnpm format       # Prettier — must run at workspace root
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm build        # Next.js production build — catches config/bundler errors
```

Scope to a single app if only touching one:

```bash
pnpm --filter evrydayarchive-web lint
pnpm --filter evrydayarchive-web typecheck
```

---

## Testing

```bash
pnpm test          # run Vitest suite
pnpm test:watch    # watch mode
pnpm test:ci       # CI mode with coverage
```

Tests live alongside the code they test:

- `packages/**/src/**/*.test.ts` — unit/contract tests for shared packages
- `apps/**/app/**/route.test.ts` — integration tests for route handlers

---

## API contract

All APIs follow a shared request/response contract defined in `packages/core/src/api`.

Admin public endpoints under `/api/public/*` return raw JSON (no envelope). All other API responses use the standard envelope:

```json
{ "ok": true, "data": {} }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

**Adding a new endpoint:**

1. Define a Zod schema in `packages/core/src/schemas/<feature>.ts`.
2. Use `parseJson` for request body validation.
3. Return responses with `jsonOk` / `jsonError`.

```ts
import { ExampleSchema, jsonError, jsonOk, parseJson } from '@repo/core';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, ExampleSchema);
  if (!result.ok) return jsonError(result.error);
  return jsonOk({ received: true });
};
```

---

## Troubleshooting

- **Server error on `/bookings` or other admin pages** — your local DB may be missing a migration. Run `pnpm db:status` to check, then `pnpm db:deploy` to apply any pending ones.
- **`Environment variable not found: DATABASE_URL`** — verify `packages/db/.env` and `apps/admin/.env` both exist and contain `DATABASE_URL`.
- **Public site shows no portfolio data** — ensure `ADMIN_API_BASE_URL` points to a running admin instance and that `pnpm --filter admin dev` is running.
- **Admin login fails** — verify `ADMIN_PASSWORD` and `AUTH_SECRET` are set in `apps/admin/.env` and restart the dev server after changes.
- **Booking emails not sending** — check `RESEND_API_KEY` and `NOTIFICATION_EMAIL` are set in `apps/admin/.env`. Navigate to the booking in `/bookings` on the admin — the email status section will show the exact error if one occurred.
- **Cloudinary uploads fail** — verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in `apps/admin/.env`.
