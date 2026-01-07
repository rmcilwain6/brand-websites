import { databaseEnvSchema, loadEnv } from '@repo/core';

type PublicEnv = {
  DATABASE_URL: string;
};

let cachedEnv: PublicEnv | null = null;

export const getPublicEnv = () => {
  if (!cachedEnv) {
    cachedEnv = loadEnv(databaseEnvSchema) as PublicEnv;
  }

  return cachedEnv;
};
