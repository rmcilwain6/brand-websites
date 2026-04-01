import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components';
import * as React from 'react';

// ── Design tokens (mirroring the site palette) ────────────────────────────────
export const tokens = {
  canvas: '#f7f4ef',
  sun: '#f3ede2',
  ink: '#1a1814',
  inkMuted: '#2b2b2b',
  inkFaint: '#8a7f74',
  border: '#e0d9cf',
  accent: '#F06F42'
};

const SITE_URL = 'https://evrydayarchive.co';
const FONT_STACK = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Shared wrapper ────────────────────────────────────────────────────────────

type Props = {
  preview: string;
  children: React.ReactNode;
};

export const EmailLayout = ({ preview, children }: Props) => (
  <Html lang="en">
    <Head>
      <Font
        fontFamily="Plus Jakarta Sans"
        fallbackFontFamily="sans-serif"
        webFont={{
          url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSg.woff2',
          format: 'woff2'
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Plus Jakarta Sans"
        fallbackFontFamily="sans-serif"
        webFont={{
          url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_e07NSg.woff2',
          format: 'woff2'
        }}
        fontWeight={600}
        fontStyle="normal"
      />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={{ ...styles.body, fontFamily: FONT_STACK }}>
      <Container style={styles.container}>
        {/* Header — centered stacked lockup */}
        <Section style={styles.header}>
          <Link href={SITE_URL} style={styles.logoLink}>
            <Img
              src={`${SITE_URL}/logo/stacked.svg`}
              alt="Evryday Archive"
              width={120}
              height={92}
              style={styles.logo}
            />
          </Link>
        </Section>

        {/* Content */}
        <Section style={{ ...styles.content, fontFamily: FONT_STACK }}>{children}</Section>

        {/* Footer */}
        <Section style={styles.footer}>
          <Text style={{ ...styles.footerText, fontFamily: FONT_STACK }}>
            <Link href={SITE_URL} style={styles.footerLink}>
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  body: {
    backgroundColor: tokens.canvas,
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
    padding: '40px 40px 32px',
    textAlign: 'center' as const
  },
  logoLink: {
    display: 'inline-block'
  },
  logo: {
    display: 'block',
    margin: '0 auto'
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
    textAlign: 'center' as const
  },
  footerLink: {
    color: tokens.inkFaint,
    textDecoration: 'none'
  }
} as const;
