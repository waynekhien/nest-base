import { isUUID } from 'class-validator';
import { JWT_TOKEN_TYPE } from '../constant/auth.constant.js';
import type { JwtRefreshPayload } from '../interface/jwt-refresh-payload.interface.js';

export function isJwtRefreshPayload(
  payload: unknown,
): payload is JwtRefreshPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  return (
    'sub' in payload &&
    'email' in payload &&
    'jti' in payload &&
    'tokenType' in payload &&
    typeof payload.sub === 'string' &&
    isUUID(payload.sub) &&
    typeof payload.email === 'string' &&
    typeof payload.jti === 'string' &&
    isUUID(payload.jti) &&
    payload.tokenType === JWT_TOKEN_TYPE.REFRESH
  );
}
