import { z } from 'zod';

import { loadEnv } from '@repo/core';

type ServerEnv = {
  ADMIN_API_BASE_URL: string;
};

let cachedEnv: ServerEnv | null = null;

export const getServerEnv = () => {
  if (!cachedEnv) {
    const envSchema = z.object({
      ADMIN_API_BASE_URL: z.string().min(1)
    });

    cachedEnv = loadEnv(envSchema) as ServerEnv;
  }

  return cachedEnv;
};
