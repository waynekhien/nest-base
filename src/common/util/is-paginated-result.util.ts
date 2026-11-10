import { PaginationResponseDto } from '../dto/pagination-response.dto.js';

export function isPaginatedResult(
  value: unknown,
): value is PaginationResponseDto<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value &&
    Array.isArray(value.data)
  );
}
