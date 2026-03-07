import { z } from 'zod';

export const PublicPackageModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  priceDeltaCents: z.number().int().nullable(),
  isRequired: z.boolean()
});

export const PublicPackageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  basePriceCents: z.number().int().nullable(),
  modifiers: z.array(PublicPackageModifierSchema)
});

export const PublicPackageListResponseSchema = z.array(PublicPackageSchema);

export type PublicPackage = z.infer<typeof PublicPackageSchema>;
export type PublicPackageModifier = z.infer<typeof PublicPackageModifierSchema>;
