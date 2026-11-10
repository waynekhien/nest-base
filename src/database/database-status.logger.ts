import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import type { EnvConfig } from '../config/env.validation.js';

@Injectable()
export class DatabaseStatusLogger implements OnApplicationBootstrap {
  private readonly logger = new Logger('Database');

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const host = this.config.get('DB_HOST', { infer: true });
    const port = this.config.get('DB_PORT', { infer: true });
    const database = this.config.get('DB_DATABASE', { infer: true });

    await this.dataSource.query('SELECT 1');

    this.logger.log(`Connected to PostgreSQL at ${host}:${port}/${database}`);
  }
}
