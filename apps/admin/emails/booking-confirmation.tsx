import { Text } from '@react-email/components';
import * as React from 'react';

import type { ModifierLineItem } from '../app/lib/email';
import { EmailLayout, tokens } from './layout';

type Props = {
  name: string;
  location: string;
  preferredDate: string;
  preferredTime?: string;
  packageName?: string;
  estimatedTotalCents?: number;
  notes?: string;
  modifierLineItems?: ModifierLineItem[];
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const formatDelta = (cents: number | null): string => {
  if (cents === null || cents === 0) return 'Included';
  if (cents > 0) return `+${formatCurrency(cents)}`;
  return `−${formatCurrency(Math.abs(cents))}`;
};

export const BookingConfirmation = ({
  name,
  location,
  preferredDate,
  preferredTime,
  packageName,
  estimatedTotalCents,
  notes,
  modifierLineItems
}: Props) => {
  const firstName = name.split(' ')[0] ?? name;
  const dateDisplay = preferredTime ? `${preferredDate} at ${preferredTime}` : preferredDate;
  const hasModifiers = modifierLineItems && modifierLineItems.length > 0;

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
            <td style={styles.fieldLabel}>Location</td>
            <td style={styles.fieldValue}>{location}</td>
          </tr>
          <tr>
            <td style={styles.fieldLabel}>Preferred date</td>
            <td style={styles.fieldValue}>{dateDisplay}</td>
          </tr>
          {!hasModifiers && estimatedTotalCents != null && (
            <tr>
              <td style={styles.fieldLabel}>Est. total</td>
              <td style={styles.fieldValue}>{formatCurrency(estimatedTotalCents)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {hasModifiers && (
        <>
          <Text style={styles.sectionLabel}>Package modifiers</Text>
          <table style={styles.modifierTable}>
            <tbody>
              {modifierLineItems!.map((item, i) => (
                <tr key={i}>
                  <td style={styles.modifierName}>{item.name}</td>
                  <td style={styles.modifierValue}>{item.displayValue ?? ''}</td>
                  <td style={styles.modifierPrice}>{formatDelta(item.priceDeltaCents)}</td>
                </tr>
              ))}
              {estimatedTotalCents != null && (
                <tr>
                  <td colSpan={2} style={styles.totalLabel}>
                    Estimated total
                  </td>
                  <td style={styles.totalPrice}>{formatCurrency(estimatedTotalCents)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

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
  location: 'Vancouver',
  preferredDate: '2026-07-12',
  preferredTime: '10:00',
  packageName: 'Full Day',
  estimatedTotalCents: 85500,
  notes: 'Looking for a mix of candid and a few posed shots in the park.',
  modifierLineItems: [
    { name: 'Session length', displayValue: '4 hr', priceDeltaCents: null },
    { name: 'Studio backdrop', priceDeltaCents: 7500 },
    { name: 'Rush editing', displayValue: 'Rush (7 days)', priceDeltaCents: 15000 },
    { name: 'Spring Sale (10% off)', priceDeltaCents: -10500 }
  ]
} satisfies Props;

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
  sectionLabel: {
    color: tokens.inkFaint,
    fontSize: '11px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    letterSpacing: '0.08em',
    margin: '0 0 12px',
    textTransform: 'uppercase' as const
  },
  modifierTable: {
    borderCollapse: 'collapse' as const,
    marginBottom: '24px',
    width: '100%'
  },
  modifierName: {
    color: tokens.inkMuted,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: '7px',
    paddingRight: '16px',
    verticalAlign: 'top' as const
  },
  modifierValue: {
    color: tokens.inkFaint,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: '7px',
    paddingRight: '16px',
    verticalAlign: 'top' as const,
    width: '100px'
  },
  modifierPrice: {
    color: tokens.inkMuted,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: '7px',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
    whiteSpace: 'nowrap' as const
  },
  totalLabel: {
    borderTop: `1px solid ${tokens.border}`,
    color: tokens.ink,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '600',
    paddingTop: '10px'
  },
  totalPrice: {
    borderTop: `1px solid ${tokens.border}`,
    color: tokens.ink,
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '600',
    paddingTop: '10px',
    textAlign: 'right' as const,
    whiteSpace: 'nowrap' as const
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
