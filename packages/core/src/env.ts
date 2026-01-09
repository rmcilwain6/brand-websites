import { z } from 'zod';

export const adminAuthEnvSchema = z.object({
  ADMIN_PASSWORD: z.string().min(1),
  AUTH_SECRET: z.string().min(1)
});

export const loadEnv = <T>(
  schema: z.ZodSchema<T>,
  env: Record<string, string | undefined> = process.env
): T => {
  const result = schema.safeParse(env);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    throw new Error(`Invalid environment variables: ${message}`);
  }

  return result.data;
};
