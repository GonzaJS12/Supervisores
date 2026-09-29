import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 3000;

  /*
   * CORS abierto de forma temporal
   * para el primer despliegue.
   * Después se restringirá al frontend.
   */
  app.enableCors();

  /*
   * Validación global de DTO.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
}

bootstrap();