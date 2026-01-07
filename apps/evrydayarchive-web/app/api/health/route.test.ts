import { describe, expect, it } from 'vitest';

import { readJson } from '@repo/core';

import { GET } from './route';

describe('GET /api/health', () => {
  it('returns ok status with timestamp', async () => {
    const response = await GET();
    const body = await readJson<{ ok: true; data: { status: string; timestamp: string } }>(
      response
    );

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(typeof body.data.timestamp).toBe('string');
  });
});
