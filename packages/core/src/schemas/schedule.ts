import { z } from 'zod';

export const LocationWindowSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().nullable(),
  location: z.object({
    id: z.string(),
    name: z.string()
  })
});

export const PublicScheduleResponseSchema = z.array(LocationWindowSchema);

export type LocationWindow = z.infer<typeof LocationWindowSchema>;
