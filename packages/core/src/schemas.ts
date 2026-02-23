import { z } from 'zod';

export * from './schemas/admin-packages';
export * from './schemas/booking-request';
export * from './schemas/gallery';
export * from './schemas/inquiry';
export * from './schemas/package-builder';

export const newsletterSignupSchema = z.object({
  email: z.string().email(),
  source: z.string().min(2)
});

export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
