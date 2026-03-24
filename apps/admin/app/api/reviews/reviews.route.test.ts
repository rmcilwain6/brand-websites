import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  reviewFindMany: vi.fn(),
  reviewCreate: vi.fn(),
  reviewFindUnique: vi.fn(),
  reviewUpdate: vi.fn(),
  reviewDelete: vi.fn()
}));

vi.mock('../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('../../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('@repo/db', () => ({
  prisma: {
    review: {
      findMany: mocks.reviewFindMany,
      create: mocks.reviewCreate,
      findUnique: mocks.reviewFindUnique,
      update: mocks.reviewUpdate,
      delete: mocks.reviewDelete
    }
  },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;

    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.code = code;
    }
  }
}));

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('returns all reviews', async () => {
    const records = [
      { id: 'rev_1', clientName: 'Jane Smith', quote: 'Great!', gallery: null, imageAsset: null }
    ];
    mocks.reviewFindMany.mockResolvedValueOnce(records);

    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/reviews'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: records });
    expect(mocks.reviewFindMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no reviews', async () => {
    mocks.reviewFindMany.mockResolvedValueOnce([]);

    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/reviews'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: [] });
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/reviews'));

    expect(response.status).toBe(401);
    expect(mocks.reviewFindMany).not.toHaveBeenCalled();
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('creates a review with a valid body', async () => {
    const created = {
      id: 'rev_1',
      clientName: 'Jane Smith',
      quote: 'Loved it.',
      gallery: null,
      imageAsset: null
    };
    mocks.reviewCreate.mockResolvedValueOnce(created);

    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ clientName: 'Jane Smith', quote: 'Loved it.' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ ok: true, data: created });
    expect(mocks.reviewCreate).toHaveBeenCalledTimes(1);
  });

  it('rejects a body missing clientName', async () => {
    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ quote: 'Loved it.' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it('rejects a body missing quote', async () => {
    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ clientName: 'Jane Smith' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it('rejects a body with a malformed sessionDate', async () => {
    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          clientName: 'Jane Smith',
          quote: 'Great!',
          sessionDate: '2024-09-15'
        }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ clientName: 'Jane Smith', quote: 'Loved it.' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });
});

describe('GET /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('returns a review by id', async () => {
    const record = {
      id: 'rev_1',
      clientName: 'Jane Smith',
      quote: 'Loved it.',
      gallery: null,
      imageAsset: null
    };
    mocks.reviewFindUnique.mockResolvedValueOnce(record);

    const { GET } = await import('./[id]/route');

    const response = await GET(new Request('http://localhost/api/reviews/rev_1'), {
      params: { id: 'rev_1' }
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: record });
  });

  it('returns 404 when the review does not exist', async () => {
    mocks.reviewFindUnique.mockResolvedValueOnce(null);

    const { GET } = await import('./[id]/route');

    const response = await GET(new Request('http://localhost/api/reviews/rev_missing'), {
      params: { id: 'rev_missing' }
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('NOT_FOUND');
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { GET } = await import('./[id]/route');

    const response = await GET(new Request('http://localhost/api/reviews/rev_1'), {
      params: { id: 'rev_1' }
    });

    expect(response.status).toBe(401);
    expect(mocks.reviewFindUnique).not.toHaveBeenCalled();
  });
});

describe('PUT /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('updates a review with a valid body', async () => {
    const updated = {
      id: 'rev_1',
      clientName: 'Jane Smith',
      quote: 'Updated quote.',
      gallery: null,
      imageAsset: null
    };
    mocks.reviewUpdate.mockResolvedValueOnce(updated);

    const { PUT } = await import('./[id]/route');

    const response = await PUT(
      new Request('http://localhost/api/reviews/rev_1', {
        method: 'PUT',
        body: JSON.stringify({ quote: 'Updated quote.' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: updated });
    expect(mocks.reviewUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rev_1' } })
    );
  });

  it('converts an empty galleryId string to null', async () => {
    const updated = {
      id: 'rev_1',
      clientName: 'Jane',
      quote: 'Great!',
      gallery: null,
      imageAsset: null
    };
    mocks.reviewUpdate.mockResolvedValueOnce(updated);

    const { PUT } = await import('./[id]/route');

    await PUT(
      new Request('http://localhost/api/reviews/rev_1', {
        method: 'PUT',
        body: JSON.stringify({ galleryId: '' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_1' } }
    );

    expect(mocks.reviewUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ galleryId: null }) })
    );
  });

  it('converts an empty imageAssetId string to null', async () => {
    const updated = {
      id: 'rev_1',
      clientName: 'Jane',
      quote: 'Great!',
      gallery: null,
      imageAsset: null
    };
    mocks.reviewUpdate.mockResolvedValueOnce(updated);

    const { PUT } = await import('./[id]/route');

    await PUT(
      new Request('http://localhost/api/reviews/rev_1', {
        method: 'PUT',
        body: JSON.stringify({ imageAssetId: '' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_1' } }
    );

    expect(mocks.reviewUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ imageAssetId: null }) })
    );
  });

  it('returns 404 for a P2025 error', async () => {
    const { PrismaClientKnownRequestError } = await import('@repo/db');
    mocks.reviewUpdate.mockRejectedValueOnce(
      new PrismaClientKnownRequestError('Not found', { code: 'P2025', clientVersion: '5.18.0' })
    );

    const { PUT } = await import('./[id]/route');

    const response = await PUT(
      new Request('http://localhost/api/reviews/rev_missing', {
        method: 'PUT',
        body: JSON.stringify({ quote: 'Updated.' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_missing' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe('NOT_FOUND');
  });

  it('rejects an invalid body', async () => {
    const { PUT } = await import('./[id]/route');

    const response = await PUT(
      new Request('http://localhost/api/reviews/rev_1', {
        method: 'PUT',
        body: JSON.stringify({ clientName: '' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.reviewUpdate).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { PUT } = await import('./[id]/route');

    const response = await PUT(
      new Request('http://localhost/api/reviews/rev_1', {
        method: 'PUT',
        body: JSON.stringify({ quote: 'Updated.' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'rev_1' } }
    );

    expect(response.status).toBe(401);
    expect(mocks.reviewUpdate).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('deletes a review', async () => {
    mocks.reviewDelete.mockResolvedValueOnce({ id: 'rev_1' });

    const { DELETE } = await import('./[id]/route');

    const response = await DELETE(
      new Request('http://localhost/api/reviews/rev_1', { method: 'DELETE' }),
      { params: { id: 'rev_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: { deleted: true } });
    expect(mocks.reviewDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rev_1' } })
    );
  });

  it('returns 404 for a P2025 error', async () => {
    const { PrismaClientKnownRequestError } = await import('@repo/db');
    mocks.reviewDelete.mockRejectedValueOnce(
      new PrismaClientKnownRequestError('Not found', { code: 'P2025', clientVersion: '5.18.0' })
    );

    const { DELETE } = await import('./[id]/route');

    const response = await DELETE(
      new Request('http://localhost/api/reviews/rev_missing', { method: 'DELETE' }),
      { params: { id: 'rev_missing' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe('NOT_FOUND');
  });

  it('rejects unauthenticated requests', async () => {
    mocks.requireAdminSession.mockReturnValue(
      new Response(JSON.stringify({ ok: false }), { status: 401 })
    );

    const { DELETE } = await import('./[id]/route');

    const response = await DELETE(
      new Request('http://localhost/api/reviews/rev_1', { method: 'DELETE' }),
      { params: { id: 'rev_1' } }
    );

    expect(response.status).toBe(401);
    expect(mocks.reviewDelete).not.toHaveBeenCalled();
  });
});
