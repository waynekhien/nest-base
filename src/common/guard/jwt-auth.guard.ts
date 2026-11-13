import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JWT_ACCESS_STRATEGY } from '../constant/auth.constant.js';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import { resolvePassportUser } from '../util/resolve-passport-user.util.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser = UserResponseDto>(
    error: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    return resolvePassportUser(error, user, ERROR_RESPONSE.UNAUTHORIZED);
  }
}
