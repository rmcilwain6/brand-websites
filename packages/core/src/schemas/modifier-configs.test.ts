import { describe, expect, it } from 'vitest';

import { IncrementerConfigSchema, SliderConfigSchema, ToggleConfigSchema } from './admin-packages';

// ── ToggleConfigSchema ────────────────────────────────────────────────────────

describe('ToggleConfigSchema', () => {
  it('accepts valid toggle config', () => {
    expect(
      ToggleConfigSchema.safeParse({
        defaultLabel: 'Regular editing',
        altLabel: 'Light editing'
      }).success
    ).toBe(true);
  });

  it('rejects empty defaultLabel', () => {
    expect(
      ToggleConfigSchema.safeParse({ defaultLabel: '', altLabel: 'Light editing' }).success
    ).toBe(false);
  });

  it('rejects empty altLabel', () => {
    expect(
      ToggleConfigSchema.safeParse({ defaultLabel: 'Regular editing', altLabel: '' }).success
    ).toBe(false);
  });

  it('rejects missing defaultLabel', () => {
    expect(ToggleConfigSchema.safeParse({ altLabel: 'Light editing' }).success).toBe(false);
  });

  it('rejects missing altLabel', () => {
    expect(ToggleConfigSchema.safeParse({ defaultLabel: 'Regular editing' }).success).toBe(false);
  });

  it('rejects empty object', () => {
    expect(ToggleConfigSchema.safeParse({}).success).toBe(false);
  });
});

// ── SliderConfigSchema ────────────────────────────────────────────────────────

describe('SliderConfigSchema', () => {
  const valid = {
    min: 20,
    max: 100,
    defaultValue: 40,
    step: 10,
    pricePerStep: 500,
    unit: 'photos'
  };

  it('accepts a valid slider config', () => {
    expect(SliderConfigSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a negative pricePerStep (discount as you go lower)', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, pricePerStep: -300 }).success).toBe(true);
  });

  it('accepts min at zero', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, min: 0 }).success).toBe(true);
  });

  it('accepts a negative min (schema delegates min < max enforcement to business logic)', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, min: -10 }).success).toBe(true);
  });

  it('rejects step of zero', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, step: 0 }).success).toBe(false);
  });

  it('rejects a negative step', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, step: -5 }).success).toBe(false);
  });

  it('rejects a non-integer step', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, step: 2.5 }).success).toBe(false);
  });

  it('rejects an empty unit', () => {
    expect(SliderConfigSchema.safeParse({ ...valid, unit: '' }).success).toBe(false);
  });

  it.each(['min', 'max', 'defaultValue', 'step', 'pricePerStep', 'unit'])(
    'rejects when required field "%s" is missing',
    (field) => {
      const { [field as keyof typeof valid]: _omitted, ...rest } = valid;
      expect(SliderConfigSchema.safeParse(rest).success).toBe(false);
    }
  );
});

// ── IncrementerConfigSchema ───────────────────────────────────────────────────

describe('IncrementerConfigSchema', () => {
  const valid = { min: 0, max: 3, defaultValue: 0, pricePerUnit: 8000, unit: 'albums' };

  it('accepts a valid incrementer config', () => {
    expect(IncrementerConfigSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts pricePerUnit of zero', () => {
    expect(IncrementerConfigSchema.safeParse({ ...valid, pricePerUnit: 0 }).success).toBe(true);
  });

  it('accepts a negative pricePerUnit (discount per unit)', () => {
    expect(IncrementerConfigSchema.safeParse({ ...valid, pricePerUnit: -1000 }).success).toBe(true);
  });

  it('rejects a negative min', () => {
    expect(IncrementerConfigSchema.safeParse({ ...valid, min: -1 }).success).toBe(false);
  });

  it('rejects max of zero', () => {
    expect(IncrementerConfigSchema.safeParse({ ...valid, max: 0 }).success).toBe(false);
  });

  it('rejects an empty unit', () => {
    expect(IncrementerConfigSchema.safeParse({ ...valid, unit: '' }).success).toBe(false);
  });

  it.each(['min', 'max', 'defaultValue', 'pricePerUnit', 'unit'])(
    'rejects when required field "%s" is missing',
    (field) => {
      const { [field as keyof typeof valid]: _omitted, ...rest } = valid;
      expect(IncrementerConfigSchema.safeParse(rest).success).toBe(false);
    }
  );
});
