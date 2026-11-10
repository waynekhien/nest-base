import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE,
  MIN_PAGE_SIZE,
} from '../constant/pagination.constant.js';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: DEFAULT_PAGE,
    default: DEFAULT_PAGE,
    minimum: MIN_PAGE,
    description: 'Số trang, bắt đầu từ 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_PAGE)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    type: Number,
    example: DEFAULT_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
    minimum: MIN_PAGE_SIZE,
    maximum: MAX_PAGE_SIZE,
    description: 'Số phần tử mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_PAGE_SIZE)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = DEFAULT_PAGE_SIZE;
}
