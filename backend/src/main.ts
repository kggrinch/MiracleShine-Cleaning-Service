import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so browser clients can call this API from allowed origins.
  // Use CORS_ORIGIN to restrict access in production, or '*' for local testing.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
  });

  // Helmet adds many useful HTTP security headers automatically.
  // This helps prevent common web vulnerabilities like clickjacking and MIME-sniffing.
  app.use(helmet());

  // Compression reduces response sizes by using gzip/deflate.
  // This improves performance for API responses over the network.
  app.use(compression());

  // ValidationPipe ensures request bodies match your DTO rules.
  // whitelist: removes unexpected fields, transform: converts payloads to DTO classes.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
