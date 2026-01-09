import { PrismaClient } from '@prisma/client';

import { getDbEnv } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const { DATABASE_URL } = getDbEnv();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
