import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import type { EnvConfig } from '../../config/env.validation.js';
import { ERROR_RESPONSE } from '../constant/error-response.constant.js';
import { PRODUCTION_ENVIRONMENT } from '../constant/environment.constant.js';
import { HttpErrorResponseDto } from '../dto/http-error-response.dto.js';
import { ServerException } from '../exception/server.exception.js';
import { convertErrorToObject } from '../util/convert-error-to-object.util.js';

const FALLBACK_ERROR_CODE = 'http_error';

type HttpErrorBody = Pick<HttpErrorResponseDto, keyof HttpErrorResponseDto>;

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();

    const errorBody =
      exception instanceof HttpException
        ? this.buildHttpExceptionBody(exception)
        : this.buildUnknownErrorBody(exception);

    const responseBody: HttpErrorBody = {
      ...errorBody,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (this.isProduction()) {
      delete responseBody.details;
    }

    httpAdapter.reply(
      context.getResponse(),
      responseBody,
      responseBody.statusCode,
    );
  }

  private buildHttpExceptionBody(exception: HttpException): HttpErrorBody {
    const statusCode = exception.getStatus();
    const rawResponse = exception.getResponse();
    const responseObject: Record<string, unknown> =
      typeof rawResponse === 'object' ? { ...rawResponse } : {};

    return {
      success: false,
      statusCode,
      errorCode:
        typeof responseObject.errorCode === 'string'
          ? responseObject.errorCode
          : this.resolveErrorCodeFromStatus(statusCode),
      message: this.extractMessage(rawResponse, responseObject, exception),
      details:
        exception instanceof ServerException ? exception.details : undefined,
    };
  }

  private buildUnknownErrorBody(exception: unknown): HttpErrorBody {
    this.logger.error(
      'A non-http error was thrown',
      exception instanceof Error ? exception.stack : String(exception),
    );

    return {
      success: false,
      ...ERROR_RESPONSE.INTERNAL_SERVER_ERROR,
      details: convertErrorToObject(exception),
    };
  }

  private extractMessage(
    rawResponse: string | object,
    responseObject: Record<string, unknown>,
    exception: HttpException,
  ): string | string[] {
    if (typeof rawResponse === 'string') {
      return rawResponse;
    }

    const { message } = responseObject;

    if (typeof message === 'string') {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message;
    }

    return exception.message;
  }

  private resolveErrorCodeFromStatus(statusCode: number): string {
    const statusName: string | undefined = HttpStatus[statusCode];

    return statusName ? statusName.toLowerCase() : FALLBACK_ERROR_CODE;
  }

  private isProduction(): boolean {
    return (
      this.configService.get('NODE_ENV', { infer: true }) ===
      PRODUCTION_ENVIRONMENT
    );
  }
}
