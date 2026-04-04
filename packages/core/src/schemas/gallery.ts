import { z } from 'zod';

export const GalleryStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PRIVATE']);
export type GalleryStatus = z.infer<typeof GalleryStatusSchema>;

export const GalleryImageLayoutSchema = z.enum(['MASONRY', 'GRID']);
export type GalleryImageLayout = z.infer<typeof GalleryImageLayoutSchema>;

export const GalleryCreateSchema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  headline: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  shootDate: z.coerce.date().optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  password: z.string().min(4).optional(),
  imageLayout: GalleryImageLayoutSchema.optional()
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

export const ConfirmUploadSchema = z.object({
  secureUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(1)
});

export const GalleryPublishSchema = z.object({
  status: GalleryStatusSchema
});

export const GalleryCoverImageSchema = z.object({
  src: z.string().url(),
  alt: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable()
});

export const GalleryListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  headline: z.string().nullable(),
  location: z.string().nullable(),
  coverImage: GalleryCoverImageSchema.nullable(),
  imageCount: z.number().int().nonnegative(),
  order: z.number().int().min(0),
  featured: z.boolean()
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
  headline: z.string().nullable(),
  description: z.string().nullable(),
  shootDate: z.string().nullable(),
  location: z.string().nullable(),
  imageLayout: GalleryImageLayoutSchema,
  images: z.array(GalleryImageSchema)
});

export type GalleryListItem = z.infer<typeof GalleryListItemSchema>;
export type GalleryListResponse = z.infer<typeof GalleryListResponseSchema>;
export type GalleryDetail = z.infer<typeof GalleryDetailSchema>;

export const PrivateGalleryVerifySchema = z.object({
  password: z.string().min(1)
});

export const PrivateGalleryVerifyResponseSchema = z.object({
  token: z.string().min(1)
});

export const PrivateGalleryDetailSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  images: z.array(GalleryImageSchema)
});

export type PrivateGalleryDetail = z.infer<typeof PrivateGalleryDetailSchema>;

export const GalleryAccessLogEntrySchema = z.object({
  id: z.string(),
  success: z.boolean(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string()
});

export const GalleryAccessLogResponseSchema = z.array(GalleryAccessLogEntrySchema);
export type GalleryAccessLogEntry = z.infer<typeof GalleryAccessLogEntrySchema>;
