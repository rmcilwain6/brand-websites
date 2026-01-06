import { InquiryCreateSchema, jsonError, jsonOk, parseJson } from '@repo/core';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, InquiryCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  return jsonOk({ received: true });
};
