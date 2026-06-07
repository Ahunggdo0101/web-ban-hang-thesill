import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isConnected = false;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    const redisOptions: any = {
      host,
      port,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000, // Timeout kết nối 5 giây
      retryStrategy: (times: number) => {
        if (times > 3) {
          // Sau 3 lần thử, dừng retry - hoạt động không cần Redis
          this.logger.warn('Redis unavailable after 3 retries. Running without cache.');
          return null; // Dừng retry
        }
        const delay = Math.min(times * 200, 3000);
        return delay;
      },
      lazyConnect: true, // Không kết nối ngay khi khởi tạo
    };

    if (password) {
      redisOptions.password = password;
    }

    this.client = new Redis(redisOptions);

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log(`Successfully connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis connection error (cache disabled): ${err.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed. Cache disabled.');
    });

    // Thử kết nối nhưng không crash nếu thất bại
    this.client.connect().catch((err) => {
      this.isConnected = false;
      this.logger.warn(`Could not connect to Redis (cache disabled): ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
      } catch (error) {
        this.logger.warn('Error closing Redis connection:', error);
      }
    }
  }

  /**
   * Kiểm tra Redis có sẵn sàng không
   */
  private isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client!.get(key);
    } catch (error) {
      this.logger.warn(`Redis GET failed for "${key}" (fallback to DB): ${(error as Error).message}`);
      this.isConnected = false;
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (ttlSeconds) {
        await this.client!.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      this.logger.warn(`Redis SET failed for "${key}": ${(error as Error).message}`);
      this.isConnected = false;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client!.del(key);
    } catch (error) {
      this.logger.warn(`Redis DEL failed for "${key}": ${(error as Error).message}`);
      this.isConnected = false;
    }
  }

  /**
   * Xóa toàn bộ key khớp với prefix.
   * Sử dụng SCAN thay cho KEYS để tránh block single-thread của Redis ở môi trường production.
   */
  async delByPrefix(prefix: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      let cursor = '0';
      do {
        const reply = await this.client!.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = reply[0];
        const keys = reply[1];
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(`Redis delByPrefix failed for "${prefix}": ${(error as Error).message}`);
      this.isConnected = false;
    }
  }
}
