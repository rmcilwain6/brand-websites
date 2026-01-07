import type { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from '../api/types';

export const readJson = async <T = unknown>(res: Response): Promise<T> => (await res.json()) as T;

export const isApiError = <T>(payload: ApiResponse<T>): payload is ApiErrorResponse =>
  payload.ok === false;

export const isApiSuccess = <T>(payload: ApiResponse<T>): payload is ApiSuccessResponse<T> =>
  payload.ok === true;
