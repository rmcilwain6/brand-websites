import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evryday Archive Co',
    short_name: 'Evryday Archive',
    description:
      'BC photographer based in Kamloops, documenting ordinary life as something worth keeping.',
    start_url: '/',
    display: 'browser',
    background_color: '#f7f4ef',
    theme_color: '#f7f4ef',
    icons: [
      {
        src: '/logo/icon.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/logo/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
}
