import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    host: 'https://evrydayarchive.co',
    sitemap: 'https://evrydayarchive.co/sitemap.xml'
  };
}
