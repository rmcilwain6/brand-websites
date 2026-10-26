import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';

import { formatDateLong, formatDateShort, formatExpiry, formatTime } from './components/format';
import type { BookingEmailData, VoucherCheck } from './components/types';
import {
  Badge,
  type BadgeTone,
  Card,
  Code,
  DetailTable,
  Eyebrow,
  Hint,
  PriceTable,
  PrimaryButton,
  SectionTitle,
  s
} from './components/ui';
import { EmailLayout } from './layout';

/** How each voucher check reads at a glance, and what to do about it. */
const VOUCHER_VERDICT: Record<
  VoucherCheck['verdict'],
  { tone: BadgeTone; badge: string; summary: string }
> = {
  valid: { tone: 'good', badge: 'Valid', summary: 'Active and in date.' },
  pending: {
    tone: 'warn',
    badge: 'Not active yet',
    summary: 'This code exists but is still Pending, so its holder hasn’t been sent it yet.'
  },
  redeemed: {
    tone: 'bad',
    badge: 'Already used',
    summary: 'This voucher has already been redeemed.'
  },
  void: { tone: 'bad', badge: 'Void', summary: 'This voucher has been voided.' },
  expired: { tone: 'bad', badge: 'Expired', summary: 'This voucher is past its expiry date.' },
  unknown: {
    tone: 'bad',
    badge: 'No match',
    summary: 'No voucher has this code. They may have mistyped it.'
  },
  malformed: {
    tone: 'bad',
    badge: 'Not a code',
    summary: 'This doesn’t look like a voucher code (EAC-XXXX).'
  }
};

export const BookingNotification = (data: BookingEmailData) => {
  const {
    name,
    email,
    phone,
    location,
    preferredDate,
    preferredTime,
    packageName,
    packageBasePriceCents,
    estimatedTotalCents,
    notes,
    inquiryId,
    modifierLineItems,
    locationIdeas,
    heardFrom,
    referrer,
    referralVoucher,
    voucherEntered,
    adminUrl
  } = data;

  const verdict = voucherEntered && VOUCHER_VERDICT[voucherEntered.check.verdict];
  const glance = [packageName ?? 'No package', formatDateShort(preferredDate), location].join(
    ' · '
  );
  const hasFoundYou = !!(heardFrom || referrer || voucherEntered);

  return (
    <EmailLayout preview={`${name} · ${glance}`}>
      <Eyebrow>New booking request</Eyebrow>
      <Text style={s.heading}>{name}</Text>
      <Text style={s.subheading}>{glance}</Text>

      {(referrer || verdict) && (
        <Section style={{ margin: '0 0 14px' }}>
          {referrer && <Badge tone="good">Referred by {referrer.name}</Badge>}
          {verdict && <Badge tone={verdict.tone}>Voucher: {verdict.badge}</Badge>}
          {referrer?.sameAsBooker && <Badge tone="warn">Check referrer</Badge>}
        </Section>
      )}

      {adminUrl && (
        <Section style={{ margin: '4px 0 0' }}>
          <PrimaryButton href={adminUrl}>Open in admin</PrimaryButton>
        </Section>
      )}

      {/* ── The session ─────────────────────────────────────────────────────── */}
      <SectionTitle>Session</SectionTitle>
      <DetailTable
        rows={[
          ['Package', packageName ?? 'None chosen'],
          ['Date', formatDateLong(preferredDate)],
          ['Time', preferredTime ? formatTime(preferredTime) : 'No preference'],
          ['Location', location],
          ['Spots in mind', locationIdeas]
        ]}
      />
      <PriceTable
        packageName={packageName}
        baseCents={packageBasePriceCents}
        items={modifierLineItems}
        totalCents={estimatedTotalCents}
      />

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      <SectionTitle>Contact</SectionTitle>
      <DetailTable
        rows={[
          [
            'Email',
            <Link key="email" href={`mailto:${email}`} style={s.link}>
              {email}
            </Link>
          ],
          [
            'Phone',
            phone && (
              <Link key="phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`} style={s.link}>
                {phone}
              </Link>
            )
          ]
        ]}
      />

      {notes && (
        <>
          <SectionTitle>Their notes</SectionTitle>
          <Text style={s.quote}>{notes}</Text>
        </>
      )}

      {/* ── Referral and voucher ────────────────────────────────────────────── */}
      {hasFoundYou && (
        <>
          <SectionTitle>How they found you</SectionTitle>
          {heardFrom && <DetailTable rows={[['Heard via', heardFrom]]} />}

          {referrer && (
            <Card>
              <Text style={{ ...s.value, padding: 0, margin: '0 0 4px', fontWeight: '600' }}>
                {referrer.name} sent them your way
              </Text>
              <Text style={{ ...s.value, padding: 0, margin: 0 }}>
                {referrer.contact ?? 'No contact details given.'}
              </Text>
              {referrer.sameAsBooker && (
                <Hint>Same name as the booker. Worth checking this isn’t a self-referral.</Hint>
              )}
              {referralVoucher && (
                <>
                  <Text style={{ ...s.value, padding: 0, margin: '14px 0 0' }}>
                    Their referral voucher: <Code>{referralVoucher.code}</Code>
                  </Text>
                  <Hint>
                    {[
                      referralVoucher.discountLabel && `${referralVoucher.discountLabel} off`,
                      'Pending',
                      referralVoucher.expiresOn &&
                        `expires ${formatExpiry(referralVoucher.expiresOn)}`
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    . Send it to {referrer.name.split(/\s+/)[0]} when you’re ready, then mark it
                    Active in the admin.
                  </Hint>
                </>
              )}
            </Card>
          )}

          {voucherEntered && verdict && (
            <Card>
              <Text style={{ ...s.value, padding: 0, margin: '0 0 8px', fontWeight: '600' }}>
                They entered a voucher code: <Code>{voucherEntered.entered}</Code>
              </Text>
              <Badge tone={verdict.tone}>{verdict.badge}</Badge>
              <Hint>
                {verdict.summary}
                {'holderName' in voucherEntered.check && (
                  <>
                    {' '}
                    {[
                      voucherEntered.check.holderName &&
                        `Held by ${voucherEntered.check.holderName}`,
                      voucherEntered.check.discountLabel &&
                        `${voucherEntered.check.discountLabel} off`,
                      voucherEntered.check.expiresOn &&
                        `expires ${formatExpiry(voucherEntered.check.expiresOn)}`
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    .
                  </>
                )}
                {voucherEntered.check.verdict === 'valid' &&
                  ' Take it off when you confirm the price, then mark it redeemed on this booking.'}
              </Hint>
            </Card>
          )}
        </>
      )}

      <Hint>
        Reply to this email to respond to {name.split(/\s+/)[0]} directly. Inquiry {inquiryId}.
      </Hint>
    </EmailLayout>
  );
};

BookingNotification.PreviewProps = {
  name: 'Sarah Holloway',
  email: 'sarah@example.com',
  phone: '+1 (250) 555-0198',
  location: 'Victoria',
  preferredDate: '2026-11-14',
  preferredTime: '10:00',
  packageName: 'Evryday',
  packageBasePriceCents: 15000,
  estimatedTotalCents: 22500,
  notes: 'Looking for a mix of candid and a few posed shots. My dog will be there too!',
  inquiryId: 'clz1abc2def3ghi4',
  modifierLineItems: [
    { name: 'Session length', displayValue: '60 min', priceDeltaCents: 2500 },
    { name: 'Extra photos', displayValue: '10', priceDeltaCents: 5000 }
  ],
  locationIdeas: 'The farmers market, or Beacon Hill Park',
  heardFrom: 'Friends/family',
  referrer: { name: 'Sam Patel', contact: '@sam.makes', sameAsBooker: false },
  referralVoucher: { code: 'EAC-7KQ2', discountLabel: '$15', expiresOn: '2027-12-31' },
  voucherEntered: {
    entered: 'eac-ab2c',
    check: {
      verdict: 'valid',
      code: 'EAC-AB2C',
      holderName: 'Jordan Lee',
      discountLabel: '$15',
      expiresOn: '2027-12-31'
    }
  },
  adminUrl: 'http://localhost:3001/bookings/clz1booking'
} satisfies BookingEmailData;

export default BookingNotification;
