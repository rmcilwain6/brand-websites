import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../../../lib/auth';
import { z } from 'zod';

const ReorderSchema = z.object({
  ids: z.array(z.string()).min(1)
});

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(createApiError('VALIDATION_ERROR', 'ids must be a non-empty array of strings.'));
  }

  const { ids } = parsed.data;

  await prisma.$transaction(
    ids.map((galleryImageId, index) =>
      prisma.galleryImage.update({
        where: { id: galleryImageId, galleryId: params.id },
        data: { order: index }
      })
    )
  );

  return jsonOk({ reordered: ids.length });
};
