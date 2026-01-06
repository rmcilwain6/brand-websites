import { NextResponse } from 'next/server';

import { apiErrorStatusMap } from './errors';
import type { ApiError } from './types';

export const jsonOk = <T>(data: T, init?: ResponseInit): NextResponse =>
  NextResponse.json({ ok: true, data }, init);

export const jsonError = (error: ApiError, status?: number): NextResponse => {
  const fallbackStatus = apiErrorStatusMap[error.code] ?? 500;
  return NextResponse.json(
    { ok: false, error },
    { status: status ?? fallbackStatus }
  );
};
