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

## Build

```bash
pnpm build
```

## Linting and formatting

```bash
pnpm lint
pnpm format
```

## Workspace layout

- Apps live in `apps/`
  - `apps/evrydayarchive-web`
  - `apps/admin`
  - `apps/reed-web`
- Shared packages live in `packages/`
  - `packages/ui` (shared React components)
  - `packages/core` (types, utilities, zod schemas)
  - `packages/db` (database placeholder)
