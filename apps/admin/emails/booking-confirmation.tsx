import { Text } from '@react-email/components';
import * as React from 'react';

import { formatDateLong, formatTime } from './components/format';
import type { BookingEmailData } from './components/types';
import { Card, DetailTable, Eyebrow, Hint, PriceTable, SectionTitle, s } from './components/ui';
import { EmailLayout } from './layout';

/**
 * Sent to the person who made the request. Only booker-facing details: never the referral
 * voucher, the voucher match, or any voucher amount (voucher values vary, so the spec keeps
 * amounts out of client copy).
 */
export const BookingConfirmation = ({
  name,
  location,
  preferredDate,
  preferredTime,
  packageName,
  estimatedTotalCents,
  notes,
  modifierLineItems,
  locationIdeas,
  voucherEntered
}: BookingEmailData) => {
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <EmailLayout preview="Your booking request is in. I’ll be in touch soon to confirm.">
      <Eyebrow>Booking request received</Eyebrow>
      <Text style={s.heading}>Hi {firstName},</Text>
      <Text style={s.body}>
        Thanks for your booking request. It’s come through, and I’ll be in touch soon to confirm the
        date and talk through the details. Nothing is booked until we’ve confirmed it together.
      </Text>

      <Card>
        <Text style={{ ...s.eyebrow, margin: '0 0 12px' }}>Your request</Text>
        <DetailTable
          rows={[
            ['Package', packageName],
            ['Date', formatDateLong(preferredDate)],
            ['Time', preferredTime && formatTime(preferredTime)],
            ['Location', location],
            ['Spots in mind', locationIdeas],
            [
              'Voucher code',
              voucherEntered && `${voucherEntered.entered} (I’ll confirm it with you by email)`
            ]
          ]}
        />
        <PriceTable items={modifierLineItems} totalCents={estimatedTotalCents} />
        {estimatedTotalCents != null && (
          <Hint>This is an estimate. I’ll confirm the final price with you.</Hint>
        )}
      </Card>

      {notes && (
        <>
          <SectionTitle>Your notes</SectionTitle>
          <Text style={s.quote}>{notes}</Text>
        </>
      )}

      <SectionTitle>What happens next</SectionTitle>
      <DetailTable
        rows={[
          ['1', 'I’ll check my calendar and confirm the date and time with you.'],
          ['2', 'We’ll sort out the details: the spot, timing, and anything you have in mind.'],
          ['3', 'Once we’ve both confirmed, your session is booked.']
        ]}
      />

      <Text style={{ ...s.body, margin: '20px 0 8px' }}>
        If anything changes or you have questions in the meantime, just reply to this email.
      </Text>
      <Text style={{ ...s.body, margin: 0, color: s.heading.color }}>— Reed</Text>
    </EmailLayout>
  );
};

BookingConfirmation.PreviewProps = {
  name: 'Sarah Holloway',
  email: 'sarah@example.com',
  location: 'Victoria',
  preferredDate: '2026-11-14',
  preferredTime: '10:00',
  packageName: 'Evryday',
  estimatedTotalCents: 22500,
  notes: 'Looking for a mix of candid and a few posed shots. My dog will be there too!',
  inquiryId: 'clz1abc2def3ghi4',
  modifierLineItems: [
    { name: 'Session length', displayValue: '60 min', priceDeltaCents: 2500 },
    { name: 'Extra photos', displayValue: '10', priceDeltaCents: 5000 }
  ],
  locationIdeas: 'The farmers market, or Beacon Hill Park',
  voucherEntered: { entered: 'EAC-AB2C', check: { verdict: 'unknown', code: 'EAC-AB2C' } }
} satisfies BookingEmailData;

export default BookingConfirmation;
