import { PaginationMetadataResponseDto } from '../dto/pagination-response.dto.js';

export function buildPaginationMetadata(
  total: number,
  page: number,
  pageSize: number,
): PaginationMetadataResponseDto {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
