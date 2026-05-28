import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

// Cấu hình trang chủ mặc định — được dùng khi DB chưa có bản ghi nào
export const DEFAULT_HOMEPAGE_CONFIG = {
  // 4 ảnh slider "Plants Make People Happy"
  happySlides: [
    'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921',
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b',
    'https://images.unsplash.com/photo-1520412099521-63b16afe9587',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
  ],

  // 8 ô danh mục "Cây xanh cho mọi người"
  categories: [
    { title: 'Cây trồng trong nhà', image: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7', path: '/shop?difficulty=easy', visible: true },
    { title: 'Cây trồng ngoài trời', image: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b', path: '/shop?size=large', visible: true },
    { title: 'Các loại cây thân thiện với thú cưng', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', path: '/shop?pet=true', visible: true },
    { title: 'Cây dễ chăm sóc', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411', path: '/shop?difficulty=easy', visible: true },
    { title: 'Hoa lan', image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d', path: '/shop', visible: true },
    { title: 'Cây trồng trong nhà cỡ lớn và khổng lồ', image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921', path: '/shop?size=large', visible: true },
    { title: 'Cây chịu được ánh sáng yếu', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b', path: '/shop?light=low', visible: true },
    { title: 'Chăm sóc cây trồng', image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145f86', path: '/shop', visible: true },
  ],

  // 4 sản phẩm section "Ưa chuộng nhất"
  popularPlants: [
    { title: 'Cây ô liu', desc: 'Loại cây lý tưởng cho không gian nội thất cao cấp.', rating: 5, reviewsCount: '158 đánh giá', price: 'Từ 59 đô la', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32', path: '/shop', badge: '' },
    { title: 'Philodendron Brasil', desc: 'Ánh sáng mạnh hơn làm nổi bật nhiều màu sắc hơn.', rating: 5, reviewsCount: '1 đánh giá', price: 'Từ 69 đô la', image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518', path: '/shop', badge: '' },
    { title: 'Cây tiền', desc: 'Cây may mắn nguyên thủy', rating: 5, reviewsCount: '66 đánh giá', price: 'Từ 39 đô la', image: 'https://images.unsplash.com/photo-1520412099521-63b16afe9587', path: '/shop', badge: 'sale' },
    { title: 'Chanh Meyer', desc: 'Mua ở cửa hàng < tự trồng tại nhà', rating: 5, reviewsCount: '20 đánh giá', price: 'Từ $99', oldPrice: '109 đô la', image: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385', path: '/shop', badge: 'sale' },
  ],

  // 4 sản phẩm section "Cây lớn trên sàn"
  floorPlants: [
    { title: 'Cây ô liu', desc: 'Loại cây lý tưởng cho không gian nội thất cao cấp.', rating: 5, reviewsCount: '158 reviews', price: 'Từ 59 đô la', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32', path: '/shop?size=large', badge: 'sale' },
    { title: 'Cây sung lá đàn', desc: 'Người yêu thích thiết kế', rating: 5, reviewsCount: '26 reviews', price: 'Từ 69 đô la', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae', path: '/shop?size=large', badge: 'sale' },
    { title: 'Chim Thiên Đường', desc: 'Thiên đường đã được ban tặng', rating: 5, reviewsCount: '29 reviews', price: 'Từ 69 đô la', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b', path: '/shop?size=large', badge: 'sale' },
    { title: 'Alocasia Portora', desc: 'To lớn, xù xì và phát triển nhanh.', rating: 0, reviewsCount: '', price: 'Từ 169 đô la', oldPrice: '199 đô la', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', path: '/shop?size=large', badge: 'sale' },
  ],

  // 4 sản phẩm section "Hàng mới về"
  newArrivals: [
    { title: 'Lan kép lớn', desc: 'Có thể nở hoa trong nhiều tháng', rating: 5, reviewsCount: '32 reviews', price: 'Từ 139 đô la', image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d', path: '/shop', badge: 'bestseller' },
    { title: 'Chim Thiên Đường', desc: 'Thiên đường đã được ban tặng', rating: 5, reviewsCount: '29 reviews', price: 'Từ 69 đô la', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b', path: '/shop?size=large', badge: 'sale' },
    { title: 'Cây dành dành lớn', desc: 'Những loài hoa thơm ngát dành cho không gian đầy nắng', rating: 0, reviewsCount: '', price: 'Từ 119 đô la', oldPrice: '129 đô la', image: 'https://images.unsplash.com/photo-1512428813824-f4a0f4a88352', path: '/shop?size=large', badge: 'sale' },
    { title: 'Cây cọ lớn uy nghi', desc: 'Không gian xanh mát như khu nghỉ dưỡng', rating: 5, reviewsCount: '9 reviews', price: 'Từ 89 đô la', oldPrice: '99 đô la', image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9', path: '/shop?size=large', badge: 'sale' },
  ],
};

@Injectable()
export class HomepageConfigService {
  private readonly logger = new Logger(HomepageConfigService.name);
  private readonly CACHE_KEY = 'homepage:config';
  private readonly CACHE_TTL = 300; // 5 phút

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Lấy cấu hình trang chủ — public, có Redis cache
   */
  async getConfig(): Promise<any> {
    // 1. Kiểm tra Redis cache
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.error('Failed to parse cached homepage config', e);
      }
    }

    // 2. Lấy từ DB
    const record = await this.prisma.homepageConfig.findUnique({ where: { id: 1 } });
    const config = record ? record.data : DEFAULT_HOMEPAGE_CONFIG;

    // 3. Lưu vào cache
    await this.redisService.set(this.CACHE_KEY, JSON.stringify(config), this.CACHE_TTL);

    return config;
  }

  /**
   * Lưu cấu hình trang chủ (Admin only) — upsert, invalidate cache
   */
  async updateConfig(data: any): Promise<any> {
    const record = await this.prisma.homepageConfig.upsert({
      where: { id: 1 },
      update: { data: data as Prisma.InputJsonValue },
      create: { id: 1, data: data as Prisma.InputJsonValue },
    });

    // Invalidate cache để trang chủ đọc dữ liệu mới ngay lập tức
    await this.redisService.del(this.CACHE_KEY);
    this.logger.log('Homepage config updated & cache invalidated');

    return record.data;
  }
}
