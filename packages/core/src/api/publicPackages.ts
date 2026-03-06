import { PublicPackageListResponseSchema, type PublicPackage } from '../schemas/public-packages';
import { PublicApiError, type PublicFetchOptions } from './publicGalleries';

export const fetchPublicPackages = async (
  baseUrl: string,
  init?: PublicFetchOptions
): Promise<PublicPackage[]> => {
  const url = new URL('/api/public/packages', baseUrl);
  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    throw new PublicApiError('Failed to load packages.', response.status, details);
  }

  const payload = await response.json();
  const parsed = PublicPackageListResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new PublicApiError(
      'Package list response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};
