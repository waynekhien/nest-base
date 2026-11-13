import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERROR_RESPONSE } from '../../common/constant/error-response.constant.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto.js';
import { UserResponseDto } from '../../common/dto/user-response.dto.js';
import { User } from '../../common/entity/user.entity.js';
import { ServerException } from '../../common/exception/server.exception.js';
import { buildPaginationMetadata } from '../../common/util/build-pagination-metadata.util.js';
import { hashPassword } from '../../common/util/hash-password.util.js';
import { isUniqueViolation } from '../../common/util/is-unique-violation.util.js';
import { mapUserToResponseDto } from '../../common/util/map-user-to-response.util.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

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
      password: await hashPassword(createUserDto.password),
    });
    const savedUser = await this.saveUser(user);

    return mapUserToResponseDto(savedUser);
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
      data: users.map(mapUserToResponseDto),
      meta: buildPaginationMetadata(total, page, pageSize),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);

    return mapUserToResponseDto(user);
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
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
      user.password = await hashPassword(newPassword);
    }

    const savedUser = await this.saveUser(user);

    return mapUserToResponseDto(savedUser);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.userRepository.delete(id);

    if (!deleteResult.affected) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_NOT_FOUND);
    }
  }

  async assertEmailAvailable(email: string): Promise<void> {
    const isEmailTaken = await this.userRepository.exists({ where: { email } });

    if (isEmailTaken) {
      throw ServerException.fromErrorResponse(
        ERROR_RESPONSE.USER_ALREADY_EXISTS,
      );
    }
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw ServerException.fromErrorResponse(ERROR_RESPONSE.USER_NOT_FOUND);
    }

    return user;
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
}
