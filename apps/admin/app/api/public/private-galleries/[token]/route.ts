import { PrivateGalleryDetailSchema } from '@repo/core';
import { prisma } from '@repo/db';

import { verifyGalleryAccessToken } from '../../../../lib/auth';

type GalleryImageWithAsset = {
  id: string;
  order: number;
  imageAsset: {
    src: string;
    alt: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
  };
};

const getBearerToken = (req: Request): string | null => {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim();
};

export const GET = async (
  req: Request,
  { params }: { params: { token: string } }
): Promise<Response> => {
  const bearerToken = getBearerToken(req);
  const galleryId = verifyGalleryAccessToken(bearerToken, params.token);

  if (!galleryId) {
    return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, accessToken: params.token, status: 'PRIVATE' },
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
    accessToken: gallery.accessToken,
    title: gallery.title,
    description: gallery.description,
    location: gallery.location,
    images: gallery.images.map((image: GalleryImageWithAsset) => ({
      id: image.id,
      order: image.order,
      src: image.imageAsset.src,
      alt: image.imageAsset.alt,
      caption: image.imageAsset.caption,
      width: image.imageAsset.width,
      height: image.imageAsset.height
    }))
  };

  const payload = PrivateGalleryDetailSchema.parse(responsePayload);

  return Response.json(payload);
};
