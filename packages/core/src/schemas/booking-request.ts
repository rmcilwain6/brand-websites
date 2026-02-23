import { z } from 'zod';

export const BookingRequestSubmissionPayloadSchema = z.object({
  packageId: z.string().min(1, 'Package is required.'),
  timeSlotId: z.string().min(1).optional(),
  guestCount: z
    .number()
    .int('Guest count must be a whole number.')
    .min(1, 'Guest count must be at least 1.')
    .max(100, 'Guest count must be 100 or fewer.')
    .optional(),
  requestedAt: z.string().datetime('Requested date must be an ISO datetime string.').optional(),
  selectedOptions: z.record(z.unknown()).optional(),
  notes: z.string().max(2000).optional()
});

export type BookingRequestSubmissionPayload = z.infer<typeof BookingRequestSubmissionPayloadSchema>;
