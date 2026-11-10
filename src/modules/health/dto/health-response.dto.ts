import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Trạng thái tổng thể của hệ thống',
  })
  status: 'ok';

  @ApiProperty({
    example: '2026-11-10T10:20:00.000Z',
    description: 'Thời điểm phản hồi hiện tại theo chuẩn ISO 8601',
  })
  timestamp: string;

  @ApiProperty({
    example: 15.42,
    description: 'Thời gian tiến trình server đã hoạt động (tính bằng giây)',
  })
  uptime: number;

  @ApiProperty({
    example: 'development',
    enum: ['development', 'production', 'test'],
    description: 'Môi trường thực thi hiện tại',
  })
  environment: string;

  @ApiProperty({
    example: 'up',
    enum: ['up'],
    description: 'Trạng thái kết nối PostgreSQL qua TypeORM',
  })
  database: 'up';
}
