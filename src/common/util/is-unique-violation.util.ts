import { QueryFailedError } from 'typeorm';
import { POSTGRES_UNIQUE_VIOLATION_CODE } from '../constant/database-error.constant.js';

export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === POSTGRES_UNIQUE_VIOLATION_CODE
  );
}
