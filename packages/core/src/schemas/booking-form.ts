import { z } from 'zod';

export const BookingFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().max(30).optional(),
  location: z.string().min(1, 'Please select a location.').max(200),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a preferred date.'),
  preferredTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format.')
    .optional(),
  notes: z.string().max(2000).optional(),
  packageId: z.string().optional(),
  packageName: z.string().optional(),
  modifierIds: z.array(z.string()).default([]),
  modifierValues: z.record(z.number()).optional(),
  springSale: z.boolean().optional(),
  estimatedTotalCents: z.number().int().nonnegative().optional()
});

export type BookingFormInput = z.infer<typeof BookingFormSchema>;
