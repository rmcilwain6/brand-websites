import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { loadEnv } from './env';

describe('loadEnv', () => {
  it('returns validated env data', () => {
    const schema = z.object({
      ADMIN_PASSWORD: z.string().min(1),
      AUTH_SECRET: z.string().min(1)
    });

    const result = loadEnv(schema, {
      ADMIN_PASSWORD: 'password',
      AUTH_SECRET: 'secret'
    });

    expect(result).toEqual({
      ADMIN_PASSWORD: 'password',
      AUTH_SECRET: 'secret'
    });
  });

  it('throws a helpful error when validation fails', () => {
    const schema = z.object({
      ADMIN_PASSWORD: z.string().min(1),
      AUTH_SECRET: z.string().min(1)
    });

    expect(() => loadEnv(schema, { ADMIN_PASSWORD: '' })).toThrow('Invalid environment variables');
  });
});
