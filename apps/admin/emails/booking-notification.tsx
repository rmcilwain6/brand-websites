import { Link, Text } from '@react-email/components';
import * as React from 'react';

import type { ModifierLineItem } from '../app/lib/email';
import { EmailLayout, tokens } from './layout';

type Props = {
  name: string;
  email: string;
  phone?: string;
  location: string;
  preferredDate: string;
  preferredTime?: string;
  packageName?: string;
  estimatedTotalCents?: number;
  notes?: string;
  inquiryId: string;
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

export const BookingNotification = ({
  name,
  email,
  phone,
  location,
  preferredDate,
  preferredTime,
  packageName,
  estimatedTotalCents,
  notes,
  inquiryId,
  modifierLineItems
}: Props) => {
  const dateDisplay = preferredTime ? `${preferredDate} at ${preferredTime}` : preferredDate;
  const hasModifiers = modifierLineItems && modifierLineItems.length > 0;

  return (
    <EmailLayout preview={`New booking request — ${packageName ?? 'no package'} — ${name}`}>
      <Text style={styles.label}>New booking request</Text>
      <Text style={styles.heading}>From {name}</Text>

      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.fieldLabel}>Name</td>
            <td style={styles.fieldValue}>{name}</td>
          </tr>
          <tr>
            <td style={styles.fieldLabel}>Email</td>
            <td style={styles.fieldValue}>
              <Link href={`mailto:${email}`} style={styles.link}>
                {email}
              </Link>
            </td>
          </tr>
          {phone && (
            <tr>
              <td style={styles.fieldLabel}>Phone</td>
              <td style={styles.fieldValue}>{phone}</td>
            </tr>
          )}
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
          <tr>
            <td style={styles.fieldLabel}>Inquiry ID</td>
            <td style={styles.fieldValue}>{inquiryId}</td>
          </tr>
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

      {notes && (
        <>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notes}>{notes}</Text>
        </>
      )}

      <Text style={styles.hint}>Reply to this email to respond directly to {name}.</Text>
    </EmailLayout>
  );
};

BookingNotification.PreviewProps = {
  name: 'Sarah Holloway',
  email: 'sarah@example.com',
  phone: '+1 (250) 555-0198',
  location: 'Vancouver',
  preferredDate: '2026-07-12',
  preferredTime: '10:00',
  packageName: 'Full Day',
  estimatedTotalCents: 85500,
  notes: 'Looking for a mix of candid and a few posed shots in the park.',
  inquiryId: 'clz1abc2def3ghi4',
  modifierLineItems: [
    { name: 'Session length', displayValue: '4 hr', priceDeltaCents: null },
    { name: 'Studio backdrop', priceDeltaCents: 7500 },
    { name: 'Rush editing', displayValue: 'Rush (7 days)', priceDeltaCents: 15000 },
    { name: 'Spring Sale (10% off)', priceDeltaCents: -10500 }
  ]
} satisfies Props;

export default BookingNotification;

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
    margin: '0 0 28px',
    lineHeight: '1.3'
  },
  table: {
    borderCollapse: 'collapse' as const,
    marginBottom: '28px',
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
  link: {
    color: tokens.accent,
    textDecoration: 'none'
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
    marginBottom: '28px',
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
  notesLabel: {
    color: tokens.inkFaint,
    fontSize: '12px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: '0 0 8px',
    letterSpacing: '0.05em'
  },
  notes: {
    backgroundColor: tokens.canvas,
    borderLeft: `3px solid ${tokens.border}`,
    color: tokens.inkMuted,
    fontSize: '14px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: '1.7',
    margin: '0 0 28px',
    padding: '12px 16px',
    whiteSpace: 'pre-wrap' as const
  },
  hint: {
    color: tokens.inkFaint,
    fontSize: '12px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: '0',
    fontStyle: 'italic' as const
  }
} as const;
