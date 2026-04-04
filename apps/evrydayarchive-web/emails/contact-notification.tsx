import { Link, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout, tokens } from './layout';

type Props = {
  name: string;
  email: string;
  location?: string;
  message?: string;
};

export const ContactNotification = ({ name, email, location, message }: Props) => (
  <EmailLayout preview={`New message from ${name}`}>
    <Text style={styles.label}>New message</Text>
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
        {location && (
          <tr>
            <td style={styles.fieldLabel}>Location</td>
            <td style={styles.fieldValue}>{location}</td>
          </tr>
        )}
      </tbody>
    </table>

    {message && (
      <>
        <Text style={styles.messageLabel}>Message</Text>
        <Text style={styles.message}>{message}</Text>
      </>
    )}

    <Text style={styles.hint}>Reply to this email to respond directly to {name}.</Text>
  </EmailLayout>
);

ContactNotification.PreviewProps = {
  name: 'Sarah Holloway',
  email: 'sarah@example.com',
  location: 'Kamloops',
  message:
    "Hi Reed, I've been following your work for a while and I'd love to chat about doing a session this summer. We're planning a family trip to Kamloops in July — would you be available?"
};

export default ContactNotification;

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
    width: '80px'
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
  messageLabel: {
    color: tokens.inkFaint,
    fontSize: '12px',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: '0 0 8px',
    letterSpacing: '0.05em'
  },
  message: {
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
