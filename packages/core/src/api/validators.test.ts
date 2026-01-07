import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseJson } from './validators';

describe('parseJson', () => {
  it('returns parsed data when body is valid', async () => {
    const schema = z.object({ name: z.string() });
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ada Lovelace' }),
      headers: { 'content-type': 'application/json' }
    });

    const result = await parseJson(req, schema);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: 'Ada Lovelace' });
    }
  });

  it('returns validation errors when schema check fails', async () => {
    const schema = z.object({ email: z.string().email() });
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
      headers: { 'content-type': 'application/json' }
    });

    const result = await parseJson(req, schema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Request body validation failed.');
      expect(result.error.details).toBeTruthy();
    }
  });

  it('returns a validation error when JSON parsing fails', async () => {
    const schema = z.object({ id: z.string() });
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: '{ invalid json',
      headers: { 'content-type': 'application/json' }
    });

    const result = await parseJson(req, schema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid JSON payload.');
    }
  });
});
