import { PublicScheduleResponseSchema, type LocationWindow } from '../schemas/schedule';
import { PublicApiError, type PublicFetchOptions } from './publicGalleries';

export const fetchPublicSchedule = async (
  baseUrl: string,
  params: { from?: string; to?: string } = {},
  init?: PublicFetchOptions
): Promise<LocationWindow[]> => {
  const url = new URL('/api/public/schedule', baseUrl);
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);

  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    throw new PublicApiError('Failed to load schedule.', response.status, details);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new PublicApiError('Failed to parse schedule response.', response.status, error);
  }

  const raw = (payload as Record<string, unknown>)?.data ?? payload;
  const parsed = PublicScheduleResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new PublicApiError(
      'Schedule response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};
