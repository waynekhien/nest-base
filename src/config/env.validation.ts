import type { JwtSignOptions } from '@nestjs/jwt';
import { z } from 'zod';
import {
  JWT_EXPIRES_IN_PATTERN,
  JWT_SECRET_MIN_LENGTH,
} from '../common/constant/auth.constant.js';

type JwtExpiresInString = Exclude<
  NonNullable<JwtSignOptions['expiresIn']>,
  number
>;

function isJwtExpiresInString(value: string): value is JwtExpiresInString {
  return JWT_EXPIRES_IN_PATTERN.test(value);
}

const booleanFromEnv = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((value) => value === true || value === 'true' || value === '1');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),
  DB_SYNCHRONIZE: booleanFromEnv,

  JWT_ACCESS_SECRET: z.string().min(JWT_SECRET_MIN_LENGTH),
  JWT_ACCESS_EXPIRES_IN: z.string().trim().refine(isJwtExpiresInString, {
    message:
      'JWT_ACCESS_EXPIRES_IN must be a valid duration string (e.g. "15m", "1h", "1d")',
  }),

  JWT_REFRESH_SECRET: z.string().min(JWT_SECRET_MIN_LENGTH),
  JWT_REFRESH_EXPIRES_IN: z.string().trim().refine(isJwtExpiresInString, {
    message:
      'JWT_REFRESH_EXPIRES_IN must be a valid duration string (e.g. "7d", "30d")',
  }),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const formattedErrors = z.prettifyError(parsed.error);
    throw new Error(`Invalid environment variables:\n${formattedErrors}`);
  }

  return parsed.data;
}
