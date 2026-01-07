import { apiErrorStatusMap } from './errors';
import type { ApiError } from './types';

export const jsonOk = <T>(data: T, init?: ResponseInit): Response =>
  Response.json({ ok: true, data }, init);

export const jsonError = (error: ApiError, status?: number): Response => {
  const fallbackStatus = apiErrorStatusMap[error.code] ?? 500;
  return Response.json({ ok: false, error }, { status: status ?? fallbackStatus });
};
