import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { EnvConfig } from '../../config/env.validation.js';
import { JWT_REFRESH_STRATEGY } from '../constant/auth.constant.js';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import { ServerException } from '../exception/server.exception.js';
import type { VerifiedRefreshToken } from '../interface/verified-refresh-token.interface.js';
import { isJwtRefreshPayload } from '../util/is-jwt-refresh-payload.util.js';

interface RefreshTokenRequest {
  body?: {
    refreshToken?: unknown;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(configService: ConfigService<EnvConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET', { infer: true }),
      passReqToCallback: true,
    });
  }

  validate(
    request: RefreshTokenRequest,
    payload: unknown,
  ): VerifiedRefreshToken {
    const rawRefreshToken = request.body?.refreshToken;

    if (
      !isJwtRefreshPayload(payload) ||
      typeof rawRefreshToken !== 'string' ||
      rawRefreshToken.length === 0
    ) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    return {
      userId: payload.sub,
      tokenId: payload.jti,
      refreshToken: rawRefreshToken,
    };
  }
}
