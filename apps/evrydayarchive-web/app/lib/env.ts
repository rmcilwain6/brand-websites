import { z } from 'zod';

import { loadEnv } from '@repo/core';

type PublicEnv = {
  NEXT_PUBLIC_API_BASE_URL: string;
};

let cachedEnv: PublicEnv | null = null;

export const getPublicEnv = () => {
  if (!cachedEnv) {
    const envSchema = z.object({
      NEXT_PUBLIC_API_BASE_URL: z.string().min(1)
    });

    cachedEnv = loadEnv(envSchema) as PublicEnv;
  }

  return cachedEnv;
};
