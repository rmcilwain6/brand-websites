import { describe, expect, it } from 'vitest';

import { readJson } from '@repo/core';

import { POST } from './route';

describe('POST /api/inquiries', () => {
  it('accepts a valid inquiry', async () => {
    const req = new Request('http://localhost/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        type: 'general',
        name: 'Jamie Example',
        email: 'jamie@example.com',
        message: 'Looking for session details.'
      }),
      headers: { 'content-type': 'application/json' }
    });

    const response = await POST(req);
    const body = await readJson<{ ok: true; data: { received: boolean } }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.received).toBe(true);
  });

  it('returns a validation error for invalid emails', async () => {
    const req = new Request('http://localhost/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        type: 'general',
        name: 'Jamie Example',
        email: 'invalid-email'
      }),
      headers: { 'content-type': 'application/json' }
    });

    const response = await POST(req);
    const body = await readJson<{
      ok: false;
      error: { code: string; message: string; details?: unknown };
    }>(response);

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
