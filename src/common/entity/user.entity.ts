import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  BCRYPT_HASH_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '../constant/user.constant.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: EMAIL_MAX_LENGTH, unique: true })
  email: string;

  @Column({ type: 'varchar', length: NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: BCRYPT_HASH_LENGTH, select: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
