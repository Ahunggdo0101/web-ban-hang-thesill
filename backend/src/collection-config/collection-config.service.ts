import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CollectionConfigService {
  private readonly logger = new Logger(CollectionConfigService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Đọc cấu hình của một bộ sưu tập theo ID
   * Nếu chưa có cấu hình trong DB, trả về mặc định là 12 slots rỗng
   */
  async findOne(id: string) {
    const config = await this.prisma.collectionConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return {
        id,
        slots: Array(12).fill(null),
        trending: null,
      };
    }

    return config;
  }

  /**
   * Cập nhật danh sách slots và cấu hình trending của một bộ sưu tập (Upsert)
   * Tự động xóa cache các danh sách sản phẩm để cập nhật hiển thị ngay lập tức
   */
  async update(id: string, slots: (string | null)[], trending?: any) {
    this.logger.log(`Updating collection config for: ${id}`);
    
    const updateData: any = {
      slots: slots as any,
    };
    if (trending !== undefined) {
      updateData.trending = trending;
    }

    const createData: any = {
      id,
      slots: slots as any,
    };
    if (trending !== undefined) {
      createData.trending = trending;
    }

    const config = await this.prisma.collectionConfig.upsert({
      where: { id },
      update: updateData,
      create: createData,
    });

    // Invalidate product list cache in Redis
    await this.redisService.delByPrefix('product:list:');

    return config;
  }
}
