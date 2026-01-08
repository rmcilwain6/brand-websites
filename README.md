# Brand Websites Monorepo

Multi-site Next.js workspace powered by pnpm workspaces and Turborepo.

## Getting started

```bash
pnpm install
```

## Development

Run all apps in parallel:

```bash
pnpm dev
```

Run an individual app:

```bash
pnpm --filter evrydayarchive-web dev
pnpm --filter admin dev
pnpm --filter reed-web dev
```

## Database (Local Dev)

Set the database URL in each app environment file (and optionally
`packages/db/.env` for Prisma commands):

```bash
# apps/admin/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evrydayarchive

# apps/evrydayarchive-web/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evrydayarchive

# packages/db/.env (optional for Prisma CLI)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evrydayarchive
```

Generate the Prisma client and run the development migration:

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

Reset the database (drops all tables/data in the target database):

```bash
# interactive confirmation
pnpm --filter @repo/db db:reset

# non-interactive (dangerous)
pnpm --filter @repo/db db:reset:force
```

Note: reset does not create the database itself. The database must already exist.

## Admin authentication

The admin app uses a single password-based session. Configure these values in
`apps/admin/.env`:

```bash
ADMIN_PASSWORD=your-strong-password
AUTH_SECRET=some-random-string
```

## Creating the first gallery

1. Start the admin app: `pnpm --filter admin dev`.
2. Visit `/login` and sign in with `ADMIN_PASSWORD`.
3. Create a gallery in `/galleries`, then add image assets by URL and attach them.
4. Set the gallery status to `PUBLISHED` to expose it on the public `/portfolio` page.

## Build

```bash
pnpm build
```

## Linting and formatting

```bash
pnpm lint
pnpm format
```

## Testing

Run the Vitest suite from the repo root:

```bash
pnpm test
```

Pull requests run `pnpm test` automatically in CI.

Watch mode:

```bash
pnpm test:watch
```

CI coverage run:

```bash
pnpm test:ci
```

Tests live alongside core logic in `packages/**/src/**/*.test.ts` and alongside route handlers in
`apps/**/app/**/route.test.ts`. Start by testing shared schema and API helpers in `packages/core`.

## Workspace layout

- Apps live in `apps/`
  - `apps/evrydayarchive-web`
  - `apps/admin`
  - `apps/reed-web`
- Shared packages live in `packages/`
  - `packages/ui` (shared React components)
  - `packages/core` (types, utilities, zod schemas)
  - `packages/db` (database placeholder)

## API Contract

All APIs follow a shared request/response contract defined in `packages/core/src/api`.

**Success response shape**

```json
{
  "ok": true,
  "data": {}
}
```

**Error response shape**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed.",
    "details": []
  }
}
```

**Schema location**

- Add request/response schemas to `packages/core/src/schemas/<feature>.ts`.

**Adding a new endpoint**

1. Define a Zod schema in `packages/core/src/schemas/<feature>.ts`.
2. Use `parseJson` for request validation in the route handler.
3. Return responses with `jsonOk` / `jsonError` so the shape stays consistent.

**Example route handler**

```ts
import { ExampleSchema, jsonError, jsonOk, parseJson } from '@repo/core';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, ExampleSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  return jsonOk({ received: true });
};
```
