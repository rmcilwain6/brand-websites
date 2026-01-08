import { z } from 'zod';

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().min(1)
});

type DbEnv = z.infer<typeof dbEnvSchema>;

let cachedEnv: DbEnv | null = null;

export const getDbEnv = (): DbEnv => {
  if (!cachedEnv) {
    cachedEnv = dbEnvSchema.parse(process.env);
  }

  return cachedEnv;
};
