import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-mutations.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_TTL_LIST = 300; // 5 phút
  private readonly CACHE_TTL_DETAIL = 1800; // 30 phút

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) { }

  /**
   * Lấy danh sách sản phẩm có bộ lọc và phân trang (Cache-aside)
   */
  async findAll(query: GetProductsQueryDto) {
    const {
      category,
      light,
      petFriendly,
      difficulty,
      size,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = query;

    // Tạo cache key độc nhất dựa trên tham số query
    const cacheKey = `product:list:${JSON.stringify({
      category,
      light,
      petFriendly,
      difficulty,
      size,
      minPrice,
      maxPrice,
      search,
      sortBy,
      page,
      limit,
    })}`;

    // Kiểm tra cache Redis
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        this.logger.error('Failed to parse cached product list', e);
      }
    }

    // Xây dựng điều kiện truy vấn Prisma
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category;
    }
    if (light) {
      where.light = light;
    }
    if (petFriendly !== undefined) {
      where.petFriendly = petFriendly;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (size) {
      // Lọc sản phẩm có variant với kích cỡ này
      where.variants = {
        some: { size },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { botanicalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Xây dựng điều kiện sắp xếp
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating_desc') {
      orderBy = { rating: 'desc' };
    }

    const skip = (page - 1) * limit;

    // Chạy song song đếm tổng số lượng và lấy dữ liệu phân trang để tăng tốc độ phản hồi
    const [totalItems, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          variants: {
            orderBy: { price: 'asc' }, // Sắp xếp variant theo giá tăng dần
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const result = {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };

    // Lưu vào cache
    await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL_LIST);

    return result;
  }

  /**
   * Lấy chi tiết sản phẩm theo ID (Cache-aside)
   */
  async findOne(id: string) {
    const cacheKey = `product:detail:${id}`;

    // Kiểm tra cache Redis
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        this.logger.error(`Failed to parse cached product detail for id ${id}`, e);
      }
    }

    // Query DB kèm variants
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Lưu vào cache
    await this.redisService.set(cacheKey, JSON.stringify(product), this.CACHE_TTL_DETAIL);

    return product;
  }

  /**
   * Tạo sản phẩm mới (Admin)
   */
  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      throw new BadRequestException(`Product with ID (slug) "${dto.id}" already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        id: dto.id,
        name: dto.name,
        botanicalName: dto.botanicalName,
        price: dto.price,
        description: dto.description,
        category: dto.category,
        image: dto.image,
        images: dto.images,
        colorImages: dto.colorImages as Prisma.InputJsonValue,
        light: dto.light,
        petFriendly: dto.petFriendly,
        difficulty: dto.difficulty,
        size: dto.size,
        rating: dto.rating ?? 5.0,
        reviewsCount: dto.reviewsCount ?? 0,
        careDetails: dto.careDetails as Prisma.InputJsonValue,
        // Tạo variants nếu có
        variants: dto.variants && dto.variants.length > 0
          ? {
              create: dto.variants.map(v => ({
                size: v.size,
                heightMin: v.heightMin,
                heightMax: v.heightMax,
                price: v.price,
                stock: v.stock,
              })),
            }
          : undefined,
      },
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    });

    // Invalidate product cache
    await this.invalidateProductCache();

    return product;
  }

  /**
   * Cập nhật sản phẩm (Admin)
   */
  async update(id: string, dto: UpdateProductDto) {
    // Check xem có tồn tại không
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Cập nhật product data
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        botanicalName: dto.botanicalName,
        price: dto.price,
        description: dto.description,
        category: dto.category,
        image: dto.image,
        images: dto.images,
        colorImages: dto.colorImages as Prisma.InputJsonValue,
        light: dto.light,
        petFriendly: dto.petFriendly,
        difficulty: dto.difficulty,
        size: dto.size,
        rating: dto.rating,
        reviewsCount: dto.reviewsCount,
        careDetails: dto.careDetails as Prisma.InputJsonValue,
      },
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    });

    // Cập nhật variants nếu có trong DTO
    if (dto.variants !== undefined) {
      // Xóa tất cả variants cũ và tạo mới
      await this.prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      if (dto.variants.length > 0) {
        await this.prisma.productVariant.createMany({
          data: dto.variants.map(v => ({
            productId: id,
            size: v.size,
            heightMin: v.heightMin,
            heightMax: v.heightMax,
            price: v.price,
            stock: v.stock,
          })),
        });
      }

      // Lấy lại product với variants mới
      const refreshed = await this.prisma.product.findUnique({
        where: { id },
        include: {
          variants: {
            orderBy: { price: 'asc' },
          },
        },
      });

      await this.invalidateProductCache(id);
      return refreshed;
    }

    // Invalidate product cache
    await this.invalidateProductCache(id);

    return updated;
  }

  /**
   * Xóa sản phẩm (Admin)
   */
  async remove(id: string) {
    // Check xem có tồn tại không
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    // Invalidate product cache
    await this.invalidateProductCache(id);

    return { success: true, message: `Product "${id}" successfully deleted` };
  }

  /**
   * Invalidate toàn bộ cache danh sách sản phẩm và chi tiết sản phẩm cụ thể
   */
  private async invalidateProductCache(productId?: string) {
    this.logger.log('Invalidating product cache due to mutation');
    // Xóa tất cả cache danh sách sản phẩm
    await this.redisService.delByPrefix('product:list');

    // Nếu có productId cụ thể, xóa cache chi tiết của nó
    if (productId) {
      await this.redisService.del(`product:detail:${productId}`);
    }
  }
}
