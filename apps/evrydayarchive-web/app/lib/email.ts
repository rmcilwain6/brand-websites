import { render } from '@react-email/render';
import { Resend } from 'resend';

import { ContactConfirmation } from '../../emails/contact-confirmation';
import { ContactNotification } from '../../emails/contact-notification';
import { getEmailEnv } from './env';

const FROM = 'Reed from Evryday Archive Co <reed@evrydayarchive.co>';

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    resend = new Resend(getEmailEnv().RESEND_API_KEY);
  }
  return resend;
};

// ── Contact: confirmation to the sender ───────────────────────────────────────

export const sendContactConfirmation = async ({ name, email }: { name: string; email: string }) => {
  const html = await render(ContactConfirmation({ name }));

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Got your message \u2014 I'll be in touch",
    html
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
  const html = await render(ContactNotification({ name, email, message }));

  await getResend().emails.send({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    replyTo: email,
    subject: `Got your message, ${name} \u2014 I'll be in touch`,
    html
  });
};
