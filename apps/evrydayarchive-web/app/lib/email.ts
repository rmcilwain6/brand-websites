import { Resend } from 'resend';

let resendClient: Resend | null = null;

const getClient = (): Resend | null => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
};

const getNotificationEmail = (): string | null => process.env.NOTIFICATION_EMAIL ?? null;

type ContactNotificationData = {
  name: string;
  email: string;
  message?: string;
};

export const sendContactNotification = async (data: ContactNotificationData): Promise<void> => {
  const client = getClient();
  const to = getNotificationEmail();

  if (!client || !to) {
    console.warn('[email] RESEND_API_KEY or NOTIFICATION_EMAIL not set — skipping notification');
    return;
  }

  const { error } = await client.emails.send({
    from: 'noreply@evrydayarchive.co',
    to,
    subject: `New contact message from ${data.name}`,
    html: `
      <h2>New Contact Message</h2>
      <table cellpadding="6" cellspacing="0">
        <tr><td><strong>Name</strong></td><td>${data.name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
      </table>
      <p style="margin-top:16px;"><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${data.message ?? '(no message)'}</p>
    `.trim()
  });

  if (error) {
    console.error('[email] Failed to send contact notification', error);
  }
};
