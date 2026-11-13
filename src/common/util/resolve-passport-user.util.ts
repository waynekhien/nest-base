import { HttpException } from '@nestjs/common';
import type { ErrorResponseDefinition } from '../constant/error-response.constant.js';
import { ServerException } from '../exception/server.exception.js';

export function resolvePassportUser<TUser>(
  error: unknown,
  user: TUser | false | null | undefined,
  fallbackError: ErrorResponseDefinition,
): TUser {
  if (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw ServerException.fromErrorResponse(fallbackError, { cause: error });
  }

  if (user === false || user === null || user === undefined) {
    throw ServerException.fromErrorResponse(fallbackError);
  }

  return user;
}
