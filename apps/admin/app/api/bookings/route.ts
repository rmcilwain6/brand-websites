import { jsonOk } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      inquiry: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          payload: true,
          createdAt: true
        }
      },
      package: { select: { id: true, name: true } }
    }
  });

  return jsonOk(bookings);
};
