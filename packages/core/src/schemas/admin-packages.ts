import { z } from 'zod';

export const PackageStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const ModifierTypeSchema = z.enum(['CHECKBOX', 'TOGGLE', 'SLIDER', 'INCREMENTER']);

// Type-specific config schemas
export const ToggleConfigSchema = z.object({
  defaultLabel: z.string().min(1),
  altLabel: z.string().min(1)
});

export const SliderConfigSchema = z.object({
  min: z.number().int(),
  max: z.number().int(),
  defaultValue: z.number().int(),
  step: z.number().int().positive(),
  pricePerStep: z.number().int(),
  unit: z.string().min(1)
});

export const IncrementerConfigSchema = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().positive(),
  defaultValue: z.number().int().nonnegative(),
  pricePerUnit: z.number().int(),
  unit: z.string().min(1)
});

export const AdminPackageCreateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  name: z.string().min(2),
  summaryLine: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().positive().optional(),
  deliverables: z.array(z.string().min(1)).optional(),
  notes: z.string().max(2000).optional(),
  basePriceCents: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
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
  type: ModifierTypeSchema.optional(),
  isIncluded: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  priceDeltaCents: z.number().int().optional(),
  config: z.union([ToggleConfigSchema, SliderConfigSchema, IncrementerConfigSchema]).optional(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const AdminPackageModifierUpdateSchema = AdminPackageModifierCreateSchema.omit({
  packageId: true
})
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required for an update.'
  });

export type PackageStatus = z.infer<typeof PackageStatusSchema>;
export type ModifierType = z.infer<typeof ModifierTypeSchema>;
export type ToggleConfig = z.infer<typeof ToggleConfigSchema>;
export type SliderConfig = z.infer<typeof SliderConfigSchema>;
export type IncrementerConfig = z.infer<typeof IncrementerConfigSchema>;
export type AdminPackageCreateInput = z.infer<typeof AdminPackageCreateSchema>;
export type AdminPackageUpdateInput = z.infer<typeof AdminPackageUpdateSchema>;
export type AdminPackageModifierCreateInput = z.infer<typeof AdminPackageModifierCreateSchema>;
export type AdminPackageModifierUpdateInput = z.infer<typeof AdminPackageModifierUpdateSchema>;
