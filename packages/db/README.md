# @repo/db

Database utilities for the monorepo. This package owns the Prisma schema and
client used by the apps.

## Setup

1. Ensure `DATABASE_URL` is set in the relevant app `.env` file (see the root
   README for details).
2. Generate the Prisma client:

```bash
pnpm --filter @repo/db db:generate
```

3. Run the development migration:

```bash
pnpm --filter @repo/db db:migrate
```

4. Optional: open Prisma Studio:

```bash
pnpm --filter @repo/db db:studio
```
