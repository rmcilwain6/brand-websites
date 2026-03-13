import { describe, expect, it } from 'vitest';

import {
  PublicModifierConfigSchema,
  PublicPackageListResponseSchema,
  PublicPackageModifierSchema,
  PublicPackageSchema
} from './public-packages';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const checkboxModifier = {
  id: 'mod_1',
  name: 'Extra prints',
  description: 'Set of 10 additional prints.',
  type: 'CHECKBOX' as const,
  isIncluded: false,
  isRequired: false,
  priceDeltaCents: 5000,
  config: null,
  sortOrder: 0
};

const toggleModifier = {
  id: 'mod_2',
  name: 'Editing style',
  description: 'Choose between regular and light editing.',
  type: 'TOGGLE' as const,
  isIncluded: true,
  isRequired: false,
  priceDeltaCents: -5000,
  config: { defaultLabel: 'Regular editing', altLabel: 'Light editing' },
  sortOrder: 1
};

const sliderModifier = {
  id: 'mod_3',
  name: 'Photo count',
  description: 'Number of final edited photos.',
  type: 'SLIDER' as const,
  isIncluded: true,
  isRequired: false,
  priceDeltaCents: null,
  config: { min: 20, max: 100, defaultValue: 40, step: 10, pricePerStep: 500, unit: 'photos' },
  sortOrder: 2
};

const incrementerModifier = {
  id: 'mod_4',
  name: 'Printed albums',
  description: null,
  type: 'INCREMENTER' as const,
  isIncluded: false,
  isRequired: false,
  priceDeltaCents: null,
  config: { min: 0, max: 3, defaultValue: 0, pricePerUnit: 8000, unit: 'albums' },
  sortOrder: 3
};

const basePackage = {
  id: 'pkg_1',
  slug: 'signature-session',
  name: 'Signature Session',
  summaryLine: 'Perfect for couples and small families.',
  description: 'Our most popular package for milestone moments.',
  durationMinutes: 120,
  deliverables: ['40 edited photos', 'Online gallery delivery'],
  notes: 'Travel within 30km of Ottawa included.',
  basePriceCents: 35000,
  sortOrder: 1,
  modifiers: []
};

// ── PublicModifierConfigSchema ────────────────────────────────────────────────

describe('PublicModifierConfigSchema', () => {
  it('accepts null (used for CHECKBOX type)', () => {
    expect(PublicModifierConfigSchema.safeParse(null).success).toBe(true);
  });

  it('accepts a valid toggle config', () => {
    expect(
      PublicModifierConfigSchema.safeParse({
        defaultLabel: 'Regular editing',
        altLabel: 'Light editing'
      }).success
    ).toBe(true);
  });

  it('accepts a valid slider config', () => {
    expect(
      PublicModifierConfigSchema.safeParse({
        min: 20,
        max: 100,
        defaultValue: 40,
        step: 10,
        pricePerStep: 500,
        unit: 'photos'
      }).success
    ).toBe(true);
  });

  it('accepts a valid incrementer config', () => {
    expect(
      PublicModifierConfigSchema.safeParse({
        min: 0,
        max: 3,
        defaultValue: 0,
        pricePerUnit: 8000,
        unit: 'albums'
      }).success
    ).toBe(true);
  });

  it('rejects an arbitrary object that matches none of the config shapes', () => {
    expect(PublicModifierConfigSchema.safeParse({ foo: 'bar' }).success).toBe(false);
  });

  it('rejects a plain string', () => {
    expect(PublicModifierConfigSchema.safeParse('regular').success).toBe(false);
  });
});

// ── PublicPackageModifierSchema ───────────────────────────────────────────────

describe('PublicPackageModifierSchema', () => {
  it('accepts a CHECKBOX modifier with null config', () => {
    expect(PublicPackageModifierSchema.safeParse(checkboxModifier).success).toBe(true);
  });

  it('accepts a TOGGLE modifier with config', () => {
    expect(PublicPackageModifierSchema.safeParse(toggleModifier).success).toBe(true);
  });

  it('accepts a SLIDER modifier with config', () => {
    expect(PublicPackageModifierSchema.safeParse(sliderModifier).success).toBe(true);
  });

  it('accepts an INCREMENTER modifier with config', () => {
    expect(PublicPackageModifierSchema.safeParse(incrementerModifier).success).toBe(true);
  });

  it('accepts a modifier with null priceDeltaCents', () => {
    expect(
      PublicPackageModifierSchema.safeParse({ ...checkboxModifier, priceDeltaCents: null }).success
    ).toBe(true);
  });

  it('accepts a modifier with null description', () => {
    expect(
      PublicPackageModifierSchema.safeParse({ ...checkboxModifier, description: null }).success
    ).toBe(true);
  });

  it('accepts an included and required modifier', () => {
    expect(
      PublicPackageModifierSchema.safeParse({
        ...checkboxModifier,
        isIncluded: true,
        isRequired: true
      }).success
    ).toBe(true);
  });

  it('accepts sortOrder of zero', () => {
    expect(
      PublicPackageModifierSchema.safeParse({ ...checkboxModifier, sortOrder: 0 }).success
    ).toBe(true);
  });

  it('rejects a modifier with a missing type', () => {
    const { type: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a modifier with an invalid type', () => {
    expect(
      PublicPackageModifierSchema.safeParse({ ...checkboxModifier, type: 'DROPDOWN' }).success
    ).toBe(false);
  });

  it('rejects a modifier with a missing id', () => {
    const { id: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a modifier with a missing name', () => {
    const { name: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a modifier with missing isIncluded', () => {
    const { isIncluded: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a modifier with missing isRequired', () => {
    const { isRequired: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a modifier with missing sortOrder', () => {
    const { sortOrder: _omitted, ...rest } = checkboxModifier;
    expect(PublicPackageModifierSchema.safeParse(rest).success).toBe(false);
  });
});

// ── PublicPackageSchema ───────────────────────────────────────────────────────

describe('PublicPackageSchema', () => {
  it('accepts a fully populated package with no modifiers', () => {
    expect(PublicPackageSchema.safeParse(basePackage).success).toBe(true);
  });

  it('accepts a package with all modifier types present', () => {
    expect(
      PublicPackageSchema.safeParse({
        ...basePackage,
        modifiers: [checkboxModifier, toggleModifier, sliderModifier, incrementerModifier]
      }).success
    ).toBe(true);
  });

  it('accepts a package with all nullable fields as null', () => {
    expect(
      PublicPackageSchema.safeParse({
        id: 'pkg_2',
        slug: 'minimal-session',
        name: 'Minimal Session',
        summaryLine: null,
        description: null,
        durationMinutes: null,
        deliverables: [],
        notes: null,
        basePriceCents: null,
        sortOrder: 0,
        modifiers: []
      }).success
    ).toBe(true);
  });

  it('accepts an empty deliverables array', () => {
    expect(PublicPackageSchema.safeParse({ ...basePackage, deliverables: [] }).success).toBe(true);
  });

  it('accepts deliverables with multiple entries', () => {
    expect(
      PublicPackageSchema.safeParse({
        ...basePackage,
        deliverables: [
          '40 edited photos',
          '2-hour session',
          'Online gallery delivery',
          'Print release included'
        ]
      }).success
    ).toBe(true);
  });

  it('accepts basePriceCents of zero', () => {
    expect(PublicPackageSchema.safeParse({ ...basePackage, basePriceCents: 0 }).success).toBe(true);
  });

  it('accepts sortOrder of zero', () => {
    expect(PublicPackageSchema.safeParse({ ...basePackage, sortOrder: 0 }).success).toBe(true);
  });

  it('rejects a package with a missing id', () => {
    const { id: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package with a missing slug', () => {
    const { slug: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package with a missing name', () => {
    const { name: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package with a missing deliverables field entirely', () => {
    const { deliverables: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package with a missing modifiers field', () => {
    const { modifiers: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package with a missing sortOrder', () => {
    const { sortOrder: _omitted, ...rest } = basePackage;
    expect(PublicPackageSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a package where a modifier has an invalid shape', () => {
    expect(
      PublicPackageSchema.safeParse({
        ...basePackage,
        modifiers: [{ id: 'mod_bad', name: 'Broken' }] // missing required fields
      }).success
    ).toBe(false);
  });
});

// ── PublicPackageListResponseSchema ───────────────────────────────────────────

describe('PublicPackageListResponseSchema', () => {
  it('accepts an empty array', () => {
    expect(PublicPackageListResponseSchema.safeParse([]).success).toBe(true);
  });

  it('accepts an array with a single package', () => {
    expect(PublicPackageListResponseSchema.safeParse([basePackage]).success).toBe(true);
  });

  it('accepts an array with multiple packages', () => {
    const second = {
      ...basePackage,
      id: 'pkg_2',
      slug: 'half-day',
      name: 'Half Day',
      sortOrder: 2,
      modifiers: [checkboxModifier]
    };
    expect(PublicPackageListResponseSchema.safeParse([basePackage, second]).success).toBe(true);
  });

  it('rejects a non-array value', () => {
    expect(PublicPackageListResponseSchema.safeParse(basePackage).success).toBe(false);
    expect(PublicPackageListResponseSchema.safeParse(null).success).toBe(false);
  });

  it('rejects an array containing an invalid package', () => {
    expect(
      PublicPackageListResponseSchema.safeParse([{ id: 'pkg_bad', name: 'Bad' }]).success
    ).toBe(false);
  });
});
