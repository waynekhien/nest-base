import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_SUCCESS_MESSAGE } from '../constant/response.constant.js';
import { RAW_RESPONSE_KEY } from '../decorator/raw-response.decorator.js';
import { SuccessResponseDto } from '../dto/success-response.dto.js';
import { isPaginatedResult } from '../util/is-paginated-result.util.js';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRawResponse = this.reflector.getAllAndOverride<boolean | undefined>(
      RAW_RESPONSE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isRawResponse) {
      return next.handle();
    }

    return next.handle().pipe(map((body: unknown) => this.wrapBody(body)));
  }

  private wrapBody(body: unknown): SuccessResponseDto {
    if (isPaginatedResult(body)) {
      return {
        success: true,
        message: DEFAULT_SUCCESS_MESSAGE,
        data: body.data,
        meta: body.meta,
      };
    }

    return {
      success: true,
      message: DEFAULT_SUCCESS_MESSAGE,
      data: body,
    };
  }
}
