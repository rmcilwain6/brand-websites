import { z } from 'zod';

export const PackageStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const AdminPackageCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  name: z.string().min(2),
  description: z.string().max(2000).optional(),
  basePriceCents: z.number().int().nonnegative().optional(),
  status: PackageStatusSchema.optional()
});

export const AdminPackageUpdateSchema = AdminPackageCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: 'At least one field is required for an update.' }
);

export const AdminPackageModifierCreateSchema = z.object({
  packageId: z.string().min(1, 'Package is required.'),
  name: z.string().min(2),
  description: z.string().max(2000).optional(),
  priceDeltaCents: z.number().int().optional(),
  isRequired: z.boolean().optional()
});

export const AdminPackageModifierUpdateSchema = AdminPackageModifierCreateSchema.omit({
  packageId: true
})
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required for an update.'
  });

export type PackageStatus = z.infer<typeof PackageStatusSchema>;
export type AdminPackageCreateInput = z.infer<typeof AdminPackageCreateSchema>;
export type AdminPackageUpdateInput = z.infer<typeof AdminPackageUpdateSchema>;
export type AdminPackageModifierCreateInput = z.infer<typeof AdminPackageModifierCreateSchema>;
export type AdminPackageModifierUpdateInput = z.infer<typeof AdminPackageModifierUpdateSchema>;
