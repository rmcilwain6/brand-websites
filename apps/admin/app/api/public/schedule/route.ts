import { prisma } from '@repo/db';
import { jsonOk } from '@repo/core';

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const windows = await prisma.locationWindow.findMany({
    where: {
      ...(from && { endDate: { gte: new Date(from) } }),
      ...(to && { startDate: { lte: new Date(to) } })
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      notes: true,
      location: { select: { id: true, name: true } }
    }
  });

  return jsonOk(windows);
};
