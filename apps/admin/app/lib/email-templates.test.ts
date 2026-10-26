import { render } from '@react-email/render';
import { describe, expect, it } from 'vitest';

import { BookingConfirmation } from '../../emails/booking-confirmation';
import { BookingNotification } from '../../emails/booking-notification';
import type { BookingEmailData } from '../../emails/components/types';
import { bookingNotificationSubject } from './email';

const full = BookingNotification.PreviewProps as BookingEmailData;

const plain: BookingEmailData = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Kamloops',
  preferredDate: '2026-11-21',
  inquiryId: 'inq_plain'
};

const text = async (html: Promise<string> | string) =>
  (await html)
    // React separates adjacent text and expressions with <!-- --> comments; drop them unspaced.
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

describe('booking notification email', () => {
  it('shows the referral, the new referral voucher and the entered voucher check', async () => {
    const out = await text(render(BookingNotification(full)));

    expect(out).toContain('Referred by Sam Patel');
    expect(out).toContain('EAC-7KQ2');
    expect(out).toContain('$15 off · Pending · expires Dec 31, 2027');
    expect(out).toContain('eac-ab2c');
    expect(out).toContain('Held by Jordan Lee');
    expect(out).toContain('Heard via Friends/family');
    expect(out).toContain('The farmers market, or Beacon Hill Park');
    expect(out).toContain('Saturday, November 14, 2026');
    expect(out).toContain('10:00 AM');
  });

  it('links to the booking in the admin', async () => {
    const html = await render(BookingNotification(full));
    expect(html).toContain('href="http://localhost:3001/bookings/clz1booking"');
  });

  it('leaves out the referral section when there is nothing to show', async () => {
    const out = await text(render(BookingNotification(plain)));

    expect(out).not.toContain('How they found you');
    expect(out).toContain('No preference');
    expect(out).toContain('None chosen');
  });

  it.each([
    [{ verdict: 'unknown', code: 'EAC-ZZZ9' }, 'No match'],
    [{ verdict: 'malformed' }, 'Not a code']
  ] as const)('explains a voucher that %o', async (check, badge) => {
    const out = await text(
      render(BookingNotification({ ...plain, voucherEntered: { entered: 'x', check } }))
    );
    expect(out).toContain(badge);
  });

  it('has a subject with who, what, when and any referral work', () => {
    expect(bookingNotificationSubject(full)).toBe(
      'New booking: Sarah Holloway · Evryday · Sat, Nov 14 · Referral · Voucher'
    );
    expect(bookingNotificationSubject(plain)).toBe('New booking: Jordan Lee · Sat, Nov 21');
  });
});

describe('booking confirmation email', () => {
  it('confirms the voucher code without an amount or its status', async () => {
    const out = await text(render(BookingConfirmation(full)));

    expect(out).toContain('eac-ab2c (I’ll confirm it with you by email)');
    expect(out).not.toContain('$15 off');
    expect(out).not.toContain('Held by');
    expect(out).not.toContain('Valid');
  });

  it('never shows the referrer or their voucher', async () => {
    const out = await text(render(BookingConfirmation(full)));

    expect(out).not.toContain('Sam Patel');
    expect(out).not.toContain('EAC-7KQ2');
    expect(out).not.toContain('Friends/family');
  });

  it('renders a plain request without the optional rows', async () => {
    const out = await text(render(BookingConfirmation(plain)));

    expect(out).toContain('Hi Jordan,');
    expect(out).toContain('Saturday, November 21, 2026');
    expect(out).not.toContain('Voucher code');
    expect(out).not.toContain('Your notes');
    expect(out).not.toContain('This is an estimate');
  });
});
