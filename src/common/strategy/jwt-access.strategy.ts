import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectDataSource } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import type { EnvConfig } from '../../config/env.validation.js';
import { JWT_ACCESS_STRATEGY } from '../constant/auth.constant.js';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import { User } from '../entity/user.entity.js';
import { ServerException } from '../exception/server.exception.js';
import { isJwtAccessPayload } from '../util/is-jwt-access-payload.util.js';
import { mapUserToResponseDto } from '../util/map-user-to-response.util.js';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(
    configService: ConfigService<EnvConfig, true>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(payload: unknown): Promise<UserResponseDto> {
    if (!isJwtAccessPayload(payload)) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.UNAUTHORIZED);
    }

    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: payload.sub } });

    if (!user) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_DEACTIVATED);
    }

    return mapUserToResponseDto(user);
  }
}
