import { z } from 'zod';

import { loadEnv } from '@repo/core';

type ServerEnv = {
  ADMIN_API_BASE_URL: string;
};

type EmailEnv = {
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
};

let cachedEnv: ServerEnv | null = null;
let cachedEmailEnv: EmailEnv | null = null;

export const getServerEnv = () => {
  if (!cachedEnv) {
    const envSchema = z.object({
      ADMIN_API_BASE_URL: z.string().min(1)
    });

    cachedEnv = loadEnv(envSchema) as ServerEnv;
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
