import type { ApiErrorCode, ApiResponse } from './types';

export class ApiClientError extends Error {
  code: ApiErrorCode;
  details?: unknown;
  status: number;

  constructor(code: ApiErrorCode, message: string, details: unknown, status: number) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
    this.name = 'ApiClientError';
  }
}

export const apiFetch = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  let payload: ApiResponse<T> | undefined;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      'INTERNAL',
      'Failed to parse API response.',
      undefined,
      response.status
    );
  }

  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    throw new ApiClientError(
      'INTERNAL',
      'Unexpected API response shape.',
      payload,
      response.status
    );
  }

  if (!payload.ok) {
    throw new ApiClientError(
      payload.error.code,
      payload.error.message,
      payload.error.details,
      response.status
    );
  }

  return payload.data;
};

/*
Example usage:

const health = await apiFetch<{ status: 'ok'; timestamp: string }>(
  '/api/health'
);
*/
