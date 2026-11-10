export enum ServerExceptionType {
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  RESOURCE_FORBIDDEN = 'resource_forbidden',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  REQUEST_PAYLOAD_VALIDATION_ERROR = 'request_payload_validation_error',
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_EXISTS = 'user_already_exists',
  USER_DEACTIVATED = 'user_deactivated',
}
