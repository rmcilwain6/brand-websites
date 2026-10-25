import { describe, expect, it } from 'vitest';

import { BookingFormSchema } from './booking-form';

const base = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Calgary',
  preferredDate: '2026-11-14'
};

describe('BookingFormSchema', () => {
  it('accepts a booking with only the required fields', () => {
    expect(BookingFormSchema.safeParse(base).success).toBe(true);
  });

  it('accepts and keeps the referral fields', () => {
    const result = BookingFormSchema.parse({
      ...base,
      locationIdeas: 'The farmers market',
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes',
      voucherCode: 'eac-ab2c',
      heardFrom: 'friend'
    });

    expect(result).toMatchObject({
      locationIdeas: 'The farmers market',
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes',
      voucherCode: 'eac-ab2c',
      heardFrom: 'friend'
    });
  });

  it('trims optional text and treats blanks as missing', () => {
    const result = BookingFormSchema.parse({
      ...base,
      referrerName: '  Sam Patel  ',
      referrerContact: '   ',
      locationIdeas: '',
      heardFrom: ''
    });

    expect(result.referrerName).toBe('Sam Patel');
    expect(result.referrerContact).toBeUndefined();
    expect(result.locationIdeas).toBeUndefined();
    expect(result.heardFrom).toBeUndefined();
  });

  it('does not parse or validate referrer contact', () => {
    for (const contact of ['@handle', 'sam@example.com', '403-555-0100', 'ask at the market']) {
      expect(BookingFormSchema.safeParse({ ...base, referrerContact: contact }).success).toBe(true);
    }
  });

  it('rejects an unknown heard-from value', () => {
    expect(BookingFormSchema.safeParse({ ...base, heardFrom: 'billboard' }).success).toBe(false);
  });

  it('rejects overlong referral text', () => {
    expect(BookingFormSchema.safeParse({ ...base, referrerName: 'x'.repeat(201) }).success).toBe(
      false
    );
  });

  it('lets the honeypot through so the route can drop it quietly', () => {
    const result = BookingFormSchema.parse({ ...base, website: 'http://spam.example' });
    expect(result.website).toBe('http://spam.example');
  });
});
