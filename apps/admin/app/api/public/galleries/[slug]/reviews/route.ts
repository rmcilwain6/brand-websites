import { prisma } from '@repo/db';

export const GET = async (
  _req: Request,
  { params }: { params: { slug: string } }
): Promise<Response> => {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: { slug: params.slug, status: 'PUBLISHED' },
      select: { id: true }
    });

    if (!gallery) {
      return Response.json([], { status: 200 });
    }

    const reviews = await prisma.review.findMany({
      where: { galleryId: gallery.id, isPublished: true },
      orderBy: { createdAt: 'asc' },
      include: {
        imageAsset: { select: { src: true, alt: true, width: true, height: true } }
      }
    });

    const payload = reviews.map((review) => ({
      id: review.id,
      clientName: review.clientName,
      quote: review.quote,
      sessionType: review.sessionType,
      sessionDate: review.sessionDate ? review.sessionDate.toISOString() : null,
      image: review.imageAsset
        ? {
            src: review.imageAsset.src,
            alt: review.imageAsset.alt,
            width: review.imageAsset.width,
            height: review.imageAsset.height
          }
        : null
    }));

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load reviews.' }, { status: 500 });
  }
};
