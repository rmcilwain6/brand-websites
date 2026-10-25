import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  inquiryCreate: vi.fn(),
  packageFindUnique: vi.fn(),
  bookingRequestUpdate: vi.fn(),
  sendBookingConfirmation: vi.fn(),
  sendBookingNotification: vi.fn()
}));

vi.mock('../../../lib/email', () => ({
  sendBookingConfirmation: mocks.sendBookingConfirmation,
  sendBookingNotification: mocks.sendBookingNotification
}));

vi.mock('@repo/db', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;

    constructor(message: string, { code, meta }: { code: string; meta?: Record<string, unknown> }) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  }

  return {
    prisma: {
      inquiry: { create: mocks.inquiryCreate },
      package: { findUnique: mocks.packageFindUnique },
      bookingRequest: { update: mocks.bookingRequestUpdate }
    },
    PrismaClientKnownRequestError
  };
});

const booking = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Calgary',
  preferredDate: '2026-11-14'
};

const post = async (body: unknown) => {
  const { POST } = await import('./route');
  return POST(
    new Request('http://localhost/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );
};

const codeCollision = async (target: unknown = ['code']) => {
  const { PrismaClientKnownRequestError } = await import('@repo/db');
  return new PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    meta: { target },
    clientVersion: 'test'
  } as never);
};

/** The `bookingRequest.create` data from the nth `inquiry.create` call. */
const bookingCreate = (call = 0) =>
  mocks.inquiryCreate.mock.calls[call]![0].data.bookingRequest.create;

describe('POST /api/public/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.inquiryCreate.mockResolvedValue({ id: 'inq_1', bookingRequest: { id: 'br_1' } });
    mocks.packageFindUnique.mockResolvedValue(null);
    mocks.bookingRequestUpdate.mockResolvedValue({});
    mocks.sendBookingConfirmation.mockResolvedValue(undefined);
    mocks.sendBookingNotification.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('saves a booking without referral details and creates no voucher', async () => {
    const res = await post(booking);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { inquiryId: 'inq_1' } });
    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(1);
    expect(bookingCreate()).toMatchObject({
      locationIdeas: null,
      referrerName: null,
      referrerContact: null,
      voucherCodeEntered: null,
      heardFrom: null
    });
    expect(bookingCreate().referralVoucher).toBeUndefined();
    expect(mocks.sendBookingConfirmation).toHaveBeenCalledTimes(1);
    expect(mocks.sendBookingNotification).toHaveBeenCalledTimes(1);
  });

  it('saves the new booking fields as entered', async () => {
    await post({
      ...booking,
      locationIdeas: 'The farmers market',
      voucherCode: 'eac ab2c',
      heardFrom: 'instagram'
    });

    expect(bookingCreate()).toMatchObject({
      locationIdeas: 'The farmers market',
      voucherCodeEntered: 'eac ab2c',
      heardFrom: 'instagram'
    });
  });

  it('creates one PENDING referral voucher when a referrer is named', async () => {
    await post({ ...booking, referrerName: 'Sam Patel', referrerContact: '@sam.makes' });

    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(1);
    expect(bookingCreate()).toMatchObject({
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes'
    });

    const voucher = bookingCreate().referralVoucher.create;
    expect(voucher.code).toMatch(/^EAC-[A-Z2-9]{4}$/);
    expect(voucher).toMatchObject({
      type: 'REFERRAL',
      status: 'PENDING',
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500,
      percentOff: null,
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes',
      holderName: 'Sam Patel',
      holderContact: '@sam.makes'
    });
    expect(voucher.expiresAt.toISOString()).toBe('2027-12-31T23:59:59.999Z');
  });

  it('creates a referral voucher with no contact when only a name is given', async () => {
    await post({ ...booking, referrerName: 'Sam Patel' });

    expect(bookingCreate().referralVoucher.create).toMatchObject({
      referrerContact: null,
      holderContact: null
    });
  });

  it('stores contact but creates no voucher when there is no referrer name', async () => {
    await post({ ...booking, referrerContact: '@sam.makes' });

    expect(bookingCreate().referrerContact).toBe('@sam.makes');
    expect(bookingCreate().referralVoucher).toBeUndefined();
  });

  it('keeps the code the booker typed separate from the generated referral code', async () => {
    await post({ ...booking, referrerName: 'Sam Patel', voucherCode: 'EAC-XY23' });

    expect(bookingCreate().voucherCodeEntered).toBe('EAC-XY23');
    expect(bookingCreate().referralVoucher.create.code).not.toBe('EAC-XY23');
  });

  it('retries with a new code when the generated code is already taken', async () => {
    mocks.inquiryCreate.mockRejectedValueOnce(await codeCollision());

    const res = await post({ ...booking, referrerName: 'Sam Patel' });

    expect(res.status).toBe(200);
    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(2);
    expect(bookingCreate(1).referralVoucher.create.code).toMatch(/^EAC-/);
  });

  it('gives up after five code collisions', async () => {
    mocks.inquiryCreate.mockRejectedValue(await codeCollision());

    const res = await post({ ...booking, referrerName: 'Sam Patel' });

    expect(res.status).toBe(500);
    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(5);
    expect(mocks.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('does not retry other unique-constraint failures', async () => {
    mocks.inquiryCreate.mockRejectedValueOnce(await codeCollision(['sourceBookingId']));

    const res = await post({ ...booking, referrerName: 'Sam Patel' });

    expect(res.status).toBe(500);
    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(1);
  });

  it('does not retry without a referrer', async () => {
    mocks.inquiryCreate.mockRejectedValueOnce(await codeCollision());

    const res = await post(booking);

    expect(res.status).toBe(500);
    expect(mocks.inquiryCreate).toHaveBeenCalledTimes(1);
  });

  it('drops honeypot submissions without saving or emailing', async () => {
    const res = await post({
      ...booking,
      referrerName: 'Sam Patel',
      website: 'http://spam.example'
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { inquiryId: null } });
    expect(mocks.inquiryCreate).not.toHaveBeenCalled();
    expect(mocks.sendBookingConfirmation).not.toHaveBeenCalled();
    expect(mocks.sendBookingNotification).not.toHaveBeenCalled();
  });

  it('rejects an invalid booking', async () => {
    const res = await post({ ...booking, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(mocks.inquiryCreate).not.toHaveBeenCalled();
  });
});
