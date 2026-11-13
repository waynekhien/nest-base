import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Refresh token được cấp khi đăng nhập hoặc lần làm mới gần nhất',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
