import { prisma } from '@repo/db';
import { jsonOk } from '@repo/core';

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const slots = await prisma.timeSlot.findMany({
    where: {
      ...(from && { startsAt: { gte: new Date(from) } }),
      ...(to && { endsAt: { lte: new Date(to) } })
    },
    orderBy: { startsAt: 'asc' },
    select: { id: true, startsAt: true, endsAt: true, status: true }
  });

  return jsonOk(slots);
};
