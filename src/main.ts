import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,PATCH,POST,DELETE',
  });
  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});
