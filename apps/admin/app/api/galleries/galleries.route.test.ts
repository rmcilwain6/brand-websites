import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  galleryImageUpdateMany: vi.fn(),
  galleryImageUpdate: vi.fn(),
  transaction: vi.fn()
}));

vi.mock('../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('@repo/db', () => ({
  prisma: {
    galleryImage: {
      updateMany: mocks.galleryImageUpdateMany,
      update: mocks.galleryImageUpdate
    },
    $transaction: mocks.transaction
  },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;

    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.code = code;
    }
  }
}));

describe('PATCH /api/galleries/[id]/images/[galleryImageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('sets the cover image and clears the previous cover', async () => {
    mocks.transaction.mockResolvedValueOnce([undefined, { id: 'img_2', isCover: true }]);

    const { PATCH } = await import('./[id]/images/[galleryImageId]/route');

    const response = await PATCH(
      new Request('http://localhost/api/galleries/gal_1/images/img_2', { method: 'PATCH' }),
      { params: { id: 'gal_1', galleryImageId: 'img_2' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: { id: 'img_2', isCover: true } });
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.galleryImageUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { galleryId: 'gal_1', isCover: true }, data: { isCover: false } })
    );
    expect(mocks.galleryImageUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'img_2' }, data: { isCover: true } })
    );
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { PATCH } = await import('./[id]/images/[galleryImageId]/route');

    const response = await PATCH(
      new Request('http://localhost/api/galleries/gal_1/images/img_2', { method: 'PATCH' }),
      { params: { id: 'gal_1', galleryImageId: 'img_2' } }
    );

    expect(response.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
