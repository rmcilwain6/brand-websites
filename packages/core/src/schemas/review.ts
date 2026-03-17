import { z } from 'zod';

export const ReviewCreateSchema = z.object({
  clientName: z.string().min(1),
  quote: z.string().min(1),
  sessionType: z.string().optional(),
  sessionDate: z.string().datetime({ offset: true }).optional(),
  galleryId: z.string().optional(),
  imageAssetId: z.string().optional(),
  isPublished: z.boolean().optional(),
  featuredOnHome: z.boolean().optional()
});

export const ReviewUpdateSchema = ReviewCreateSchema.partial();

export const PublicReviewImageSchema = z.object({
  src: z.string().url(),
  alt: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable()
});

export const PublicReviewSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  quote: z.string(),
  sessionType: z.string().nullable(),
  sessionDate: z.string().nullable(),
  gallerySlug: z.string().nullable(),
  image: PublicReviewImageSchema.nullable()
});

export const PublicReviewListSchema = z.array(PublicReviewSchema);

export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;
export type PublicReview = z.infer<typeof PublicReviewSchema>;
export type PublicReviewList = z.infer<typeof PublicReviewListSchema>;
