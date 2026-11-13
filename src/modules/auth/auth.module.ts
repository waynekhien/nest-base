import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWT_ACCESS_STRATEGY } from '../../common/constant/auth.constant.js';
import { RefreshToken } from '../../common/entity/refresh-token.entity.js';
import { JwtAccessStrategy } from '../../common/strategy/jwt-access.strategy.js';
import { JwtRefreshStrategy } from '../../common/strategy/jwt-refresh.strategy.js';
import type { EnvConfig } from '../../config/env.validation.js';
import { UserModule } from '../user/user.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: JWT_ACCESS_STRATEGY }),
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvConfig, true>,
      ): JwtModuleOptions => ({
        secret: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
