import { Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout, tokens } from './layout';

type Props = {
  name: string;
};

export const ContactConfirmation = ({ name }: Props) => {
  const firstName = name.split(' ')[0] ?? name;

  return (
    <EmailLayout preview="Got your message — I'll be in touch soon.">
      <Text style={styles.label}>Message received</Text>
      <Text style={styles.heading}>Hi {firstName}.</Text>
      <Text style={styles.body}>
        Thanks for reaching out. I&apos;ve received your message and I&apos;ll be in touch soon.
      </Text>
      <Text style={styles.signature}>— Reed</Text>
    </EmailLayout>
  );
};

ContactConfirmation.PreviewProps = {
  name: 'Sarah Holloway'
};

export default ContactConfirmation;

const styles = {
  label: {
    color: tokens.inkFaint,
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.1em',
    margin: '0 0 20px',
    textTransform: 'uppercase' as const
  },
  heading: {
    color: tokens.ink,
    fontSize: '24px',
    fontFamily: 'Georgia, serif',
    fontWeight: '400',
    margin: '0 0 20px',
    lineHeight: '1.3'
  },
  body: {
    color: tokens.inkMuted,
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.7',
    margin: '0 0 32px'
  },
  signature: {
    color: tokens.ink,
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    margin: '0'
  }
} as const;
