import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  packageModifierFindMany: vi.fn(),
  packageModifierCreate: vi.fn(),
  packageModifierFindFirst: vi.fn(),
  packageModifierUpdate: vi.fn(),
  packageModifierDelete: vi.fn()
}));

vi.mock('../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('../../../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('../../../../../lib/auth', () => ({
  requireAdminSession: mocks.requireAdminSession
}));

vi.mock('@repo/db', () => ({
  prisma: {
    packageModifier: {
      findMany: mocks.packageModifierFindMany,
      create: mocks.packageModifierCreate,
      findFirst: mocks.packageModifierFindFirst,
      update: mocks.packageModifierUpdate,
      delete: mocks.packageModifierDelete
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

describe('admin package modifier routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
  });

  it('rejects mismatched package id on POST /api/packages/[id]/modifiers', async () => {
    const { POST } = await import('./[id]/modifiers/route');

    const response = await POST(
      new Request('http://localhost/api/packages/pkg_1/modifiers', {
        method: 'POST',
        body: JSON.stringify({
          packageId: 'pkg_2',
          name: 'Extra Prints'
        }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'pkg_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.packageModifierCreate).not.toHaveBeenCalled();
  });

  it('returns 404 when modifier is missing for GET /api/packages/[id]/modifiers/[modifierId]', async () => {
    mocks.packageModifierFindFirst.mockResolvedValueOnce(null);

    const { GET } = await import('./[id]/modifiers/[modifierId]/route');

    const response = await GET(new Request('http://localhost/api/packages/pkg_1/modifiers/mod_1'), {
      params: { id: 'pkg_1', modifierId: 'mod_1' }
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('NOT_FOUND');
  });

  it('updates a modifier for PUT /api/packages/[id]/modifiers/[modifierId]', async () => {
    mocks.packageModifierFindFirst.mockResolvedValueOnce({ id: 'mod_1', packageId: 'pkg_1' });
    const updated = { id: 'mod_1', packageId: 'pkg_1', name: 'Extended Coverage' };
    mocks.packageModifierUpdate.mockResolvedValueOnce(updated);

    const { PUT } = await import('./[id]/modifiers/[modifierId]/route');

    const response = await PUT(
      new Request('http://localhost/api/packages/pkg_1/modifiers/mod_1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Extended Coverage' }),
        headers: { 'Content-Type': 'application/json' }
      }),
      { params: { id: 'pkg_1', modifierId: 'mod_1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: updated });
    expect(mocks.packageModifierUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'mod_1' }, data: { name: 'Extended Coverage' } })
    );
  });
});
