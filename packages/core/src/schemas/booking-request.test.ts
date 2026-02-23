import { describe, expect, it } from 'vitest';

import { BookingRequestSubmissionPayloadSchema } from './booking-request';

describe('BookingRequestSubmissionPayloadSchema', () => {
  it('accepts a valid booking request submission payload', () => {
    const result = BookingRequestSubmissionPayloadSchema.safeParse({
      packageId: 'pkg_deluxe',
      timeSlotId: 'slot_123',
      guestCount: 8,
      requestedAt: '2026-05-04T16:00:00.000Z',
      selectedOptions: { backdrop: 'floral', delivery: true },
      notes: 'Need wheelchair accessibility.'
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing package id', () => {
    const result = BookingRequestSubmissionPayloadSchema.safeParse({
      guestCount: 8
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid guest count boundary', () => {
    const result = BookingRequestSubmissionPayloadSchema.safeParse({
      packageId: 'pkg_deluxe',
      guestCount: 0
    });

    expect(result.success).toBe(false);
  });
});
