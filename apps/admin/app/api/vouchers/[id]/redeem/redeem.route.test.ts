import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  voucherFindUnique: vi.fn(),
  voucherUpdateMany: vi.fn(),
  bookingFindUnique: vi.fn()
}));

vi.mock('../../../../lib/auth', () => ({ requireAdminSession: mocks.requireAdminSession }));
vi.mock('@repo/db', () => ({
  prisma: {
    voucher: { findUnique: mocks.voucherFindUnique, updateMany: mocks.voucherUpdateMany },
    bookingRequest: { findUnique: mocks.bookingFindUnique }
  }
}));

const voucher = (overrides: Record<string, unknown> = {}) => ({
  id: 'v_1',
  code: 'EAC-7KQ2',
  status: 'ACTIVE',
  expiresAt: new Date('2099-12-31T23:59:59.999Z'),
  redeemedAt: null,
  redeemedBookingId: null,
  ...overrides
});

const post = async (body: unknown) => {
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost/api/vouchers/v_1/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    { params: { id: 'v_1' } }
  );
};

describe('POST /api/vouchers/[id]/redeem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
    mocks.voucherFindUnique.mockResolvedValue(voucher());
    mocks.bookingFindUnique.mockResolvedValue({ id: 'b_1' });
    mocks.voucherUpdateMany.mockResolvedValue({ count: 1 });
  });

  it('requires an admin session', async () => {
    mocks.requireAdminSession.mockReturnValue(new Response(null, { status: 401 }));

    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(401);
    expect(mocks.voucherUpdateMany).not.toHaveBeenCalled();
  });

  it('requires a booking id', async () => {
    const res = await post({});

    expect(res.status).toBe(400);
    expect(mocks.voucherUpdateMany).not.toHaveBeenCalled();
  });

  it('marks an active voucher redeemed on the booking', async () => {
    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(200);
    expect(mocks.voucherUpdateMany).toHaveBeenCalledWith({
      where: { id: 'v_1', status: 'ACTIVE' },
      data: { status: 'REDEEMED', redeemedAt: expect.any(Date), redeemedBookingId: 'b_1' }
    });
    const body = await res.json();
    expect(body.data).toMatchObject({ status: 'REDEEMED', redeemedBookingId: 'b_1' });
  });

  it('404s for an unknown voucher', async () => {
    mocks.voucherFindUnique.mockResolvedValue(null);

    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(404);
  });

  it('404s for an unknown booking', async () => {
    mocks.bookingFindUnique.mockResolvedValue(null);

    const res = await post({ bookingId: 'missing' });

    expect(res.status).toBe(404);
    expect(mocks.voucherUpdateMany).not.toHaveBeenCalled();
  });

  it.each([
    ['PENDING', 'hasn’t been sent'],
    ['REDEEMED', 'already been used'],
    ['VOID', 'been voided']
  ])('refuses a %s voucher', async (status, message) => {
    mocks.voucherFindUnique.mockResolvedValue(voucher({ status }));

    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(409);
    expect((await res.json()).error.message).toContain(message);
    expect(mocks.voucherUpdateMany).not.toHaveBeenCalled();
  });

  it('refuses an expired voucher', async () => {
    mocks.voucherFindUnique.mockResolvedValue(voucher({ expiresAt: new Date('2020-01-01') }));

    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(409);
    expect(mocks.voucherUpdateMany).not.toHaveBeenCalled();
  });

  it('refuses when another request redeemed it first', async () => {
    mocks.voucherUpdateMany.mockResolvedValue({ count: 0 });

    const res = await post({ bookingId: 'b_1' });

    expect(res.status).toBe(409);
  });
});
