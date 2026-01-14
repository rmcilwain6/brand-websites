import { GalleryListResponseSchema } from '@repo/core';
import { prisma } from '@repo/db';

export const GET = async (): Promise<Response> => {
  try {
    const galleries = await prisma.gallery.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
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

    const responsePayload = galleries.map((gallery) => {
      const coverImage = gallery.images[0]?.imageAsset;

      return {
        id: gallery.id,
        slug: gallery.slug,
        title: gallery.title,
        location: gallery.location,
        coverImage: coverImage
          ? {
              src: coverImage.src,
              alt: coverImage.alt
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
