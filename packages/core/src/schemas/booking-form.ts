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

/** Answers to the campaign questions (spec §4.3). Link is free text, since handles aren't URLs. */
const CampaignAnswersSchema = z.object({
  whatWorkingOn: optionalText(200),
  aboutIt: optionalText(2000),
  link: optionalText(500),
  othersInvolved: optionalText(500),
  acknowledged: z.boolean().optional()
});

const BookingFormFieldsSchema = z.object({
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
  /** An unselected <select> sends '', which counts as not answered. */
  heardFrom: z
    .union([z.enum(HEARD_FROM_VALUES), z.literal('')])
    .optional()
    .transform((v) => v || undefined),
  /** The booker's request to apply. The admin route decides whether it counts. */
  applyToCampaign: z.boolean().optional(),
  campaignAnswers: CampaignAnswersSchema.optional(),
  /** Honeypot: hidden from people, so any value means a bot. The admin route drops these. */
  website: z.string().max(500).optional()
});

export const BookingFormSchema = BookingFormFieldsSchema.superRefine((booking, ctx) => {
  if (!booking.applyToCampaign) return;

  if (!booking.campaignAnswers?.whatWorkingOn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['campaignAnswers', 'whatWorkingOn'],
      message: "Please tell me what you're working on."
    });
  }

  if (!booking.campaignAnswers?.acknowledged) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['campaignAnswers', 'acknowledged'],
      message: 'Please confirm you understand what a featured session involves.'
    });
  }
});

export type BookingFormInput = z.infer<typeof BookingFormSchema>;
