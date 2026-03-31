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
  images: {
    loader: 'custom',
    loaderFile: './app/lib/cloudinary-loader.ts'
  }
};

export default nextConfig;
