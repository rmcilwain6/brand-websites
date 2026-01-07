import { describe, expect, it } from 'vitest';

import { InquiryCreateSchema } from './inquiry';

describe('InquiryCreateSchema', () => {
  it('accepts a valid payload', () => {
    const result = InquiryCreateSchema.safeParse({
      type: 'general',
      name: 'Alex Example',
      email: 'alex@example.com',
      message: 'Looking for more information.',
      payload: { source: 'website' }
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = InquiryCreateSchema.safeParse({
      type: 'general',
      name: 'Alex Example',
      email: 'invalid-email'
    });

    expect(result.success).toBe(false);
  });

  it('requires a name with at least two characters', () => {
    const missingName = InquiryCreateSchema.safeParse({
      type: 'general',
      email: 'alex@example.com'
    });
    const shortName = InquiryCreateSchema.safeParse({
      type: 'general',
      name: 'A',
      email: 'alex@example.com'
    });

    expect(missingName.success).toBe(false);
    expect(shortName.success).toBe(false);
  });
});
