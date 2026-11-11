import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '3f1c2a4e-8b7d-4c1a-9e0f-5a6b7c8d9e10',
    description: 'Mã định danh người dùng (UUID)',
  })
  id: string;

  @ApiProperty({ example: 'khien@example.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'Khien Nguyen', description: 'Tên hiển thị' })
  name: string;

  @ApiProperty({
    example: 'Backend developer',
    nullable: true,
    type: String,
    description: 'Mô tả ngắn về người dùng',
  })
  description: string | null;

  @ApiProperty({ example: true, description: 'Trạng thái hoạt động' })
  isActive: boolean;

  @ApiProperty({
    example: '2026-11-10T07:30:00.000Z',
    description: 'Thời điểm tạo',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-10T07:30:00.000Z',
    description: 'Thời điểm cập nhật gần nhất',
  })
  updatedAt: Date;
}
