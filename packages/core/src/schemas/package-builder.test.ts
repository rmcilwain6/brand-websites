import { describe, expect, it } from 'vitest';

import { PackageBuilderRequestPayloadSchema } from './package-builder';

describe('PackageBuilderRequestPayloadSchema', () => {
  it('accepts a valid package builder payload', () => {
    const result = PackageBuilderRequestPayloadSchema.safeParse({
      packageId: 'pkg_basic',
      guestCount: 6,
      selectedModifierIds: ['mod_1', 'mod_2'],
      requestedDate: '2026-04-20T15:00:00.000Z',
      location: 'Austin, TX',
      notes: 'Golden hour preferred.'
    });

    expect(result.success).toBe(true);
  });

  it('rejects guest count outside supported boundaries', () => {
    const tooLow = PackageBuilderRequestPayloadSchema.safeParse({
      packageId: 'pkg_basic',
      guestCount: 0,
      requestedDate: '2026-04-20T15:00:00.000Z'
    });
    const tooHigh = PackageBuilderRequestPayloadSchema.safeParse({
      packageId: 'pkg_basic',
      guestCount: 101,
      requestedDate: '2026-04-20T15:00:00.000Z'
    });

    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('rejects invalid date formats', () => {
    const result = PackageBuilderRequestPayloadSchema.safeParse({
      packageId: 'pkg_basic',
      guestCount: 4,
      requestedDate: '04/20/2026'
    });

    expect(result.success).toBe(false);
  });
});
