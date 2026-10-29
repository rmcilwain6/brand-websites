import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  voucherFindMany: vi.fn(),
  voucherCreate: vi.fn()
}));

vi.mock('../../lib/auth', () => ({ requireAdminSession: mocks.requireAdminSession }));
vi.mock('@repo/db', () => ({
  prisma: { voucher: { findMany: mocks.voucherFindMany, create: mocks.voucherCreate } },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;

    constructor(message: string, { code, meta }: { code: string; meta?: Record<string, unknown> }) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  }
}));

const post = async (body: unknown) => {
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );
};

describe('GET /api/vouchers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
    mocks.voucherFindMany.mockResolvedValue([]);
  });

  it('requires an admin session', async () => {
    mocks.requireAdminSession.mockReturnValue(new Response(null, { status: 401 }));
    const { GET } = await import('./route');

    const res = await GET(new Request('http://localhost/api/vouchers'));

    expect(res.status).toBe(401);
    expect(mocks.voucherFindMany).not.toHaveBeenCalled();
  });

  it('filters by status and type', async () => {
    const { GET } = await import('./route');

    await GET(new Request('http://localhost/api/vouchers?status=ACTIVE&type=REFERRAL'));

    expect(mocks.voucherFindMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE', type: 'REFERRAL' },
      orderBy: { createdAt: 'desc' }
    });
  });

  it('ignores unknown filter values', async () => {
    const { GET } = await import('./route');

    await GET(new Request('http://localhost/api/vouchers?status=nope'));

    expect(mocks.voucherFindMany).toHaveBeenCalledWith({
      where: { status: undefined, type: undefined },
      orderBy: { createdAt: 'desc' }
    });
  });
});

describe('POST /api/vouchers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireAdminSession.mockReturnValue(null);
    mocks.voucherCreate.mockImplementation(async ({ data }) => ({ id: 'v_1', ...data }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('requires an admin session', async () => {
    mocks.requireAdminSession.mockReturnValue(new Response(null, { status: 401 }));

    const res = await post({ discountType: 'FIXED_AMOUNT', amountCents: 2500 });

    expect(res.status).toBe(401);
    expect(mocks.voucherCreate).not.toHaveBeenCalled();
  });

  it('creates a fixed-amount voucher with a generated code, holder defaulting to the referrer', async () => {
    const res = await post({
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500,
      referrerName: 'Sam Patel',
      referrerContact: '@sam',
      expiresAt: '2027-12-31T23:59:59.999Z'
    });

    expect(res.status).toBe(201);
    const { data } = mocks.voucherCreate.mock.calls[0][0];
    expect(data).toMatchObject({
      type: 'REFERRAL',
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500,
      percentOff: null,
      holderName: 'Sam Patel',
      holderContact: '@sam',
      expiresAt: new Date('2027-12-31T23:59:59.999Z')
    });
    expect(data.code).toMatch(/^EAC-[A-Z2-9]{4}$/);
  });

  it('creates a percentage voucher for a named holder with no expiry', async () => {
    await post({ discountType: 'PERCENTAGE', percentOff: 20, holderName: 'Ana' });

    expect(mocks.voucherCreate.mock.calls[0][0].data).toMatchObject({
      discountType: 'PERCENTAGE',
      amountCents: null,
      percentOff: 20,
      holderName: 'Ana',
      referrerName: null,
      expiresAt: null
    });
  });

  it('rejects a discount without its value', async () => {
    const res = await post({ discountType: 'PERCENTAGE' });

    expect(res.status).toBe(400);
    expect(mocks.voucherCreate).not.toHaveBeenCalled();
  });

  it('retries with a fresh code on a collision', async () => {
    const { PrismaClientKnownRequestError } = await import('@repo/db');
    const Clash = PrismaClientKnownRequestError as unknown as new (
      m: string,
      o: { code: string; meta?: Record<string, unknown> }
    ) => Error;
    mocks.voucherCreate
      .mockRejectedValueOnce(new Clash('dup', { code: 'P2002', meta: { target: ['code'] } }))
      .mockImplementationOnce(async ({ data }) => ({ id: 'v_1', ...data }));

    const res = await post({ discountType: 'FIXED_AMOUNT', amountCents: 1500 });

    expect(res.status).toBe(201);
    expect(mocks.voucherCreate).toHaveBeenCalledTimes(2);
  });
});
