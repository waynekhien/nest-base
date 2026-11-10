import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Luôn là false với response lỗi',
  })
  success: boolean;

  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'user_not_found',
    description: 'Mã lỗi để client xử lý theo nghiệp vụ',
  })
  errorCode: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'User not found',
    description: 'Thông điệp lỗi',
  })
  message: string | string[];

  @ApiPropertyOptional({
    example: '2026-11-10T08:00:00.000Z',
    description: 'Thời điểm xảy ra lỗi theo chuẩn ISO 8601',
  })
  timestamp?: string;

  @ApiPropertyOptional({
    example: '/users/3f1c2a4e-8b7d-4c1a-9e0f-5a6b7c8d9e10',
    description: 'Đường dẫn request gây ra lỗi',
  })
  path?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Chi tiết lỗi, chỉ trả về ở môi trường không phải production',
  })
  details?: unknown;
}
