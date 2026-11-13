import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY } from '../constant/auth.constant.js';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import type { VerifiedRefreshToken } from '../interface/verified-refresh-token.interface.js';
import { resolvePassportUser } from '../util/resolve-passport-user.util.js';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY) {
  override handleRequest<TUser = VerifiedRefreshToken>(
    error: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    return resolvePassportUser(
      error,
      user,
      ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
    );
  }
}
