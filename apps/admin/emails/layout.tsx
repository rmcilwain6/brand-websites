import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components';
import * as React from 'react';

export const tokens = {
  canvas: '#f7f4ef',
  sun: '#f3ede2',
  ink: '#1a1814',
  inkMuted: '#2b2b2b',
  inkFaint: '#8a7f74',
  border: '#e0d9cf',
  accent: '#F06F42'
};

type Props = {
  preview: string;
  children: React.ReactNode;
};

export const EmailLayout = ({ preview, children }: Props) => (
  <Html lang="en">
    <Head>
      <Font fontFamily="Georgia" fallbackFontFamily="serif" fontWeight={400} fontStyle="normal" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.wordmark}>Evryday Archive</Text>
        </Section>
        <Section style={styles.content}>{children}</Section>
        <Section style={styles.footer}>
          <Text style={styles.footerText}>
            <Link href="https://evrydayarchive.co" style={styles.footerLink}>
              evrydayarchive.co
            </Link>
            {'  ·  '}
            Kamloops, BC
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: {
    backgroundColor: tokens.canvas,
    fontFamily: 'Georgia, serif',
    margin: '0',
    padding: '32px 16px'
  },
  container: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.border}`,
    borderRadius: '4px',
    maxWidth: '560px',
    margin: '0 auto'
  },
  header: {
    borderBottom: `1px solid ${tokens.border}`,
    padding: '24px 40px'
  },
  wordmark: {
    color: tokens.ink,
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.08em',
    margin: '0',
    textTransform: 'uppercase' as const
  },
  content: {
    padding: '40px 40px 32px'
  },
  footer: {
    borderTop: `1px solid ${tokens.border}`,
    padding: '20px 40px'
  },
  footerText: {
    color: tokens.inkFaint,
    fontSize: '12px',
    margin: '0',
    fontFamily: 'Georgia, serif'
  },
  footerLink: {
    color: tokens.inkFaint,
    textDecoration: 'none'
  }
} as const;
