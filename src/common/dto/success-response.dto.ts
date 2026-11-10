import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_SUCCESS_MESSAGE } from '../constant/response.constant.js';
import { PaginationMetadataResponseDto } from './pagination-response.dto.js';

export class SuccessResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: DEFAULT_SUCCESS_MESSAGE })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: PaginationMetadataResponseDto })
  meta?: PaginationMetadataResponseDto;
}
