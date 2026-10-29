/**
 * A shareable picture of a voucher, for sending a code by text or Instagram DM where the
 * thank-you email can't go. Built as a self-contained SVG (fonts and logo embedded) that the
 * browser turns into a PNG. 1080×1350 (4:5) fills a phone screen and an Instagram DM.
 * Colours and type follow the site and the emails.
 */

export const VOUCHER_IMAGE_WIDTH = 1080;
export const VOUCHER_IMAGE_HEIGHT = 1350;

/** Files in /public/voucher-image, embedded into the SVG as base64. */
export const VOUCHER_IMAGE_ASSETS = {
  sans400: '/voucher-image/plus-jakarta-sans-latin-400-normal.woff',
  sans700: '/voucher-image/plus-jakarta-sans-latin-700-normal.woff',
  mono600: '/voucher-image/jetbrains-mono-latin-600-normal.woff',
  logo: '/voucher-image/logo-stacked.svg'
} as const;

export type VoucherImageAssets = Record<keyof typeof VOUCHER_IMAGE_ASSETS, string>;

export type VoucherImageData = {
  code: string;
  /** "$15", "15%". */
  discountLabel: string;
  /** "December 31, 2027", or null for no expiry. */
  expiresLabel: string | null;
  /** Who it's for, if known. Only the first name is shown. */
  holderName: string | null;
  /** A referral thank-you, or a voucher given by hand. */
  isReferral: boolean;
};

const colors = {
  canvas: '#f7f4ef',
  sun: '#f3ede2',
  ink: '#1a1814',
  inkFaint: '#6b6259',
  border: '#e0d9cf',
  /** The ticket's dashed edge, a step darker than border so it reads at phone size. */
  dash: '#cbbfae',
  accent: '#F06F42'
};

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;'
  );

/** First name, capped so a long one can't run off the card. */
const firstName = (name: string | null) => {
  const first = name?.trim().split(/\s+/)[0];
  if (!first) return null;
  return first.length > 16 ? `${first.slice(0, 15)}…` : first;
};

/** The headline and the line(s) under it. */
export const voucherImageCopy = (data: VoucherImageData) => {
  const name = firstName(data.holderName);
  if (data.isReferral) {
    return {
      headline: name ? `Thank you, ${name}.` : 'Thank you.',
      sublines: ['Thanks for sending someone my way.', 'Here’s a little thank-you.']
    };
  }
  return {
    headline: name ? `For ${name}.` : 'A little something for you.',
    sublines: ['Here’s a voucher toward a session.']
  };
};

export const buildVoucherSvg = (data: VoucherImageData, assets: VoucherImageAssets): string => {
  const W = VOUCHER_IMAGE_WIDTH;
  const H = VOUCHER_IMAGE_HEIGHT;
  const cx = W / 2;
  const { headline, sublines } = voucherImageCopy(data);
  const footnote = data.expiresLabel
    ? `Good until ${data.expiresLabel} · One per session`
    : 'One per session';

  const text = (y: number, size: number, content: string, attrs = '') =>
    `<text x="${cx}" y="${y}" font-size="${size}" text-anchor="middle" ${attrs}>${content}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
@font-face { font-family: 'EA Sans'; font-weight: 400; src: url(data:font/woff;base64,${assets.sans400}) format('woff'); }
@font-face { font-family: 'EA Sans'; font-weight: 700; src: url(data:font/woff;base64,${assets.sans700}) format('woff'); }
@font-face { font-family: 'EA Mono'; font-weight: 600; src: url(data:font/woff;base64,${assets.mono600}) format('woff'); }
text { font-family: 'EA Sans', sans-serif; fill: ${colors.ink}; }
.faint { fill: ${colors.inkFaint}; }
</style>
<rect width="${W}" height="${H}" fill="${colors.canvas}"/>
<rect x="64" y="64" width="${W - 128}" height="${H - 128}" rx="28" fill="#ffffff" stroke="${colors.border}" stroke-width="2"/>
<image x="${cx - 99}" y="136" width="198" height="151" href="data:image/svg+xml;base64,${assets.logo}" xlink:href="data:image/svg+xml;base64,${assets.logo}"/>
${text(390, 60, escapeXml(headline), 'font-weight="700" letter-spacing="-1"')}
${sublines.map((line, i) => text(450 + i * 44, 30, escapeXml(line), 'class="faint"')).join('\n')}
<rect x="136" y="560" width="${W - 272}" height="540" rx="24" fill="${colors.sun}" stroke="${colors.dash}" stroke-width="3" stroke-dasharray="14 10"/>
${text(630, 24, 'YOUR VOUCHER', `font-weight="700" letter-spacing="4" fill="${colors.accent}" style="fill:${colors.accent}"`)}
${text(745, 96, `${escapeXml(data.discountLabel)} off`, 'font-weight="700" letter-spacing="-2"')}
${text(797, 32, 'a photo session', 'class="faint"')}
<rect x="230" y="840" width="${W - 460}" height="128" rx="16" fill="#ffffff" stroke="${colors.border}" stroke-width="2"/>
${text(934, 84, escapeXml(data.code), `font-weight="600" letter-spacing="6" style="font-family:'EA Mono', monospace"`)}
${text(1040, 26, escapeXml(footnote), 'class="faint"')}
<text x="${cx}" y="1192" font-size="28" text-anchor="middle" class="faint">Book at <tspan font-weight="700" style="fill:${colors.ink}">evrydayarchive.co</tspan></text>
${text(1236, 28, 'and enter your code on the booking form.', 'class="faint"')}
</svg>`;
};
