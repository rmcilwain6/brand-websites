# Claude Code — brand-websites

Instructions and conventions for Claude Code sessions in this repo.

## Before committing any changes

Always run the following in order and fix any issues before committing:

```bash
pnpm format          # Prettier — format all files
pnpm lint            # ESLint across all packages
pnpm typecheck       # TypeScript checks across all packages
```

If only touching a single app, you can scope lint/typecheck:

```bash
pnpm --filter evrydayarchive-web lint
pnpm --filter evrydayarchive-web typecheck
```

`pnpm format` must always be run at the workspace root (not per-package) since Prettier is configured there.

## Committing changes

Commit after every key code change — keep history granular and clear. Run the format/lint/typecheck checks first, then commit. Don't batch up multiple unrelated changes into one commit.
