import { hash } from 'bcryptjs';
import { PASSWORD_SALT_ROUNDS } from '../constant/user.constant.js';

export function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, PASSWORD_SALT_ROUNDS);
}
