import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Health & Swagger (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nest Base API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  it('/health (GET) returns system health payload', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'disabled',
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      }),
    );
  });

  it('/api/docs-json (GET) exposes OpenAPI specification for /health', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    expect(response.body.paths['/health']).toBeDefined();
    expect(response.body.components.schemas.HealthResponseDto).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
