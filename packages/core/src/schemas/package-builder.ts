import { z } from 'zod';

export const PackageBuilderRequestPayloadSchema = z.object({
  packageId: z.string().min(1, 'Package is required.'),
  guestCount: z
    .number()
    .int('Guest count must be a whole number.')
    .min(1, 'Guest count must be at least 1.')
    .max(100, 'Guest count must be 100 or fewer.'),
  selectedModifierIds: z.array(z.string().min(1)).max(25).default([]),
  requestedDate: z.string().datetime('Requested date must be an ISO datetime string.'),
  location: z.string().min(2).max(200).optional(),
  notes: z.string().max(2000).optional()
});

export type PackageBuilderRequestPayload = z.infer<typeof PackageBuilderRequestPayloadSchema>;
