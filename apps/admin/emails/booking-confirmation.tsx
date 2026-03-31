import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout, tokens } from './layout';

type Props = {
  name: string;
  preferredDate: string;
  preferredTime?: string;
  packageName?: string;
  estimatedTotalCents?: number;
  notes?: string;
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

export const BookingConfirmation = ({
  name,
  preferredDate,
  preferredTime,
  packageName,
  estimatedTotalCents,
  notes
}: Props) => {
  const firstName = name.split(' ')[0] ?? name;
  const dateDisplay = preferredTime ? `${preferredDate} at ${preferredTime}` : preferredDate;

  return (
    <EmailLayout preview="Booking request received — I'll be in touch soon.">
      <Text style={styles.label}>Booking request received</Text>
      <Text style={styles.heading}>Hi {firstName}.</Text>
      <Text style={styles.body}>
        Thanks for submitting a booking request. I&apos;ve received your details and I&apos;ll be in
        touch soon to confirm everything.
      </Text>

      <table style={styles.table}>
        <tbody>
          {packageName && (
            <tr>
              <td style={styles.fieldLabel}>Package</td>
              <td style={styles.fieldValue}>{packageName}</td>
            </tr>
          )}
          <tr>
            <td style={styles.fieldLabel}>Preferred date</td>
            <td style={styles.fieldValue}>{dateDisplay}</td>
          </tr>
          {estimatedTotalCents != null && (
            <tr>
              <td style={styles.fieldLabel}>Est. total</td>
              <td style={styles.fieldValue}>{formatCurrency(estimatedTotalCents)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {notes && <Text style={styles.notes}>Your notes: {notes}</Text>}

      <Text style={styles.body}>
        If anything changes or you have questions in the meantime, feel free to reply to this email.
      </Text>

      <Text style={styles.signature}>— Reed</Text>
    </EmailLayout>
  );
};

BookingConfirmation.PreviewProps = {
  name: 'Sarah Holloway',
  preferredDate: '2026-07-12',
  preferredTime: '10:00',
  packageName: 'Full Day',
  estimatedTotalCents: 95000,
  notes: 'Looking for a mix of candid and a few posed shots in the park.'
};

export default BookingConfirmation;

const styles = {
  label: {
    color: tokens.inkFaint,
    fontSize: '11px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    letterSpacing: '0.1em',
    margin: '0 0 20px',
    textTransform: 'uppercase' as const
  },
  heading: {
    color: tokens.ink,
    fontSize: '24px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '400',
    margin: '0 0 20px',
    lineHeight: '1.3'
  },
  body: {
    color: tokens.inkMuted,
    fontSize: '15px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: '1.7',
    margin: '0 0 24px'
  },
  table: {
    borderCollapse: 'collapse' as const,
    marginBottom: '24px',
    width: '100%'
  },
  fieldLabel: {
    color: tokens.inkFaint,
    fontSize: '12px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: '8px',
    paddingRight: '20px',
    verticalAlign: 'top' as const,
    whiteSpace: 'nowrap' as const,
    width: '120px'
  },
  fieldValue: {
    color: tokens.inkMuted,
    fontSize: '14px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: '8px',
    verticalAlign: 'top' as const
  },
  notes: {
    backgroundColor: tokens.canvas,
    borderLeft: `3px solid ${tokens.border}`,
    color: tokens.inkFaint,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontStyle: 'italic' as const,
    lineHeight: '1.6',
    margin: '0 0 24px',
    padding: '10px 14px'
  },
  signature: {
    color: tokens.ink,
    fontSize: '15px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: '0'
  }
} as const;
