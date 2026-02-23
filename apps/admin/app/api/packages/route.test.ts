import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  packageFindMany: vi.fn(),
  packageCreate: vi.fn(),
  packageFindUnique: vi.fn(),
  packageUpdate: vi.fn(),
  packageDelete: vi.fn()
}));

vi.mock('../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('../../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('@repo/db', () => ({
  prisma: {
    package: {
      findMany: mocks.packageFindMany,
      create: mocks.packageCreate,
      findUnique: mocks.packageFindUnique,
      update: mocks.packageUpdate,
      delete: mocks.packageDelete
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

describe('admin package routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('returns packages for GET /api/packages', async () => {
    const records = [{ id: 'pkg_1', name: 'Signature Session', modifiers: [] }];
    mocks.packageFindMany.mockResolvedValueOnce(records);

    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/packages'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: records });
    expect(mocks.packageFindMany).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid POST payloads for /api/packages', async () => {
    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/api/packages', {
        method: 'POST',
        body: JSON.stringify({ slug: 'bad slug', name: 'x' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.packageCreate).not.toHaveBeenCalled();
  });

  it('updates a package for PUT /api/packages/[id]', async () => {
    const updated = { id: 'pkg_1', name: 'Updated', modifiers: [] };
    mocks.packageUpdate.mockResolvedValueOnce(updated);

    const { PUT } = await import('./[id]/route');

    const response = await PUT(
      new Request('http://localhost/api/packages/pkg_1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'pkg_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: updated });
    expect(mocks.packageUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'pkg_1' }, data: { name: 'Updated' } })
    );
  });
});
