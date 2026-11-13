import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import { ServerException } from '../exception/server.exception.js';
import type { VerifiedRefreshToken } from '../interface/verified-refresh-token.interface.js';

interface RequestWithRefreshToken {
  user?: VerifiedRefreshToken;
}

export const CurrentRefreshToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): VerifiedRefreshToken => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithRefreshToken>();

    if (!request.user) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.INVALID_REFRESH_TOKEN,
      );
    }

    return request.user;
  },
);
