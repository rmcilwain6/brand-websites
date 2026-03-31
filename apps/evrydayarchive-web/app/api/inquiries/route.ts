import { InquiryCreateSchema, jsonError, jsonOk, parseJson } from '@repo/core';

import { sendContactConfirmation, sendContactNotification } from '../../lib/email';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, InquiryCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const { name, email, message } = result.data;

  // Fire both emails concurrently; don't let a send failure block the response.
  Promise.all([
    sendContactConfirmation({ name, email }),
    sendContactNotification({ name, email, message })
  ]).catch((err) => {
    console.error('[inquiries] Email send failed', err);
  });

  return jsonOk({ received: true });
};
