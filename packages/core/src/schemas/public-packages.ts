import { z } from 'zod';

import {
  ModifierTypeSchema,
  ToggleConfigSchema,
  SliderConfigSchema,
  IncrementerConfigSchema
} from './admin-packages';

export const PublicModifierConfigSchema = z
  .union([ToggleConfigSchema, SliderConfigSchema, IncrementerConfigSchema])
  .nullable();

export const PublicPackageModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: ModifierTypeSchema,
  isIncluded: z.boolean(),
  isRequired: z.boolean(),
  priceDeltaCents: z.number().int().nullable(),
  config: PublicModifierConfigSchema,
  sortOrder: z.number().int()
});

export const PublicPackageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summaryLine: z.string().nullable(),
  description: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  deliverables: z.array(z.string()),
  notes: z.string().nullable(),
  basePriceCents: z.number().int().nullable(),
  sortOrder: z.number().int(),
  modifiers: z.array(PublicPackageModifierSchema)
});

export const PublicPackageListResponseSchema = z.array(PublicPackageSchema);

export type PublicPackage = z.infer<typeof PublicPackageSchema>;
export type PublicPackageModifier = z.infer<typeof PublicPackageModifierSchema>;
