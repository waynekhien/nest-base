import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { EnvConfig } from '../../config/env.validation.js';
import { HealthResponseDto } from './dto/health-response.dto.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthResponseDto> {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException(
        'Database connection is not initialized',
      );
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch (error: unknown) {
      throw new ServiceUnavailableException('Database health check failed', {
        cause: error,
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
      environment: this.configService.get('NODE_ENV', { infer: true }),
      database: 'up',
    };
  }
}
