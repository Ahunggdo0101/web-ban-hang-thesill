import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing');
    }

    let cleanConnectionString = connectionString;
    if (cleanConnectionString.includes('sslmode=')) {
      cleanConnectionString = cleanConnectionString.replace(/[?&]sslmode=[^&]+/g, '');
      // Đảm bảo không để lại dấu ? thừa ở cuối URL nếu nó là query parameter duy nhất
      if (cleanConnectionString.endsWith('?')) {
        cleanConnectionString = cleanConnectionString.slice(0, -1);
      }
    }

    const pool = new Pool({
      connectionString: cleanConnectionString,
      max: 50, // Cấu hình connection pool size cao hơn cho hệ thống chịu tải
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : undefined,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
