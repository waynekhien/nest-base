import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetadataResponseDto } from '../dto/pagination-response.dto.js';
import { SuccessResponseDto } from '../dto/success-response.dto.js';

export function ApiSuccessResponse(
  model: Type<unknown>,
  status: HttpStatus = HttpStatus.OK,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, model),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  );
}

export function ApiPaginatedResponse(
  model: Type<unknown>,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, PaginationMetadataResponseDto, model),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
              meta: { $ref: getSchemaPath(PaginationMetadataResponseDto) },
            },
          },
        ],
      },
    }),
  );
}
