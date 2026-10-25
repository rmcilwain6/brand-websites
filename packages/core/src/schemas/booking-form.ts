import { z } from 'zod';

import { HEARD_FROM_VALUES } from '../referrals';

/** Optional free text: trimmed, and blank becomes undefined. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

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
  estimatedTotalCents: z.number().int().nonnegative().optional(),
  // Referral fields (Passion Projects spec §4.2). All optional, stored as typed.
  locationIdeas: optionalText(500),
  referrerName: optionalText(200),
  /** Instagram handle, email, phone — whatever was typed. Not parsed. */
  referrerContact: optionalText(200),
  /** Raw voucher code as entered; matched against the table with normalizeVoucherCode. */
  voucherCode: optionalText(50),
  heardFrom: z.preprocess((v) => (v === '' ? undefined : v), z.enum(HEARD_FROM_VALUES).optional()),
  /** Honeypot: hidden from people, so any value means a bot. The admin route drops these. */
  website: z.string().max(500).optional()
});

export type BookingFormInput = z.infer<typeof BookingFormSchema>;
