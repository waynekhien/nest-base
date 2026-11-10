import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: 100 })
  total: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: PaginationMetadataResponseDto })
  meta: PaginationMetadataResponseDto;
}
