import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import 'reflect-metadata';
import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './common/api-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.flatMap((error) => Object.values(error.constraints ?? {})).join(' '),
        ),
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/', (_request, response) => {
    response.status(200).json({
      success: true,
      message: 'Intercity Bus Reservation API is running.',
      version: '1.0.0',
    });
  });
  await app.listen(Number(process.env.PORT ?? 5000), '0.0.0.0');
}

await bootstrap();
