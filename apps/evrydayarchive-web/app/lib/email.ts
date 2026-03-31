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

// ── Contact: confirmation to the sender ───────────────────────────────────────

export const sendContactConfirmation = async ({ name, email }: { name: string; email: string }) => {
  const firstName = name.split(' ')[0] ?? name;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Got your message \u2014 I'll be in touch",
    html: `
      <p>Hi ${firstName},</p>
      <p>Thanks for reaching out. I've received your message and I'll be in touch soon.</p>
      <p>— Reed</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">
        Evryday Archive · <a href="https://evrydayarchive.co" style="color:#888;">evrydayarchive.co</a>
      </p>
    `
  });
};

// ── Contact: notification to Reed ────────────────────────────────────────────

export const sendContactNotification = async ({
  name,
  email,
  message
}: {
  name: string;
  email: string;
  message?: string;
}) => {
  const { NOTIFICATION_EMAIL } = getEmailEnv();

  await getResend().emails.send({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    replyTo: email,
    subject: `New message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${message ? `<p><strong>Message:</strong></p><p style="white-space:pre-wrap;">${message}</p>` : ''}
    `
  });
};
