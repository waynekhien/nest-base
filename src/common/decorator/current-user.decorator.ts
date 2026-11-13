import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import { ServerException } from '../exception/server.exception.js';

interface RequestWithUser {
  user?: UserResponseDto;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserResponseDto => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.UNAUTHORIZED);
    }

    return request.user;
  },
);
