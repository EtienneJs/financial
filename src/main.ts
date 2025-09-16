import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setGlobalPrefix('api');
    app.useGlobalPipes(
    new ValidationPipe({
      transform:true,
      groups: ['base'],
      validateCustomDecorators: true
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
