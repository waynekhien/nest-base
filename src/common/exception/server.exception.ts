import { HttpException } from '@nestjs/common';
import type { ErrorResponseDefinition } from '../constant/error-response.constant.js';

interface ServerExceptionOptions {
  details?: unknown;
  cause?: unknown;
}

export class ServerException extends HttpException {
  public readonly details?: unknown;

  constructor(
    errorResponse: ErrorResponseDefinition,
    options: ServerExceptionOptions = {},
  ) {
    super({ ...errorResponse }, errorResponse.statusCode, {
      cause: options.cause,
    });
    this.details = options.details;
  }

  static fromErrorResponse(
    errorResponse: ErrorResponseDefinition,
    options: ServerExceptionOptions = {},
  ): ServerException {
    return new ServerException(errorResponse, options);
  }
}
