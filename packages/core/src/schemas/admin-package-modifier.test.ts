import { describe, expect, it } from 'vitest';

import {
  AdminPackageModifierCreateSchema,
  AdminPackageModifierUpdateSchema
} from './admin-packages';

// ── AdminPackageModifierCreateSchema ─────────────────────────────────────────

describe('AdminPackageModifierCreateSchema', () => {
  it('accepts a minimal CHECKBOX modifier (no config needed)', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({ packageId: 'pkg_1', name: 'Extra prints' })
        .success
    ).toBe(true);
  });

  it('accepts a CHECKBOX add-on with a positive price delta', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Extra prints',
        type: 'CHECKBOX',
        isIncluded: false,
        isRequired: false,
        priceDeltaCents: 5000,
        sortOrder: 0
      }).success
    ).toBe(true);
  });

  it('accepts a CHECKBOX included by default with a negative price delta (discount when removed)', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Sneak peek delivery',
        type: 'CHECKBOX',
        isIncluded: true,
        isRequired: false,
        priceDeltaCents: -2000
      }).success
    ).toBe(true);
  });

  it('accepts a required CHECKBOX (locked in, cannot be toggled off)', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Online gallery delivery',
        type: 'CHECKBOX',
        isIncluded: true,
        isRequired: true,
        priceDeltaCents: 0
      }).success
    ).toBe(true);
  });

  it('accepts a TOGGLE modifier with config', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Editing style',
        type: 'TOGGLE',
        isIncluded: true,
        isRequired: false,
        priceDeltaCents: -5000,
        config: { defaultLabel: 'Regular editing', altLabel: 'Light editing' },
        sortOrder: 1
      }).success
    ).toBe(true);
  });

  it('accepts a SLIDER modifier with full config', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Photo count',
        type: 'SLIDER',
        isIncluded: true,
        isRequired: false,
        config: {
          min: 20,
          max: 100,
          defaultValue: 40,
          step: 10,
          pricePerStep: 500,
          unit: 'photos'
        },
        sortOrder: 2
      }).success
    ).toBe(true);
  });

  it('accepts a SLIDER with a negative pricePerStep (fewer photos = lower price)', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Photo count',
        type: 'SLIDER',
        isIncluded: true,
        config: {
          min: 10,
          max: 60,
          defaultValue: 40,
          step: 10,
          pricePerStep: -300,
          unit: 'photos'
        }
      }).success
    ).toBe(true);
  });

  it('accepts an INCREMENTER modifier with full config', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Printed albums',
        type: 'INCREMENTER',
        isIncluded: false,
        isRequired: false,
        config: { min: 0, max: 3, defaultValue: 0, pricePerUnit: 8000, unit: 'albums' },
        sortOrder: 3
      }).success
    ).toBe(true);
  });

  it('accepts sortOrder of zero', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Extra prints',
        sortOrder: 0
      }).success
    ).toBe(true);
  });

  it('rejects a missing packageId', () => {
    expect(AdminPackageModifierCreateSchema.safeParse({ name: 'Extra prints' }).success).toBe(
      false
    );
  });

  it('rejects an empty packageId', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({ packageId: '', name: 'Extra prints' }).success
    ).toBe(false);
  });

  it('rejects a missing name', () => {
    expect(AdminPackageModifierCreateSchema.safeParse({ packageId: 'pkg_1' }).success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({ packageId: 'pkg_1', name: 'X' }).success
    ).toBe(false);
  });

  it('rejects a negative sortOrder', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Extra prints',
        sortOrder: -1
      }).success
    ).toBe(false);
  });

  it('rejects an invalid modifier type', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Extra prints',
        type: 'DROPDOWN'
      }).success
    ).toBe(false);
  });

  it('rejects a TOGGLE config with an empty label', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Editing style',
        type: 'TOGGLE',
        config: { defaultLabel: '', altLabel: 'Light editing' }
      }).success
    ).toBe(false);
  });

  it('rejects a SLIDER config with a non-positive step', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Photo count',
        type: 'SLIDER',
        config: { min: 20, max: 100, defaultValue: 40, step: 0, pricePerStep: 500, unit: 'photos' }
      }).success
    ).toBe(false);
  });

  it('rejects an INCREMENTER config with a negative min', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Albums',
        type: 'INCREMENTER',
        config: { min: -1, max: 3, defaultValue: 0, pricePerUnit: 8000, unit: 'albums' }
      }).success
    ).toBe(false);
  });

  it('rejects an INCREMENTER config with max of zero', () => {
    expect(
      AdminPackageModifierCreateSchema.safeParse({
        packageId: 'pkg_1',
        name: 'Albums',
        type: 'INCREMENTER',
        config: { min: 0, max: 0, defaultValue: 0, pricePerUnit: 8000, unit: 'albums' }
      }).success
    ).toBe(false);
  });
});

// ── AdminPackageModifierUpdateSchema ─────────────────────────────────────────

describe('AdminPackageModifierUpdateSchema', () => {
  it('accepts updating only the name', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ name: 'Renamed modifier' }).success).toBe(
      true
    );
  });

  it('accepts updating only the type', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ type: 'SLIDER' }).success).toBe(true);
  });

  it('accepts updating isIncluded independently', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ isIncluded: true }).success).toBe(true);
  });

  it('accepts updating isRequired independently', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ isRequired: false }).success).toBe(true);
  });

  it('accepts updating only the config', () => {
    expect(
      AdminPackageModifierUpdateSchema.safeParse({
        config: { defaultLabel: 'Standard', altLabel: 'Minimal' }
      }).success
    ).toBe(true);
  });

  it('accepts updating sortOrder', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ sortOrder: 5 }).success).toBe(true);
  });

  it('accepts updating priceDeltaCents to a negative value', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ priceDeltaCents: -2500 }).success).toBe(
      true
    );
  });

  it('accepts updating multiple fields at once', () => {
    expect(
      AdminPackageModifierUpdateSchema.safeParse({
        name: 'Updated modifier',
        isIncluded: true,
        sortOrder: 3,
        priceDeltaCents: 1500
      }).success
    ).toBe(true);
  });

  it('rejects an empty update object', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({}).success).toBe(false);
  });

  it('strips packageId — it cannot be changed via an update', () => {
    const result = AdminPackageModifierUpdateSchema.safeParse({ packageId: 'pkg_1', name: 'Test' });
    if (result.success) {
      expect('packageId' in result.data).toBe(false);
    }
  });

  it('enforces field-level validation on partial updates', () => {
    expect(AdminPackageModifierUpdateSchema.safeParse({ name: 'X' }).success).toBe(false);
    expect(AdminPackageModifierUpdateSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
  });
});
