import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { ERROR_RESPONSE } from '../../common/constant/error-response.constant.js';
import { PASSWORD_SALT_ROUNDS } from '../../common/constant/user.constant.js';
import { User } from '../../common/entity/user.entity.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto.js';
import { ServerException } from '../../common/exception/server.exception.js';
import { buildPaginationMetadata } from '../../common/util/build-pagination-metadata.util.js';
import { isUniqueViolation } from '../../common/util/is-unique-violation.util.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    await this.assertEmailAvailable(createUserDto.email);

    const user = this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      description: createUserDto.description,
      isActive: createUserDto.isActive,
      password: await this.hashPassword(createUserDto.password),
    });
    const savedUser = await this.saveUser(user);

    return this.toResponseDto(savedUser);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const { page, pageSize } = paginationQuery;
    const [users, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: users.map((user) => this.toResponseDto(user)),
      meta: buildPaginationMetadata(total, page, pageSize),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);

    return this.toResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);
    const { password: newPassword, ...otherFields } = updateUserDto;

    if (otherFields.email && otherFields.email !== user.email) {
      await this.assertEmailAvailable(otherFields.email);
    }

    Object.assign(user, otherFields);

    if (newPassword) {
      user.password = await this.hashPassword(newPassword);
    }

    const savedUser = await this.saveUser(user);

    return this.toResponseDto(savedUser);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.userRepository.delete(id);

    if (!deleteResult.affected) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_NOT_FOUND);
    }
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_NOT_FOUND);
    }

    return user;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const isEmailTaken = await this.userRepository.exists({ where: { email } });

    if (isEmailTaken) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.USER_ALREADY_EXISTS,
      );
    }
  }

  private async saveUser(user: User): Promise<User> {
    try {
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw ServerException.fromErrorResponse(
          ERROR_RESPONSE.USER_ALREADY_EXISTS,
          { cause: error },
        );
      }

      throw error;
    }
  }

  private hashPassword(plainPassword: string): Promise<string> {
    return hash(plainPassword, PASSWORD_SALT_ROUNDS);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      description: user.description,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
