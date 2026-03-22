/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/core', '@repo/db'],
  outputFileTracingIncludes: {
    '/api/waitlist': [
      '../../node_modules/.pnpm/@prisma+client@5.18.0_prisma@5.18.0/node_modules/.prisma/client/*.node'
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@repo/db']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  }
};

export default nextConfig;
