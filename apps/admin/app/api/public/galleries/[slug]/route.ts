import { GalleryDetailSchema } from '@repo/core';
import { prisma } from '@repo/db';

export const GET = async (
  _req: Request,
  { params }: { params: { slug: string } }
): Promise<Response> => {
  try {
    const gallery = await prisma.gallery.findFirst({
      where: {
        slug: params.slug,
        status: 'PUBLISHED'
      },
      include: {
        images: {
          include: { imageAsset: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!gallery) {
      return Response.json({ message: 'Gallery not found.' }, { status: 404 });
    }

    const responsePayload = {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      description: gallery.description,
      location: gallery.location,
      images: gallery.images.map((image) => ({
        id: image.id,
        order: image.order,
        src: image.imageAsset.src,
        alt: image.imageAsset.alt,
        caption: image.imageAsset.caption
      }))
    };

    const payload = GalleryDetailSchema.parse(responsePayload);

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load gallery.' }, { status: 500 });
  }
};
