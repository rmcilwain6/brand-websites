import { Resend } from 'resend';

import { getEmailEnv } from './env';

const FROM = 'Evryday Archive <reed@evrydayarchive.co>';

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    resend = new Resend(getEmailEnv().RESEND_API_KEY);
  }
  return resend;
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

type BookingEmailData = {
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  preferredTime?: string;
  packageName?: string;
  estimatedTotalCents?: number;
  notes?: string;
  inquiryId: string;
};

// ── Booking: confirmation to the client ──────────────────────────────────────

export const sendBookingConfirmation = async (data: BookingEmailData) => {
  const firstName = data.name.split(' ')[0] ?? data.name;

  const detailRows = [
    data.packageName &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Package</td><td>${data.packageName}</td></tr>`,
    `<tr><td style="color:#888;padding:4px 12px 4px 0;">Preferred date</td><td>${data.preferredDate}${data.preferredTime ? ` at ${data.preferredTime}` : ''}</td></tr>`,
    data.estimatedTotalCents != null &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Estimated total</td><td>${formatCurrency(data.estimatedTotalCents)}</td></tr>`
  ]
    .filter(Boolean)
    .join('');

  await getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Booking request received — I'll be in touch soon",
    html: `
      <p>Hi ${firstName},</p>
      <p>Thanks for submitting a booking request. I've received your details and I'll be in touch soon to confirm everything.</p>
      <table style="margin:24px 0;border-collapse:collapse;">
        ${detailRows}
      </table>
      ${data.notes ? `<p style="color:#888;font-size:13px;">Your notes: <em>${data.notes}</em></p>` : ''}
      <p>— Reed</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">
        Evryday Archive · <a href="https://evrydayarchive.co" style="color:#888;">evrydayarchive.co</a>
      </p>
    `
  });
};

// ── Booking: notification to Reed ────────────────────────────────────────────

export const sendBookingNotification = async (data: BookingEmailData) => {
  const { NOTIFICATION_EMAIL } = getEmailEnv();

  const rows = [
    `<tr><td style="color:#888;padding:4px 12px 4px 0;">Name</td><td><a href="mailto:${data.email}">${data.name}</a></td></tr>`,
    `<tr><td style="color:#888;padding:4px 12px 4px 0;">Email</td><td>${data.email}</td></tr>`,
    data.phone &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Phone</td><td>${data.phone}</td></tr>`,
    data.packageName &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Package</td><td>${data.packageName}</td></tr>`,
    `<tr><td style="color:#888;padding:4px 12px 4px 0;">Preferred date</td><td>${data.preferredDate}${data.preferredTime ? ` at ${data.preferredTime}` : ''}</td></tr>`,
    data.estimatedTotalCents != null &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Estimated total</td><td>${formatCurrency(data.estimatedTotalCents)}</td></tr>`,
    data.notes &&
      `<tr><td style="color:#888;padding:4px 12px 4px 0;">Notes</td><td style="white-space:pre-wrap;">${data.notes}</td></tr>`,
    `<tr><td style="color:#888;padding:4px 12px 4px 0;">Inquiry ID</td><td>${data.inquiryId}</td></tr>`
  ]
    .filter(Boolean)
    .join('');

  await getResend().emails.send({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    replyTo: data.email,
    subject: `New booking request — ${data.packageName ?? 'no package'} — ${data.name}`,
    html: `
      <p>New booking request submitted.</p>
      <table style="margin:16px 0;border-collapse:collapse;">
        ${rows}
      </table>
      <p style="color:#888;font-size:12px;">Reply to this email to respond directly to ${data.name}.</p>
    `
  });
};
