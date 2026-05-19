import type { MetadataRoute } from 'next';

import { fetchPublicGalleries } from '@repo/core';

import { getServerEnv } from './lib/env';

const BASE_URL = 'https://www.evrydayarchive.co';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/portfolio`, priority: 0.9, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/packages`, priority: 0.8, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/package-builder`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/inquire`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/process`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/faq`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/contact`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: 'monthly' }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let gallerySlugs: string[] = [];

  try {
    const { ADMIN_API_BASE_URL } = getServerEnv();
    const galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, {
      next: { revalidate: 3600 }
    });
    gallerySlugs = galleries.map((g) => g.slug);
  } catch {
    // Sitemap still returns static routes if the API is unavailable
  }

  const galleryRoutes: MetadataRoute.Sitemap = gallerySlugs.map((slug) => ({
    url: `${BASE_URL}/portfolio/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const
  }));

  return [...staticRoutes, ...galleryRoutes];
}
