import { GalleryListResponseSchema } from '@repo/core';
import { prisma } from '@repo/db';

type GalleryWithCover = {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  location: string | null;
  order: number;
  featured: boolean;
  images: Array<{
    imageAsset: {
      src: string;
      alt: string | null;
      width: number | null;
      height: number | null;
    };
  }>;
  _count: {
    images: number;
  };
};

export const GET = async (req: Request): Promise<Response> => {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    const galleries = await prisma.gallery.findMany({
      where: { status: 'PUBLISHED', ...(featuredOnly ? { featured: true } : {}) },
      orderBy: { order: 'asc' },
      include: {
        images: {
          where: { isCover: true },
          include: { imageAsset: true },
          take: 1
        },
        _count: {
          select: { images: true }
        }
      }
    });

    const responsePayload = galleries.map((gallery: GalleryWithCover) => {
      const coverImage = gallery.images[0]?.imageAsset;

      return {
        id: gallery.id,
        slug: gallery.slug,
        title: gallery.title,
        headline: gallery.headline,
        location: gallery.location,
        order: gallery.order,
        featured: gallery.featured,
        coverImage: coverImage
          ? {
              src: coverImage.src,
              alt: coverImage.alt ?? '',
              width: coverImage.width,
              height: coverImage.height
            }
          : null,
        imageCount: gallery._count.images
      };
    });

    const payload = GalleryListResponseSchema.parse(responsePayload);

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load galleries.' }, { status: 500 });
  }
};
