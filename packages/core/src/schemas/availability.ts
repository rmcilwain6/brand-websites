import { z } from 'zod';

export const TimeSlotStatusSchema = z.enum(['AVAILABLE', 'HELD', 'UNAVAILABLE']);

export const TimeSlotSchema = z.object({
  id: z.string(),
  startsAt: z.string(), // ISO datetime string
  endsAt: z.string(), // ISO datetime string
  status: TimeSlotStatusSchema
});

export const PublicAvailabilityResponseSchema = z.array(TimeSlotSchema);

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type TimeSlotStatus = z.infer<typeof TimeSlotStatusSchema>;
