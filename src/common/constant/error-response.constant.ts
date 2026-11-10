import { HttpStatus } from '@nestjs/common';
import { ServerExceptionType } from '../enum/server-exception-type.enum.js';

export interface ErrorResponseDefinition {
  statusCode: number;
  errorCode: ServerExceptionType;
  message: string;
}

export const ERROR_RESPONSE = {
  // General
  INTERNAL_SERVER_ERROR: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ServerExceptionType.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
  },
  BAD_REQUEST: {
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ServerExceptionType.BAD_REQUEST,
    message: 'Bad Request',
  },
  UNAUTHORIZED: {
    statusCode: HttpStatus.UNAUTHORIZED,
    errorCode: ServerExceptionType.UNAUTHORIZED,
    message: 'Authentication required',
  },
  RESOURCE_FORBIDDEN: {
    statusCode: HttpStatus.FORBIDDEN,
    errorCode: ServerExceptionType.RESOURCE_FORBIDDEN,
    message: 'Access denied',
  },
  RESOURCE_NOT_FOUND: {
    statusCode: HttpStatus.NOT_FOUND,
    errorCode: ServerExceptionType.RESOURCE_NOT_FOUND,
    message: 'Resource not found',
  },
  SERVICE_UNAVAILABLE: {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    errorCode: ServerExceptionType.SERVICE_UNAVAILABLE,
    message: 'Service unavailable',
  },
  REQUEST_PAYLOAD_VALIDATION_ERROR: {
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    errorCode: ServerExceptionType.REQUEST_PAYLOAD_VALIDATION_ERROR,
    message: 'Invalid request payload data',
  },
  // Authentication & User
  INVALID_CREDENTIALS: {
    statusCode: HttpStatus.UNAUTHORIZED,
    errorCode: ServerExceptionType.INVALID_CREDENTIALS,
    message:
      'Incorrect username or password. Please check your credentials and try again',
  },
  USER_NOT_FOUND: {
    statusCode: HttpStatus.NOT_FOUND,
    errorCode: ServerExceptionType.USER_NOT_FOUND,
    message: 'User not found',
  },
  USER_ALREADY_EXISTS: {
    statusCode: HttpStatus.CONFLICT,
    errorCode: ServerExceptionType.USER_ALREADY_EXISTS,
    message: 'Unable to create account with provided credentials',
  },
  USER_DEACTIVATED: {
    statusCode: HttpStatus.FORBIDDEN,
    errorCode: ServerExceptionType.USER_DEACTIVATED,
    message: 'Account access denied',
  },
} as const satisfies Record<string, ErrorResponseDefinition>;
