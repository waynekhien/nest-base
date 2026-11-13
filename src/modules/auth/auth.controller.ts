import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorator/api-success-response.decorator.js';
import { CurrentRefreshToken } from '../../common/decorator/current-refresh-token.decorator.js';
import { CurrentUser } from '../../common/decorator/current-user.decorator.js';
import { Public } from '../../common/decorator/public.decorator.js';
import { HttpErrorResponseDto } from '../../common/dto/http-error-response.dto.js';
import { UserResponseDto } from '../../common/dto/user-response.dto.js';
import { JwtRefreshGuard } from '../../common/guard/jwt-refresh.guard.js';
import type { VerifiedRefreshToken } from '../../common/interface/verified-refresh-token.interface.js';
import { AuthService } from './auth.service.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  @ApiSuccessResponse(LoginResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Email hoặc mật khẩu không chính xác',
    type: HttpErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Tài khoản đã bị vô hiệu hóa',
    type: HttpErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token và refresh token' })
  @ApiSuccessResponse(RefreshTokenResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Refresh token không hợp lệ, đã hết hạn hoặc đã bị thu hồi',
    type: HttpErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Tài khoản đã bị vô hiệu hóa',
    type: HttpErrorResponseDto,
  })
  async refresh(
    @Body() _refreshTokenDto: RefreshTokenDto,
    @CurrentRefreshToken() verifiedToken: VerifiedRefreshToken,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshTokens(verifiedToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh token hiện tại' })
  @ApiNoContentResponse({ description: 'Đã thu hồi phiên đăng nhập' })
  @ApiUnauthorizedResponse({
    description: 'Access token hoặc refresh token không hợp lệ',
    type: HttpErrorResponseDto,
  })
  async logout(
    @CurrentUser() user: UserResponseDto,
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<void> {
    return this.authService.logout(user.id, refreshTokenDto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Chưa xác thực hoặc access token không hợp lệ',
    type: HttpErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Tài khoản đã bị vô hiệu hóa',
    type: HttpErrorResponseDto,
  })
  getMe(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }
}
