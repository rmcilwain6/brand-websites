import { adminAuthEnvSchema, databaseEnvSchema, loadEnv } from '@repo/core';

const envSchema = databaseEnvSchema.merge(adminAuthEnvSchema);

type AdminEnv = {
  DATABASE_URL: string;
  ADMIN_PASSWORD: string;
  AUTH_SECRET: string;
};

let cachedEnv: AdminEnv | null = null;

export const getAdminEnv = () => {
  if (!cachedEnv) {
    cachedEnv = loadEnv(envSchema) as AdminEnv;
  }

  return cachedEnv;
};
