import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug-db')
  async debugDb() {
    try {
      const count = await this.prisma.product.count();
      return {
        success: true,
        message: 'Database connection successful!',
        productCount: count,
      };
    } catch (error: any) {
      let host = 'unknown';
      let port = 'unknown';
      try {
        const dbUrl = process.env.DATABASE_URL || '';
        const parsed = new URL(dbUrl.replace('postgresql://', 'http://'));
        host = parsed.hostname;
        port = parsed.port;
      } catch (e) {}

      return {
        success: false,
        message: 'Database connection failed!',
        error: error.message,
        stack: error.stack,
        envDatabaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        parsedHost: host,
        parsedPort: port,
      };
    }
  }

}

