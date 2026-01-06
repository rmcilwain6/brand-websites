import { z } from 'zod';

import { createApiError } from './errors';
import type { ApiError } from './types';

export const parseJson = async <T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> => {
  let body: unknown;

  try {
    body = await req.json();
  } catch (error) {
    return {
      ok: false,
      error: createApiError(
        'VALIDATION_ERROR',
        'Invalid JSON payload.',
        error instanceof Error ? error.message : error
      ),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      error: createApiError(
        'VALIDATION_ERROR',
        'Request body validation failed.',
        parsed.error.issues
      ),
    };
  }

  return { ok: true, data: parsed.data };
};
