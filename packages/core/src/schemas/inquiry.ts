import { z } from 'zod';

export const InquiryCreateSchema = z.object({
  type: z.enum(['general', 'package_builder', 'booking_request']),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Email must be a valid address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.').optional(),
  payload: z.record(z.unknown()).optional()
});

export type InquiryCreateInput = z.infer<typeof InquiryCreateSchema>;
