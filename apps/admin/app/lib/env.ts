import { z } from 'zod';

import { adminAuthEnvSchema, loadEnv } from '@repo/core';

type AdminEnv = {
  ADMIN_PASSWORD: string;
  AUTH_SECRET: string;
};

type EmailEnv = {
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
};

let cachedEnv: AdminEnv | null = null;
let cachedEmailEnv: EmailEnv | null = null;

export const getAdminEnv = () => {
  if (!cachedEnv) {
    cachedEnv = loadEnv(adminAuthEnvSchema) as AdminEnv;
  }

  return cachedEnv;
};

export const getEmailEnv = () => {
  if (!cachedEmailEnv) {
    const envSchema = z.object({
      RESEND_API_KEY: z.string().min(1),
      NOTIFICATION_EMAIL: z.string().email()
    });

    cachedEmailEnv = loadEnv(envSchema) as EmailEnv;
  }

  return cachedEmailEnv;
};
