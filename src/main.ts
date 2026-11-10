import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module.js';
import { ERROR_RESPONSE } from './common/constant/error-response.constant.js';
import { ServerException } from './common/exception/server.exception.js';
import { formatValidationErrors } from './common/util/format-validation-errors.util.js';
import type { EnvConfig } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<EnvConfig, true>);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) =>
        ServerException.fromErrorResponse(
          ERROR_RESPONSE.REQUEST_PAYLOAD_VALIDATION_ERROR,
          { details: formatValidationErrors(errors) },
        ),
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest Base API')
    .setDescription('Tài liệu API cho dự án NestJS Base')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Server is running on http://localhost:${port}`);
  logger.log(`Swagger UI is available at http://localhost:${port}/api/docs`);
}
await bootstrap();
