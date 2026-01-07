import { describe, expect, it } from 'vitest';

import { apiErrorStatusMap } from './errors';

describe('apiErrorStatusMap', () => {
  it('maps error codes to default HTTP statuses', () => {
    expect(apiErrorStatusMap).toMatchObject({
      VALIDATION_ERROR: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      INTERNAL: 500
    });
  });
});
