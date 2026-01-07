import { HealthResponseSchema, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };

  HealthResponseSchema.parse(payload);

  return jsonOk(payload);
};
