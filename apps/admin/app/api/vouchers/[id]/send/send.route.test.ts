import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  voucherFindUnique: vi.fn(),
  voucherUpdate: vi.fn(),
  sendReferralVoucher: vi.fn()
}));

vi.mock('../../../../lib/auth', () => ({ requireAdminSession: mocks.requireAdminSession }));
vi.mock('../../../../lib/email', () => ({ sendReferralVoucher: mocks.sendReferralVoucher }));
vi.mock('@repo/db', () => ({
  prisma: { voucher: { findUnique: mocks.voucherFindUnique, update: mocks.voucherUpdate } }
}));

const voucher = (overrides: Record<string, unknown> = {}) => ({
  id: 'v_1',
  code: 'EAC-7KQ2',
  status: 'PENDING',
  discountType: 'FIXED_AMOUNT',
  amountCents: 1500,
  percentOff: null,
  holderName: 'Sam Patel',
  holderContact: null,
  expiresAt: new Date('2099-12-31T23:59:59.999Z'),
  activatedAt: null,
  sourceBooking: { inquiry: { name: 'Sarah Holloway' } },
  ...overrides
});

const post = async (body: unknown) => {
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost/api/vouchers/v_1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    { params: { id: 'v_1' } }
  );
};

describe('POST /api/vouchers/[id]/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
    mocks.voucherFindUnique.mockResolvedValue(voucher());
    mocks.voucherUpdate.mockImplementation(async ({ data }) => ({ ...voucher(), ...data }));
    mocks.sendReferralVoucher.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('requires an admin session', async () => {
    mocks.requireAdminSession.mockReturnValue(new Response(null, { status: 401 }));

    const res = await post({ to: 'sam@example.com' });

    expect(res.status).toBe(401);
    expect(mocks.sendReferralVoucher).not.toHaveBeenCalled();
  });

  it('emails the code and activates a pending voucher', async () => {
    const res = await post({ to: ' sam@example.com ' });

    expect(res.status).toBe(200);
    expect(mocks.sendReferralVoucher).toHaveBeenCalledWith('sam@example.com', {
      holderName: 'Sam Patel',
      referredName: 'Sarah Holloway',
      code: 'EAC-7KQ2',
      discountLabel: '$15',
      expiresOn: '2099-12-31'
    });
    expect(mocks.voucherUpdate).toHaveBeenCalledWith({
      where: { id: 'v_1' },
      data: { status: 'ACTIVE', activatedAt: expect.any(Date), holderContact: 'sam@example.com' }
    });
  });

  it('resends an active voucher without changing when it was first sent or its contact', async () => {
    const activatedAt = new Date('2026-11-01T00:00:00Z');
    mocks.voucherFindUnique.mockResolvedValue(
      voucher({ status: 'ACTIVE', activatedAt, holderContact: '@sam.makes' })
    );

    await post({ to: 'sam@example.com' });

    expect(mocks.voucherUpdate).toHaveBeenCalledWith({
      where: { id: 'v_1' },
      data: { status: 'ACTIVE', activatedAt, holderContact: '@sam.makes' }
    });
  });

  it('labels percentage vouchers', async () => {
    mocks.voucherFindUnique.mockResolvedValue(
      voucher({ discountType: 'PERCENTAGE', amountCents: null, percentOff: 20 })
    );

    await post({ to: 'sam@example.com' });

    expect(mocks.sendReferralVoucher.mock.calls[0]![1]).toMatchObject({ discountLabel: '20%' });
  });

  it('rejects an address that is not an email', async () => {
    const res = await post({ to: '@sam.makes' });

    expect(res.status).toBe(400);
    expect(mocks.sendReferralVoucher).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown voucher', async () => {
    mocks.voucherFindUnique.mockResolvedValue(null);

    expect((await post({ to: 'sam@example.com' })).status).toBe(404);
  });

  it.each([
    [{ status: 'REDEEMED' }],
    [{ status: 'VOID' }],
    [{ expiresAt: new Date('2020-01-01T00:00:00Z') }]
  ])('refuses to send a voucher that cannot be used (%o)', async (overrides) => {
    mocks.voucherFindUnique.mockResolvedValue(voucher(overrides));

    const res = await post({ to: 'sam@example.com' });

    expect(res.status).toBe(409);
    expect(mocks.sendReferralVoucher).not.toHaveBeenCalled();
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });

  it('leaves the voucher pending when the email fails', async () => {
    mocks.sendReferralVoucher.mockRejectedValue(new Error('Resend is down'));

    const res = await post({ to: 'sam@example.com' });

    expect(res.status).toBe(500);
    expect(mocks.voucherUpdate).not.toHaveBeenCalled();
  });
});
