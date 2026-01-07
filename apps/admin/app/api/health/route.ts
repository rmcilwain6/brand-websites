import { HealthResponseSchema, jsonOk } from '@repo/core';

export const GET = async (): Promise<Response> => {
  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };

  HealthResponseSchema.parse(payload);

  return jsonOk(payload);
};
