import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../../common/constant/user.constant.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'khien@example.com',
    description: 'Email đăng nhập, không phân biệt hoa thường và là duy nhất',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiProperty({ example: 'Khien Nguyen', description: 'Tên hiển thị' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Mật khẩu gốc, sẽ được hash bằng bcrypt trước khi lưu',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @ApiPropertyOptional({
    example: 'Backend developer',
    description: 'Mô tả ngắn về người dùng',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Trạng thái hoạt động của tài khoản',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
