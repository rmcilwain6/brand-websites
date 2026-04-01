import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/core'],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../')
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    if (dev) {
      // Stable path-based module IDs prevent "Cannot find module './643.js'"
      // errors during HMR when webpack recompiles and chunk IDs shift.
      config.optimization.moduleIds = 'named';
    }
    return config;
  },
  async redirects() {
    return [{ source: '/inquire', destination: '/packages', permanent: false }];
  },
  images: {
    loader: 'custom',
    loaderFile: './app/lib/cloudinary-loader.ts',
    // Gallery images max out at ~512px (50% of max-w-5xl). 1200 as ceiling
    // covers 2× retina on the widest slot; removes wasteful 1920/2048/3840 entries.
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};

export default nextConfig;
