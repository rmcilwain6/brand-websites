// Building blocks shared by the booking emails. Email clients ignore stylesheets, so every
// style is inline, and layout uses tables.

import { Button, Section, Text } from '@react-email/components';
import type { ModifierLineItem } from '@repo/core';
import * as React from 'react';

import { tokens } from '../layout';
import { formatCurrency, formatDelta } from './format';

export const FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/** Small uppercase label above a heading. */
export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text style={s.eyebrow}>{children}</Text>
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={s.sectionTitle}>{children}</Text>
);

/** Label/value rows. Rows with an empty value are left out. */
export const DetailTable = ({
  rows
}: {
  rows: [label: string, value: React.ReactNode | undefined | null | false][];
}) => (
  <table style={s.table} role="presentation">
    <tbody>
      {rows
        .filter(
          ([, value]) => value !== undefined && value !== null && value !== false && value !== ''
        )
        .map(([label, value]) => (
          <tr key={label}>
            <td style={s.label}>{label}</td>
            <td style={s.value}>{value}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

/** Numbered steps, with the text sitting right beside its number. */
export const StepList = ({ steps }: { steps: React.ReactNode[] }) => (
  <table style={s.table} role="presentation">
    <tbody>
      {steps.map((step, i) => (
        <tr key={i}>
          <td style={s.stepNumber}>{i + 1}</td>
          <td style={s.stepText}>{step}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** A tinted panel that groups related details. */
export const Card = ({ children }: { children: React.ReactNode }) => (
  <Section style={s.card}>{children}</Section>
);

export type BadgeTone = 'good' | 'warn' | 'bad' | 'muted';

const BADGE_COLOURS: Record<BadgeTone, { bg: string; fg: string }> = {
  good: { bg: '#e4efe5', fg: '#2c6236' },
  warn: { bg: '#f8ecd4', fg: '#7d520f' },
  bad: { bg: '#f8e1dc', fg: '#9a3320' },
  muted: { bg: '#ece6dd', fg: '#564e45' }
};

export const Badge = ({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) => (
  <span
    style={{
      ...s.badge,
      backgroundColor: BADGE_COLOURS[tone].bg,
      color: BADGE_COLOURS[tone].fg
    }}
  >
    {children}
  </span>
);

/** A voucher code, set apart so it's easy to read and copy. */
export const Code = ({ children }: { children: React.ReactNode }) => (
  <span style={s.code}>{children}</span>
);

/** Modifier line items with the estimated total, or the total alone when there are none. */
export const PriceTable = ({
  items,
  totalCents
}: {
  items?: ModifierLineItem[];
  totalCents?: number;
}) => {
  if (!items?.length) {
    return totalCents != null ? (
      <DetailTable rows={[['Est. total', formatCurrency(totalCents)]]} />
    ) : null;
  }
  return (
    <table style={s.table} role="presentation">
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td style={s.itemName}>
              {item.name}
              {item.displayValue && <span style={s.itemValue}> · {item.displayValue}</span>}
            </td>
            <td style={s.itemPrice}>{formatDelta(item.priceDeltaCents)}</td>
          </tr>
        ))}
        {totalCents != null && (
          <tr>
            <td style={s.totalLabel}>Estimated total</td>
            <td style={{ ...s.totalLabel, textAlign: 'right' }}>{formatCurrency(totalCents)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export const PrimaryButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button href={href} style={s.button}>
    {children}
  </Button>
);

/** Secondary explanatory text. */
export const Hint = ({ children }: { children: React.ReactNode }) => (
  <Text style={s.hint}>{children}</Text>
);

export const s = {
  eyebrow: {
    color: tokens.inkFaint,
    fontFamily: FONT,
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    margin: '0 0 12px',
    textTransform: 'uppercase' as const
  },
  heading: {
    color: tokens.ink,
    fontFamily: FONT,
    fontSize: '26px',
    fontWeight: '600',
    lineHeight: '1.25',
    margin: '0 0 6px'
  },
  subheading: {
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '15px',
    lineHeight: '1.5',
    margin: '0 0 20px'
  },
  body: {
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 24px'
  },
  sectionTitle: {
    borderTop: `1px solid ${tokens.border}`,
    color: tokens.ink,
    fontFamily: FONT,
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.06em',
    margin: '28px 0 12px',
    paddingTop: '20px',
    textTransform: 'uppercase' as const
  },
  table: {
    borderCollapse: 'collapse' as const,
    width: '100%'
  },
  label: {
    color: tokens.inkFaint,
    fontFamily: FONT,
    fontSize: '13px',
    paddingBottom: '9px',
    paddingRight: '16px',
    verticalAlign: 'top' as const,
    whiteSpace: 'nowrap' as const,
    width: '120px'
  },
  value: {
    color: tokens.ink,
    fontFamily: FONT,
    fontSize: '15px',
    lineHeight: '1.45',
    paddingBottom: '9px',
    verticalAlign: 'top' as const
  },
  stepNumber: {
    color: tokens.accent,
    fontFamily: FONT,
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: '1.6',
    paddingBottom: '10px',
    verticalAlign: 'top' as const,
    width: '24px'
  },
  stepText: {
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '15px',
    lineHeight: '1.6',
    paddingBottom: '10px',
    verticalAlign: 'top' as const
  },
  card: {
    backgroundColor: tokens.sun,
    border: `1px solid ${tokens.border}`,
    borderRadius: '8px',
    margin: '0 0 12px',
    padding: '16px 18px'
  },
  badge: {
    borderRadius: '999px',
    display: 'inline-block',
    fontFamily: FONT,
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1',
    margin: '0 6px 6px 0',
    padding: '6px 10px'
  },
  code: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.border}`,
    borderRadius: '4px',
    color: tokens.ink,
    fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '0.04em',
    padding: '2px 8px'
  },
  itemName: {
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '14px',
    paddingBottom: '8px',
    paddingRight: '16px',
    verticalAlign: 'top' as const
  },
  itemValue: {
    color: tokens.inkFaint
  },
  itemPrice: {
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '14px',
    paddingBottom: '8px',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
    whiteSpace: 'nowrap' as const
  },
  totalLabel: {
    borderTop: `1px solid ${tokens.border}`,
    color: tokens.ink,
    fontFamily: FONT,
    fontSize: '14px',
    fontWeight: '600',
    paddingTop: '10px'
  },
  button: {
    backgroundColor: tokens.accent,
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontFamily: FONT,
    fontSize: '14px',
    fontWeight: '600',
    padding: '11px 20px',
    textDecoration: 'none'
  },
  hint: {
    color: tokens.inkFaint,
    fontFamily: FONT,
    fontSize: '13px',
    lineHeight: '1.6',
    margin: '8px 0 0'
  },
  quote: {
    backgroundColor: tokens.canvas,
    borderLeft: `3px solid ${tokens.border}`,
    color: tokens.inkMuted,
    fontFamily: FONT,
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0',
    padding: '12px 16px',
    whiteSpace: 'pre-wrap' as const
  },
  link: {
    color: tokens.accent,
    textDecoration: 'none'
  }
} as const;
