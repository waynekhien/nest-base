import { User } from '../entity/user.entity.js';
import { UserResponseDto } from '../dto/user-response.dto.js';

export function mapUserToResponseDto(user: User): UserResponseDto {
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
