import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cấu hình ValidationPipe để tự động validate và chuyển đổi kiểu dữ liệu (transform)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Kích hoạt CORS hỗ trợ giao tiếp giữa frontend (Vite) và backend
  app.enableCors({
    origin: '*', // Trong production nên cấu hình chi tiết tên miền được phép truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Bật tiền tố API toàn cục
  app.setGlobalPrefix('api');

  // Thiết lập Swagger UI để phát triển và test API
  const config = new DocumentBuilder()
    .setTitle('The Sill API')
    .setDescription('Premium eCommerce store backend designed for high scalability (1M users)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`API Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
