import { adminAuthEnvSchema, loadEnv } from '@repo/core';

const envSchema = adminAuthEnvSchema;

type AdminEnv = {
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
