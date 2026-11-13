import { isUUID } from 'class-validator';
import { JWT_TOKEN_TYPE } from '../constant/auth.constant.js';
import type { JwtAccessPayload } from '../interface/jwt-access-payload.interface.js';

export function isJwtAccessPayload(
  payload: unknown,
): payload is JwtAccessPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  return (
    'sub' in payload &&
    'email' in payload &&
    'tokenType' in payload &&
    typeof payload.sub === 'string' &&
    isUUID(payload.sub) &&
    typeof payload.email === 'string' &&
    payload.tokenType === JWT_TOKEN_TYPE.ACCESS
  );
}
