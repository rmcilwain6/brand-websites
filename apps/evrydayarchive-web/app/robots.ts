import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    host: 'https://www.evrydayarchive.co',
    sitemap: 'https://www.evrydayarchive.co/sitemap.xml'
  };
}
