export const JWT_SECRET_MIN_LENGTH = 32;
export const SHA256_HASH_LENGTH = 64;

export const JWT_ACCESS_STRATEGY = 'jwt';
export const JWT_REFRESH_STRATEGY = 'jwt-refresh';

export const JWT_TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export type JwtTokenType = (typeof JWT_TOKEN_TYPE)[keyof typeof JWT_TOKEN_TYPE];

export const JWT_EXPIRES_IN_PATTERN =
  /^\d+(\s?(years|year|yrs|yr|y|weeks|week|w|days|day|d|hours|hour|hrs|hr|h|minutes|minute|mins|min|m|seconds|second|secs|sec|s|milliseconds|millisecond|msecs|msec|ms))?$/i;
