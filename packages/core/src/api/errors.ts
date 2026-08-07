import type { ApiError, ApiErrorCode } from './types';

export const apiErrorStatusMap: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500
};

export const createApiError = (
  code: ApiErrorCode,
  message: string,
  details?: unknown
): ApiError => ({
  code,
  message,
  details
});
