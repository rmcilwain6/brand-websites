import { describe, expect, it } from 'vitest';

import { BookingFormSchema } from './booking-form';

const base = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Calgary',
  preferredDate: '2026-11-14'
};

const errorPaths = (input: unknown) => {
  const result = BookingFormSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('BookingFormSchema', () => {
  it('accepts a booking with only the required fields', () => {
    expect(BookingFormSchema.safeParse(base).success).toBe(true);
  });

  it('accepts an application with the required answers and keeps the rest', () => {
    const result = BookingFormSchema.parse({
      ...base,
      applyToCampaign: true,
      campaignAnswers: {
        whatWorkingOn: '  Restoring a 1972 sailboat  ',
        aboutIt: '',
        link: '@sailboat.restored',
        othersInvolved: 'My brother',
        acknowledged: true
      }
    });

    expect(result.campaignAnswers).toEqual({
      whatWorkingOn: 'Restoring a 1972 sailboat',
      aboutIt: undefined,
      link: '@sailboat.restored',
      othersInvolved: 'My brother',
      acknowledged: true
    });
  });

  it('requires what they are working on and the acknowledgement to apply', () => {
    expect(errorPaths({ ...base, applyToCampaign: true })).toEqual([
      'campaignAnswers.whatWorkingOn',
      'campaignAnswers.acknowledged'
    ]);
  });

  it('treats a blank answer as missing when applying', () => {
    expect(
      errorPaths({
        ...base,
        applyToCampaign: true,
        campaignAnswers: { whatWorkingOn: '   ', acknowledged: true }
      })
    ).toEqual(['campaignAnswers.whatWorkingOn']);
  });

  it('requires the acknowledgement to be ticked, not just present', () => {
    expect(
      errorPaths({
        ...base,
        applyToCampaign: true,
        campaignAnswers: { whatWorkingOn: 'A sewing business', acknowledged: false }
      })
    ).toEqual(['campaignAnswers.acknowledged']);
  });

  it('does not require campaign answers when not applying', () => {
    expect(errorPaths({ ...base, applyToCampaign: false })).toEqual([]);
    expect(errorPaths({ ...base, applyToCampaign: false, campaignAnswers: {} })).toEqual([]);
  });

  it('accepts and keeps the referral fields', () => {
    const result = BookingFormSchema.parse({
      ...base,
      locationIdeas: 'The farmers market',
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes',
      voucherCode: 'eac-ab2c',
      heardFrom: 'friends-family'
    });

    expect(result).toMatchObject({
      locationIdeas: 'The farmers market',
      referrerName: 'Sam Patel',
      referrerContact: '@sam.makes',
      voucherCode: 'eac-ab2c',
      heardFrom: 'friends-family'
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
