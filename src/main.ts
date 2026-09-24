import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  /*
   * Puerto donde se ejecutará
   * la API.
   */
  const port =
    Number(process.env.PORT) || 3000;

  /*
   * Origen autorizado para
   * consumir la API desde
   * el navegador.
   */
  const corsOrigin =
    process.env.CORS_ORIGIN?.trim();

  if (!corsOrigin) {
    throw new Error(
      'CORS_ORIGIN no está configurado',
    );
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

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

  await app.listen(port);

  console.log(
    `API ejecutándose en el puerto ${port}`,
  );
}

bootstrap();