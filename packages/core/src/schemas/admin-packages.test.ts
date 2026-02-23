import { describe, expect, it } from 'vitest';

import {
  AdminPackageCreateSchema,
  AdminPackageModifierCreateSchema,
  AdminPackageModifierUpdateSchema,
  AdminPackageUpdateSchema
} from './admin-packages';

describe('Admin package schemas', () => {
  it('accepts valid package and modifier create payloads', () => {
    const packageResult = AdminPackageCreateSchema.safeParse({
      slug: 'signature-session',
      name: 'Signature Session',
      description: 'Our most popular package.',
      basePriceCents: 25000,
      status: 'ACTIVE'
    });

    const modifierResult = AdminPackageModifierCreateSchema.safeParse({
      packageId: 'pkg_signature',
      name: 'Extra Prints',
      description: 'Set of 10 additional prints',
      priceDeltaCents: 5000,
      isRequired: false
    });

    expect(packageResult.success).toBe(true);
    expect(modifierResult.success).toBe(true);
  });

  it('rejects invalid package create values', () => {
    const badSlug = AdminPackageCreateSchema.safeParse({
      slug: 'Bad Slug',
      name: 'Signature Session'
    });
    const negativeBasePrice = AdminPackageCreateSchema.safeParse({
      slug: 'signature-session',
      name: 'Signature Session',
      basePriceCents: -1
    });

    expect(badSlug.success).toBe(false);
    expect(negativeBasePrice.success).toBe(false);
  });

  it('requires at least one field for package and modifier updates', () => {
    const emptyPackageUpdate = AdminPackageUpdateSchema.safeParse({});
    const emptyModifierUpdate = AdminPackageModifierUpdateSchema.safeParse({});

    expect(emptyPackageUpdate.success).toBe(false);
    expect(emptyModifierUpdate.success).toBe(false);
  });
});
