import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { EnvConfig } from '../config/env.validation.js';
import { DatabaseStatusLogger } from './database-status.logger.js';

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await ConfigModule.envVariablesLoaded;

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<EnvConfig, true>) => ({
            type: 'postgres',
            host: config.get('DB_HOST', { infer: true }),
            port: config.get('DB_PORT', { infer: true }),
            username: config.get('DB_USERNAME', { infer: true }),
            password: config.get('DB_PASSWORD', { infer: true }),
            database: config.get('DB_DATABASE', { infer: true }),
            autoLoadEntities: true,
            synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
          }),
        }),
      ],
      providers: [DatabaseStatusLogger],
      exports: [TypeOrmModule],
    };
  }
}
