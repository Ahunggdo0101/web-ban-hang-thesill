import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Kích hoạt HTTP Security Headers bằng helmet bảo vệ API (CSP cấu hình cho phép Swagger UI hoạt động)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
        },
      },
    }),
  );
  const configService = app.get(ConfigService);

  // Cấu hình ValidationPipe để tự động validate và chuyển đổi kiểu dữ liệu (transform)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Kích hoạt CORS hỗ trợ giao tiếp giữa frontend (Vite) và backend an toàn
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS', '');
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'https://web-ban-hang-the-sill.vercel.app'];

  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Cho phép requests không có origin (như curl hoặc mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`Origin blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Bật tiền tố API toàn cục
  app.setGlobalPrefix('api');

  // Thiết lập Swagger UI để phát triển và test API
  const config = new DocumentBuilder()
    .setTitle('Cây Cảnh Nam Định API')
    .setDescription('Premium eCommerce store backend designed for high scalability (1M users) - Cây Cảnh Nam Định')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`API Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
