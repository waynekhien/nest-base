import type { JWT_TOKEN_TYPE } from '../constant/auth.constant.js';

export interface JwtAccessPayload {
  sub: string;
  email: string;
  tokenType: typeof JWT_TOKEN_TYPE.ACCESS;
}
