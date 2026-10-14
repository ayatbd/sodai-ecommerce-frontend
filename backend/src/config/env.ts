import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/sodai_ecommerce'),
  JWT_SECRET: z.string().default('sodai_development_jwt_secret_key_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().default('sodai_refresh_secret_key_change_in_production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('300').transform((val) => parseInt(val, 10)),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[Config] Invalid environment configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
