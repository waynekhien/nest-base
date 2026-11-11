import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  ApiSuccessResponse,
} from '../../common/decorator/api-success-response.decorator.js';
import { HttpErrorResponseDto } from '../../common/dto/http-error-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto.js';
import { UserResponseDto } from '../../common/dto/user-response.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiSuccessResponse(UserResponseDto, HttpStatus.CREATED)
  @ApiConflictResponse({
    description: 'Email đã được sử dụng',
    type: HttpErrorResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng (có phân trang)' })
  @ApiPaginatedResponse(UserResponseDto)
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.userService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một người dùng' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng',
    type: HttpErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật người dùng' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng',
    type: HttpErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email đã được sử dụng',
    type: HttpErrorResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiNoContentResponse({ description: 'Đã xóa người dùng' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng',
    type: HttpErrorResponseDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
