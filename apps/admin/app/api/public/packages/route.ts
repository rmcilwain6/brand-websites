import { prisma } from '@repo/db';

export const GET = async (): Promise<Response> => {
  try {
    const packages = await prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      include: {
        modifiers: {
          include: { modifier: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    const payload = packages.map((pkg) => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      summaryLine: pkg.summaryLine,
      description: pkg.description,
      durationMinutes: pkg.durationMinutes,
      deliverables: pkg.deliverables,
      notes: pkg.notes,
      basePriceCents: pkg.basePriceCents,
      sortOrder: pkg.sortOrder,
      modifiers: pkg.modifiers.map((m) => ({
        id: m.id,
        name: m.modifier.name,
        description: m.modifier.description,
        type: m.modifier.type,
        isIncluded: m.isIncluded,
        isRequired: m.isRequired,
        priceDeltaCents: m.modifier.priceDeltaCents,
        config: m.modifier.config,
        sortOrder: m.sortOrder
      }))
    }));

    return Response.json(payload);
  } catch {
    return Response.json({ message: 'Unable to load packages.' }, { status: 500 });
  }
};
