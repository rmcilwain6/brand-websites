import { describe, expect, it } from 'vitest';

import { ModifierTypeSchema } from './admin-packages';

describe('ModifierTypeSchema', () => {
  it.each(['CHECKBOX', 'TOGGLE', 'SLIDER', 'INCREMENTER'])('accepts valid type: %s', (type) => {
    expect(ModifierTypeSchema.safeParse(type).success).toBe(true);
  });

  it.each(['checkbox', 'toggle', 'slider', 'incrementer', 'SELECT', '', 'RADIO'])(
    'rejects invalid type: %s',
    (type) => {
      expect(ModifierTypeSchema.safeParse(type).success).toBe(false);
    }
  );

  it('rejects non-string values', () => {
    expect(ModifierTypeSchema.safeParse(null).success).toBe(false);
    expect(ModifierTypeSchema.safeParse(42).success).toBe(false);
    expect(ModifierTypeSchema.safeParse(undefined).success).toBe(false);
  });
});
