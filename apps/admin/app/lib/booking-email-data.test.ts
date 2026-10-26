import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/db', () => ({ prisma: {}, Prisma: {} }));

import {
  checkEnteredVoucher,
  toBookingEmailData,
  type BookingForEmail
} from './booking-email-data';

const now = new Date('2026-11-01T12:00:00Z');

const voucher = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'v_1',
    code: 'EAC-AB2C',
    type: 'REFERRAL',
    status: 'ACTIVE',
    discountType: 'FIXED_AMOUNT',
    amountCents: 1500,
    percentOff: null,
    referrerName: 'Sam Patel',
    referrerContact: null,
    holderName: 'Sam Patel',
    holderContact: null,
    sourceBookingId: 'br_0',
    redeemedBookingId: null,
    expiresAt: new Date('2027-12-31T23:59:59.999Z'),
    activatedAt: null,
    redeemedAt: null,
    voidedAt: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }) as Parameters<typeof checkEnteredVoucher>[1] & object;

const booking = (overrides: Partial<BookingForEmail> = {}): BookingForEmail =>
  ({
    id: 'br_1',
    inquiryId: 'inq_1',
    packageId: null,
    requestedAt: new Date('2026-11-14T10:00:00Z'),
    notes: null,
    selectedOptions: { modifierIds: [], modifierValues: {} },
    locationIdeas: null,
    referrerName: null,
    referrerContact: null,
    voucherCodeEntered: null,
    heardFrom: null,
    emailSentAt: null,
    emailError: null,
    package: null,
    referralVoucher: null,
    inquiry: {
      id: 'inq_1',
      type: 'BOOKING_REQUEST',
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: null,
      message: null,
      payload: {
        location: 'Victoria',
        preferredDate: '2026-11-14',
        preferredTime: '10:00',
        packageName: 'Evryday',
        estimatedTotalCents: 15000
      }
    },
    ...overrides
  }) as BookingForEmail;

describe('checkEnteredVoucher', () => {
  it('is valid for an active, in-date voucher, matched however it was typed', () => {
    expect(checkEnteredVoucher(' eac ab2c ', voucher(), now)).toEqual({
      verdict: 'valid',
      code: 'EAC-AB2C',
      holderName: 'Sam Patel',
      discountLabel: '$15',
      expiresOn: '2027-12-31'
    });
  });

  it.each([
    ['PENDING', 'pending'],
    ['REDEEMED', 'redeemed'],
    ['VOID', 'void']
  ])('reports a %s voucher as %s', (status, verdict) => {
    expect(checkEnteredVoucher('EAC-AB2C', voucher({ status }), now)).toMatchObject({ verdict });
  });

  it('reports an expired voucher as expired, even while it is still active', () => {
    const past = voucher({ expiresAt: new Date('2026-10-31T23:59:59.999Z') });
    expect(checkEnteredVoucher('EAC-AB2C', past, now)).toMatchObject({ verdict: 'expired' });
  });

  it('keeps redeemed ahead of expired', () => {
    const used = voucher({ status: 'REDEEMED', expiresAt: new Date('2026-01-01T00:00:00Z') });
    expect(checkEnteredVoucher('EAC-AB2C', used, now)).toMatchObject({ verdict: 'redeemed' });
  });

  it('labels percentage vouchers', () => {
    const pct = voucher({ discountType: 'PERCENTAGE', amountCents: null, percentOff: 15 });
    expect(checkEnteredVoucher('EAC-AB2C', pct, now)).toMatchObject({ discountLabel: '15%' });
  });

  it('is unknown when no voucher has the code', () => {
    expect(checkEnteredVoucher('eac-zzz9', null, now)).toEqual({
      verdict: 'unknown',
      code: 'EAC-ZZZ9'
    });
  });

  it('is malformed when the text cannot be a code', () => {
    expect(checkEnteredVoucher('SUMMER25', null, now)).toEqual({ verdict: 'malformed' });
  });
});

describe('toBookingEmailData', () => {
  it('maps a plain booking from its inquiry payload', () => {
    expect(toBookingEmailData(booking(), null, { now })).toMatchObject({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      location: 'Victoria',
      preferredDate: '2026-11-14',
      preferredTime: '10:00',
      packageName: 'Evryday',
      estimatedTotalCents: 15000,
      inquiryId: 'inq_1',
      locationIdeas: undefined,
      heardFrom: undefined,
      referrer: undefined,
      referralVoucher: undefined,
      voucherEntered: undefined,
      adminUrl: undefined
    });
  });

  it('includes the referral fields, the new referral voucher and the admin link', () => {
    const data = toBookingEmailData(
      booking({
        locationIdeas: 'The market',
        heardFrom: 'friends-family',
        referrerName: 'Sam Patel',
        referrerContact: '@sam.makes',
        referralVoucher: voucher({ code: 'EAC-7KQ2', status: 'PENDING' }) as never
      }),
      null,
      { now, adminOrigin: 'http://localhost:3001' }
    );

    expect(data).toMatchObject({
      locationIdeas: 'The market',
      heardFrom: 'Friends/family',
      referrer: { name: 'Sam Patel', contact: '@sam.makes', sameAsBooker: false },
      referralVoucher: { code: 'EAC-7KQ2', discountLabel: '$15', expiresOn: '2027-12-31' },
      adminUrl: 'http://localhost:3001/bookings/br_1'
    });
  });

  it('flags a referrer with the same name as the booker', () => {
    const data = toBookingEmailData(booking({ referrerName: '  jordan   LEE ' }), null, { now });
    expect(data?.referrer?.sameAsBooker).toBe(true);
  });

  it('keeps the entered code as typed and checks it against the voucher found', () => {
    const data = toBookingEmailData(booking({ voucherCodeEntered: 'eac ab2c' }), voucher(), {
      now
    });
    expect(data?.voucherEntered).toEqual({
      entered: 'eac ab2c',
      check: expect.objectContaining({ verdict: 'valid', code: 'EAC-AB2C' })
    });
  });

  it('falls back to requestedAt when the payload has no date', () => {
    const b = booking();
    b.inquiry!.payload = { location: 'Victoria' };
    expect(toBookingEmailData(b, null, { now })?.preferredDate).toBe('2026-11-14');
  });

  it('returns null for a booking with no inquiry', () => {
    expect(toBookingEmailData(booking({ inquiry: null }), null, { now })).toBeNull();
  });
});
