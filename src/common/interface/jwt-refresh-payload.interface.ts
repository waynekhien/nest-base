import type { JWT_TOKEN_TYPE } from '../constant/auth.constant.js';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  jti: string;
  tokenType: typeof JWT_TOKEN_TYPE.REFRESH;
}
