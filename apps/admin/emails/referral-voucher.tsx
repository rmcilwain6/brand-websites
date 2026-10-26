import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { formatDateLong } from './components/format';
import { Card, Hint, PrimaryButton, SectionTitle, StepList, s } from './components/ui';
import { EmailLayout, SITE_URL } from './layout';

export type ReferralVoucherEmailData = {
  /** Who the code is for: the voucher's current holder. */
  holderName: string;
  /** The person they referred: the name on the booking that created the voucher, if any. */
  referredName?: string;
  code: string;
  /** "$15", "15%". */
  discountLabel: string;
  /** YYYY-MM-DD, or null for no expiry. */
  expiresOn: string | null;
};

/** Sent from the admin to a referrer: a thank-you and their voucher code. */
export const ReferralVoucher = ({
  holderName,
  referredName,
  code,
  discountLabel,
  expiresOn
}: ReferralVoucherEmailData) => {
  const firstName = holderName.trim().split(/\s+/)[0];
  const referredFirstName = referredName?.trim().split(/\s+/)[0] || 'someone';

  return (
    <EmailLayout
      preview={`Thanks for sending ${referredFirstName} my way. Here’s ${discountLabel} off a session.`}
    >
      <Text style={{ ...s.heading, margin: '0 0 16px' }}>
        {firstName ? `Thank you, ${firstName}.` : 'Thank you.'}
      </Text>
      <Text style={s.body}>
        Thanks for sending {referredFirstName} my way. Word of mouth means a lot to a small business
        like mine, so here’s a little thank-you.
      </Text>

      <Card>
        <Text style={{ ...s.eyebrow, margin: '0 0 10px' }}>Your voucher</Text>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.amount}>{discountLabel} off a session</Text>
        <Hint>
          {expiresOn ? `Good until ${formatDateLong(expiresOn)}. ` : ''}One voucher per session.
        </Hint>
      </Card>

      <SectionTitle>How to use it</SectionTitle>
      <StepList
        steps={[
          'Choose a package and request a booking on my site.',
          'Enter your code in “Have a voucher code?” on the booking form.',
          'I’ll confirm it with you, and take it off your session price.'
        ]}
      />

      <Section style={{ margin: '8px 0 0' }}>
        <PrimaryButton href={`${SITE_URL}/packages`}>Book a session</PrimaryButton>
      </Section>

      <SectionTitle>Want to pass it on?</SectionTitle>
      <Text style={{ ...s.body, margin: '0 0 24px' }}>
        You’re welcome to give it to someone else. Just reply to this email and let me know who’ll
        be using it, and I’ll put it in their name.
      </Text>

      <Text style={{ ...s.body, margin: 0, color: s.heading.color }}>— Reed</Text>
    </EmailLayout>
  );
};

ReferralVoucher.PreviewProps = {
  holderName: 'Sam Patel',
  referredName: 'Sarah Holloway',
  code: 'EAC-7KQ2',
  discountLabel: '$15',
  expiresOn: '2027-12-31'
} satisfies ReferralVoucherEmailData;

export default ReferralVoucher;

const styles = {
  code: {
    color: s.heading.color,
    fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    margin: '0 0 6px'
  },
  amount: {
    ...s.body,
    fontWeight: '600',
    margin: 0
  }
} as const;
