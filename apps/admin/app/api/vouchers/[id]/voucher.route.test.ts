import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  voucherFindUnique: vi.fn(),
  voucherUpdate: vi.fn(),
  bookingFindUnique: vi.fn()
}));

vi.mock('../../../lib/auth', () => ({ requireAdminSession: mocks.requireAdminSession }));
vi.mock('@repo/db', () => ({
  prisma: {
    voucher: { findUnique: mocks.voucherFindUnique, update: mocks.voucherUpdate },
    bookingRequest: { findUnique: mocks.bookingFindUnique }
  }
}));

const sentAt = new Date('2026-10-01T00:00:00Z');

const voucher = (overrides: Record<string, unknown> = {}) => ({
  id: 'v_1',
  code: 'EAC-7KQ2',
  status: 'ACTIVE',
  sourceBookingId: 'b_source',
  activatedAt: sentAt,
  redeemedAt: null,
  voidedAt: null,
  redeemedBookingId: null,
  ...overrides
});

const patch = async (body: unknown) => {
  const { PATCH } = await import('./route');
  return PATCH(
    new Request('http://localhost/api/vouchers/v_1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    { params: { id: 'v_1' } }
  );
};

const sentData = () => mocks.voucherUpdate.mock.calls[0][0].data;

describe('PATCH /api/vouchers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
    mocks.voucherFindUnique.mockResolvedValue(voucher());
    mocks.bookingFindUnique.mockResolvedValue({ id: 'b_2' });
    mocks.voucherUpdate.mockImplementation(async ({ data }) => ({ ...voucher(), ...data }));
  });

  it('requires an admin session', async () => {
    mocks.requireAdminSession.mockReturnValue(new Response(null, { status: 401 }));

    const res = await patch({ notes: 'hi' });

    expect(res.status).toBe(401);
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });

  it('404s for an unknown voucher', async () => {
    mocks.voucherFindUnique.mockResolvedValue(null);

    const res = await patch({ notes: 'hi' });

    expect(res.status).toBe(404);
  });

  it('edits the holder and notes without touching status', async () => {
    await patch({ holderName: 'Ana Lee', holderContact: '', notes: 'Transferred from Sam' });

    expect(sentData()).toEqual({
      holderName: 'Ana Lee',
      holderContact: null,
      notes: 'Transferred from Sam'
    });
  });

  it('activates a pending voucher and stamps activatedAt', async () => {
    mocks.voucherFindUnique.mockResolvedValue(voucher({ status: 'PENDING', activatedAt: null }));

    await patch({ status: 'ACTIVE' });

    expect(sentData()).toMatchObject({
      status: 'ACTIVE',
      activatedAt: expect.any(Date),
      redeemedAt: null,
      voidedAt: null,
      redeemedBookingId: null
    });
  });

  it('voids a voucher, keeping when it was first sent', async () => {
    await patch({ status: 'VOID' });

    expect(sentData()).toMatchObject({
      status: 'VOID',
      activatedAt: sentAt,
      voidedAt: expect.any(Date)
    });
  });

  it('clears redemption when a redeemed voucher is set back to active', async () => {
    mocks.voucherFindUnique.mockResolvedValue(
      voucher({ status: 'REDEEMED', redeemedAt: new Date(), redeemedBookingId: 'b_2' })
    );

    await patch({ status: 'ACTIVE' });

    expect(sentData()).toMatchObject({
      status: 'ACTIVE',
      redeemedAt: null,
      redeemedBookingId: null
    });
  });

  it('marks it redeemed on a booking, from any status', async () => {
    mocks.voucherFindUnique.mockResolvedValue(voucher({ status: 'PENDING', activatedAt: null }));

    const res = await patch({ redeemedBookingId: 'b_2' });

    expect(res.status).toBe(200);
    expect(sentData()).toMatchObject({
      status: 'REDEEMED',
      redeemedAt: expect.any(Date),
      redeemedBookingId: 'b_2'
    });
  });

  it('refuses to redeem on the booking that earned the voucher', async () => {
    const res = await patch({ redeemedBookingId: 'b_source' });

    expect(res.status).toBe(400);
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });

  it('refuses a redeemed booking with a different status', async () => {
    const res = await patch({ redeemedBookingId: 'b_2', status: 'ACTIVE' });

    expect(res.status).toBe(400);
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });

  it('404s when the redeemed-on booking does not exist', async () => {
    mocks.bookingFindUnique.mockResolvedValue(null);

    const res = await patch({ redeemedBookingId: 'missing' });

    expect(res.status).toBe(404);
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });

  it('switches the discount to a percentage, clearing the amount', async () => {
    await patch({ discountType: 'PERCENTAGE', percentOff: 10 });

    expect(sentData()).toEqual({ discountType: 'PERCENTAGE', amountCents: null, percentOff: 10 });
  });

  it('sets and clears the expiry', async () => {
    await patch({ expiresAt: '2027-06-30T23:59:59.999Z' });
    expect(sentData()).toEqual({ expiresAt: new Date('2027-06-30T23:59:59.999Z') });

    mocks.voucherUpdate.mockClear();
    await patch({ expiresAt: null });
    expect(sentData()).toEqual({ expiresAt: null });
  });
});
