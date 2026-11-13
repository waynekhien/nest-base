import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, type EntityManager, IsNull, Repository } from 'typeorm';
import { JWT_TOKEN_TYPE } from '../../common/constant/auth.constant.js';
import { ERROR_RESPONSE } from '../../common/constant/error-response.constant.js';
import { RefreshToken } from '../../common/entity/refresh-token.entity.js';
import { User } from '../../common/entity/user.entity.js';
import { ServerException } from '../../common/exception/server.exception.js';
import type { JwtAccessPayload } from '../../common/interface/jwt-access-payload.interface.js';
import type { JwtRefreshPayload } from '../../common/interface/jwt-refresh-payload.interface.js';
import type { VerifiedRefreshToken } from '../../common/interface/verified-refresh-token.interface.js';
import { hashToken } from '../../common/util/hash-token.util.js';
import { isJwtRefreshPayload } from '../../common/util/is-jwt-refresh-payload.util.js';
import { mapUserToResponseDto } from '../../common/util/map-user-to-response.util.js';
import { verifyPassword } from '../../common/util/verify-password.util.js';
import { verifyTokenHash } from '../../common/util/verify-token-hash.util.js';
import type { EnvConfig } from '../../config/env.validation.js';
import { UserService } from '../user/user.service.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto.js';

const MILLISECONDS_PER_SECOND = 1000;

interface DecodedTokenExpiry {
  exp?: unknown;
}

type RefreshTransactionOutcome =
  | { status: 'success'; tokens: RefreshTokenResponseDto }
  | { status: 'invalid' }
  | { status: 'deactivated' }
  | { status: 'reuse_detected'; userId: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig, true>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmailForAuth(loginDto.email);

    if (!user) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_CREDENTIALS,
      );
    }

    const isPasswordValid = await verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_CREDENTIALS,
      );
    }

    // Kiểm tra trạng thái khóa sau khi đã xác thực mật khẩu để tránh lộ trạng thái tài khoản
    if (!user.isActive) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_DEACTIVATED);
    }

    const tokens = await this.issueTokenPair(
      this.refreshTokenRepository.manager,
      user,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: mapUserToResponseDto(user),
    };
  }

  async refreshTokens(
    verifiedToken: VerifiedRefreshToken,
  ): Promise<RefreshTokenResponseDto> {
    const outcome = await this.executeRefreshRotation(verifiedToken);

    if (outcome.status === 'reuse_detected') {
      await this.revokeAllUserTokens(outcome.userId);
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    if (outcome.status === 'invalid') {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    if (outcome.status === 'deactivated') {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_DEACTIVATED);
    }

    return outcome.tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (payload.sub !== userId) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { id: payload.jti },
    });

    if (
      !tokenRecord ||
      tokenRecord.userId !== userId ||
      !verifyTokenHash(refreshToken, tokenRecord.tokenHash)
    ) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    if (tokenRecord.revokedAt === null) {
      tokenRecord.revokedAt = new Date();
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  private async executeRefreshRotation(
    verifiedToken: VerifiedRefreshToken,
  ): Promise<RefreshTransactionOutcome> {
    return this.dataSource.transaction(async (manager) => {
      const tokenRecord = await manager.findOne(RefreshToken, {
        where: { id: verifiedToken.tokenId },
        lock: { mode: 'pessimistic_write' },
      });

      if (
        !tokenRecord ||
        tokenRecord.userId !== verifiedToken.userId ||
        !verifyTokenHash(verifiedToken.refreshToken, tokenRecord.tokenHash)
      ) {
        return { status: 'invalid' };
      }

      if (tokenRecord.revokedAt !== null) {
        return { status: 'reuse_detected', userId: tokenRecord.userId };
      }

      if (tokenRecord.expiresAt.getTime() <= Date.now()) {
        return { status: 'invalid' };
      }

      const user = await manager.findOne(User, {
        where: { id: tokenRecord.userId },
      });

      if (!user) {
        return { status: 'invalid' };
      }

      if (!user.isActive) {
        return { status: 'deactivated' };
      }

      tokenRecord.revokedAt = new Date();
      await manager.save(RefreshToken, tokenRecord);

      const tokens = await this.issueTokenPair(manager, user);

      return { status: 'success', tokens };
    });
  }

  private async issueTokenPair(
    manager: EntityManager,
    user: User,
  ): Promise<RefreshTokenResponseDto> {
    const tokenId = randomUUID();
    const accessPayload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      tokenType: JWT_TOKEN_TYPE.ACCESS,
    };
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      jti: tokenId,
      tokenType: JWT_TOKEN_TYPE.REFRESH,
    };

    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET', {
      infer: true,
    });
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', {
      infer: true,
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    const expiresAt = this.extractTokenExpirationDate(refreshToken);
    const refreshTokenEntity = manager.create(RefreshToken, {
      id: tokenId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
      revokedAt: null,
    });
    await manager.save(RefreshToken, refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshPayload> {
    let rawPayload: unknown;

    try {
      rawPayload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        },
      );
    } catch (error: unknown) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
        { cause: error },
      );
    }

    if (!isJwtRefreshPayload(rawPayload)) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    return rawPayload;
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private extractTokenExpirationDate(token: string): Date {
    const decoded: unknown = this.jwtService.decode<DecodedTokenExpiry>(token);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('exp' in decoded) ||
      typeof decoded.exp !== 'number'
    ) {
      throw new InternalServerErrorException(
        'Failed to extract refresh token expiration',
      );
    }

    return new Date(decoded.exp * MILLISECONDS_PER_SECOND);
  }
}
