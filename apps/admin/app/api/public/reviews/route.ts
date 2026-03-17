import { prisma } from '@repo/db';

export const GET = async (): Promise<Response> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isPublished: true, featuredOnHome: true },
      orderBy: [{ sessionDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        gallery: { select: { slug: true } },
        imageAsset: { select: { src: true, alt: true, width: true, height: true } }
      }
    });

    const payload = reviews.map((r) => ({
      id: r.id,
      clientName: r.clientName,
      quote: r.quote,
      sessionType: r.sessionType,
      sessionDate: r.sessionDate ? r.sessionDate.toISOString() : null,
      gallerySlug: r.gallery?.slug ?? null,
      image: r.imageAsset
        ? {
            src: r.imageAsset.src,
            alt: r.imageAsset.alt,
            width: r.imageAsset.width,
            height: r.imageAsset.height
          }
        : null
    }));

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load reviews.' }, { status: 500 });
  }
};
