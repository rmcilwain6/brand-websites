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
- A running PostgreSQL instance (or use the Neon connection string from `.env`)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment variables

Copy the example files and fill in any blank values:

```bash
cp apps/admin/.env.example apps/admin/.env
cp apps/evrydayarchive-web/.env.example apps/evrydayarchive-web/.env
```

**`apps/admin/.env`** — required vars:

| Variable                | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string               |
| `ADMIN_PASSWORD`        | Login password for the admin UI            |
| `AUTH_SECRET`           | Session signing secret (any random string) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account — image uploads         |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                      |

**`apps/evrydayarchive-web/.env`** — required vars:

| Variable                  | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `ADMIN_API_BASE_URL`      | Base URL of the admin app (for fetching galleries/packages) |
| `DATABASE_URL`            | PostgreSQL connection string (used for waitlist writes)     |
| `NEXT_PUBLIC_COMING_SOON` | Set `"true"` to redirect all routes to `/coming-soon`       |

For Prisma CLI commands run directly from `packages/db`, also create:

```bash
cp apps/admin/.env packages/db/.env   # or set DATABASE_URL manually
```

### 3) Generate Prisma client and run migrations

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

### 4) Start the apps

```bash
pnpm dev                             # all apps in parallel
pnpm --filter evrydayarchive-web dev # public site only (port 3000)
pnpm --filter admin dev              # admin only (port 3001)
```

---

## Deployment & hosting

| App                  | Host              | Domain                    |
| -------------------- | ----------------- | ------------------------- |
| `evrydayarchive-web` | Vercel            | `evrydayarchive.co`       |
| `admin`              | Vercel            | `admin.evrydayarchive.co` |
| Database             | Neon (PostgreSQL) | shared across envs        |

Both apps are deployed as separate Vercel projects, each configured via the Vercel dashboard (build commands, env vars, domains). There is no `vercel.json` in the repo — all deployment config lives in the Vercel UI.

The public site's `ADMIN_API_BASE_URL` is set in its Vercel project env vars and points to `admin.evrydayarchive.co`.

**Coming-soon mode** is controlled by `NEXT_PUBLIC_COMING_SOON=true` in the public app's environment. When enabled, middleware redirects all routes to `/coming-soon` except `/api/*`. The coming-soon page includes a waitlist email capture form.

---

## Database

Managed via Prisma in `packages/db`. The same Neon database is used in both local dev (pointed at by your local `.env` files) and in production.

```bash
# Regenerate Prisma client after schema changes
pnpm --filter @repo/db db:generate

# Create and apply a new migration
pnpm --filter @repo/db db:migrate

# Reset the database (destructive — drops all tables)
pnpm --filter @repo/db db:reset
pnpm --filter @repo/db db:reset:force   # skips interactive confirmation
```

Note: `db:reset` does not create the database itself — it must already exist.

---

## Admin authentication

Single-password session auth. Set in `apps/admin/.env`:

```bash
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

**Testing strategy (target ratios):**

- Unit + integration: ~80–90% of the suite
- Contract tests: ~10–15%
- E2E smoke tests: ~5% (critical paths only — login, gallery publish, public portfolio)

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

- **`Environment variable not found: DATABASE_URL`** — verify `.env` files exist in `apps/admin`, `apps/evrydayarchive-web`, and optionally `packages/db`.
- **Public site shows no portfolio data** — ensure `ADMIN_API_BASE_URL` points to a running admin instance and that `pnpm --filter admin dev` is running.
- **Admin login fails** — verify `ADMIN_PASSWORD` and `AUTH_SECRET` are set in `apps/admin/.env` and restart the dev server after changes.
- **Cloudinary uploads fail** — verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in `apps/admin/.env`.
