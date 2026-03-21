import { InquiryCreateSchema, jsonError, jsonOk, parseJson } from '@repo/core';

import { sendContactNotification } from '../../lib/email';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, InquiryCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const { name, email, message } = result.data;

  await sendContactNotification({ name, email, message });

  return jsonOk({ received: true });
};
