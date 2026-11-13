import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../common/dto/user-response.dto.js';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'JWT access token dùng cho header Authorization: Bearer <token>',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token dùng để cấp lại cặp token mới',
  })
  refreshToken: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Thông tin người dùng đã đăng nhập',
  })
  user: UserResponseDto;
}
