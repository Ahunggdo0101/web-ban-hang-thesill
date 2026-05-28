import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService implements OnModuleInit {
  private readonly logger = new Logger(CategoryService.name);
  private readonly CACHE_KEY = 'category:list';
  private readonly CACHE_TTL = 3600; // 1 giờ

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.category.count();
      if (count === 0) {
        this.logger.log('No categories found. Seeding default categories...');
        const defaults = [
          { id: 'plants', name: 'Cây cảnh', description: 'Các loại cây cảnh để bàn, trang trí phòng khách thông thường' },
          { id: 'indoor-plants', name: 'Cây trong nhà', description: 'Cây xanh thanh lọc không khí trong không gian phòng kín' },
          { id: 'large-plants', name: 'Cây cỡ lớn', description: 'Cây trồng sàn khổng lồ tạo điểm nhấn nội thất' },
          { id: 'outdoor-plants', name: 'Cây ngoài trời', description: 'Cây chịu nắng gió, trang trí ban công sân vườn' },
          { id: 'pots', name: 'Chậu', description: 'Chậu gốm, sứ, đất nung và các khay lót chậu' },
          { id: 'care', name: 'Chăm sóc', description: 'Đất dinh dưỡng, bình tưới nước và phân bón chuyên dụng' },
        ];
        
        await this.prisma.category.createMany({
          data: defaults
        });
        
        this.logger.log(`Successfully seeded ${defaults.length} default categories.`);
      }
    } catch (err) {
      this.logger.error('Failed to seed default categories', err);
    }
  }

  async findAll() {
    // 1. Check cache
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.error('Failed to parse cached categories list', e);
      }
    }

    // 2. Query DB
    const categories = await this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    // 3. Cache
    await this.redisService.set(this.CACHE_KEY, JSON.stringify(categories), this.CACHE_TTL);

    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID (slug) "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      throw new BadRequestException(`Category with ID (slug) "${dto.id}" already exists`);
    }

    const category = await this.prisma.category.create({
      data: {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        image: dto.image,
      },
    });

    await this.invalidateCache();
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        image: dto.image,
      },
    });

    await this.invalidateCache();
    return category;
  }

  async remove(id: string) {
    await this.findOne(id);

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const productCount = await this.prisma.product.count({
      where: { category: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete category "${id}" because it has ${productCount} associated products`);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    await this.invalidateCache();
    return { success: true, message: `Category "${id}" successfully deleted` };
  }

  private async invalidateCache() {
    await this.redisService.del(this.CACHE_KEY);
  }
}
