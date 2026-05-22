import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
