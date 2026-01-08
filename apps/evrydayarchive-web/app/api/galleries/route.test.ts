import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repo/db', () => ({
  prisma: {
    gallery: {
      findMany: vi.fn()
    }
  }
}));

describe('GET /api/galleries', () => {
  beforeEach(async () => {
    const { prisma } = await import('@repo/db');
    const mockFindMany = vi.mocked(prisma.gallery.findMany);
    mockFindMany.mockResolvedValue([]);
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/evrydayarchive';
  });

  it('returns a success response', async () => {
    const { GET } = await import('./route');

    const response = await GET();
    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(Array.isArray(payload.data)).toBe(true);
  });
});
