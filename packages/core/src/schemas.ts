import { z } from 'zod';

export * from './schemas/gallery';

export const newsletterSignupSchema = z.object({
  email: z.string().email(),
  source: z.string().min(2)
});

export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
