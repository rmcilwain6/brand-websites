import { describe, expect, it } from 'vitest';

import { jsonError, jsonOk } from './response';

describe('jsonOk', () => {
  it('wraps data in an ok response', async () => {
    const response = jsonOk({ message: 'hello' }, { status: 201 });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ ok: true, data: { message: 'hello' } });
  });
});

describe('jsonError', () => {
  it('uses the default status from the error map', async () => {
    const response = jsonError({ code: 'NOT_FOUND', message: 'Missing' });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Missing' }
    });
  });

  it('respects an explicit status override', async () => {
    const response = jsonError({ code: 'INTERNAL', message: 'Boom' }, 503);

    expect(response.status).toBe(503);
  });
});
