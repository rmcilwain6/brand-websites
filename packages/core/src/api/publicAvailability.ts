import { PublicAvailabilityResponseSchema, type TimeSlot } from '../schemas/availability';
import { PublicApiError, type PublicFetchOptions } from './publicGalleries';

export const fetchPublicAvailability = async (
  baseUrl: string,
  params: { from?: string; to?: string } = {},
  init?: PublicFetchOptions
): Promise<TimeSlot[]> => {
  const url = new URL('/api/public/availability', baseUrl);
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);

  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    throw new PublicApiError('Failed to load availability.', response.status, details);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new PublicApiError('Failed to parse availability response.', response.status, error);
  }

  // Admin wraps responses in { ok: true, data: [...] } envelope
  const raw = (payload as Record<string, unknown>)?.data ?? payload;
  const parsed = PublicAvailabilityResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new PublicApiError(
      'Availability response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};
