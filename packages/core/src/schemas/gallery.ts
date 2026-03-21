import { z } from 'zod';

export const GalleryStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type GalleryStatus = z.infer<typeof GalleryStatusSchema>;

export const GalleryCreateSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  description: z.string().optional(),
  location: z.string().optional()
});

export const GalleryUpdateSchema = GalleryCreateSchema.partial();

export const ImageAssetCreateSchema = z.object({
  src: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
});

export const GalleryImageAttachSchema = z.object({
  imageAssetId: z.string().min(1),
  order: z.number().int().min(0),
  isCover: z.boolean().optional()
});

export const GalleryPublishSchema = z.object({
  status: GalleryStatusSchema
});

export const GalleryCoverImageSchema = z.object({
  src: z.string().url(),
  alt: z.string().min(1)
});

export const GalleryListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  location: z.string().nullable(),
  coverImage: GalleryCoverImageSchema.nullable(),
  imageCount: z.number().int().nonnegative()
});

export const GalleryListResponseSchema = z.array(GalleryListItemSchema);

export const GalleryImageSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  src: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable()
});

export const GalleryDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  images: z.array(GalleryImageSchema)
});

export type GalleryListItem = z.infer<typeof GalleryListItemSchema>;
export type GalleryListResponse = z.infer<typeof GalleryListResponseSchema>;
export type GalleryDetail = z.infer<typeof GalleryDetailSchema>;
