import path from 'node:path';

import { defineConfig } from 'vitest/config';

const repoRoot = __dirname;

export default defineConfig({
  resolve: {
    alias: {
      '@repo/ui': path.join(repoRoot, 'packages/ui/src'),
      '@repo/core': path.join(repoRoot, 'packages/core/src'),
      '@repo/db': path.join(repoRoot, 'packages/db/src')
    }
  },
  test: {
    environment: 'node',
    globals: false,
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/**/app/**/__tests__/**/*.test.ts',
      'apps/**/app/**/*.test.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**'
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/core/src/**'],
      exclude: [
        '**/*.test.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**'
      ]
    }
  }
});
