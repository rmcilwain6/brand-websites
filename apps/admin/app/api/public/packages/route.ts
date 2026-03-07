import { prisma } from '@repo/db';

export const GET = async (): Promise<Response> => {
  try {
    const packages = await prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: {
        modifiers: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const payload = packages.map((pkg) => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      basePriceCents: pkg.basePriceCents,
      modifiers: pkg.modifiers.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        priceDeltaCents: m.priceDeltaCents,
        isRequired: m.isRequired
      }))
    }));

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load packages.' }, { status: 500 });
  }
};
