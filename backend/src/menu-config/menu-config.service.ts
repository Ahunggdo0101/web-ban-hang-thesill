import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

export const DEFAULT_MENU_CONFIG = [
  {
    title: 'GIẢM GIÁ',
    color: 'text-red-600 hover:text-red-800',
    hasMenu: false,
    view: 'collections/sale'
  },
  {
    title: 'Hàng Mới',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Lựa chọn hàng đầu', href: '/shop?sort=rating' },
        { name: 'Cây trong nhà mới', href: '/shop' },
        { name: 'Cây ngoài trời mới', href: '/shop' },
        { name: 'Cây cổ thụ mới', href: '/collections/large-plants' },
        { name: 'Hội thảo sắp tới', href: '/quiz' }
      ],
      cards: [
        {
          title: 'Cây Đang Nở Hoa',
          image: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Bộ Sưu Tập Cây Cổ Thụ',
          image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants'
        },
        {
          title: 'Quà Tặng Ngày Của Cha',
          image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
          href: '/shop?difficulty=easy'
        }
      ]
    }
  },
  {
    title: 'Cây Cỡ Lớn',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'collections/large-plants',
    menuData: {
      links: [
        { name: 'Cây Lớn Bán Chạy', href: '/collections/large-plants?sort=rating' },
        { name: 'Cây Trồng Góc Nhà', href: '/collections/large-plants?light=medium' },
        { name: 'Cây Cảnh Văn Phòng', href: '/collections/large-plants?difficulty=easy' },
        { name: 'Cây Thanh Lọc Không Khí', href: '/collections/large-plants' }
      ],
      cards: [
        {
          title: 'Bàng Singapore Đại',
          image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants'
        },
        {
          title: 'Trầu Bà Cột Xanh Mướt',
          image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants?difficulty=easy'
        },
        {
          title: 'Cây Hạnh Phúc Cỡ Lớn',
          image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants?light=medium'
        }
      ]
    }
  },
  {
    title: 'Trong Nhà',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Ngoài Trời',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Hoa Lan',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Hoa Lan Hồ Điệp', href: '/shop?light=bright' },
        { name: 'Hoa Lan Quà Tặng', href: '/shop?difficulty=moderate' },
        { name: 'Hoa Lan Mini Để Bàn', href: '/shop?size=small' },
        { name: 'Hướng Dẫn Chăm Sóc Lan', href: '/shop' }
      ],
      cards: [
        {
          title: 'Hồ Điệp Trắng Sang Trọng',
          image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Hồ Điệp Tím Quý Phái',
          image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Hồ Điệp Vàng Ấm Áp',
          image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        }
      ]
    }
  },
  {
    title: 'Quà Tặng',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Chậu & Chăm Sóc',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Quà Doanh Nghiệp',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Blog',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'journal'
  }
];

@Injectable()
export class MenuConfigService {
  private readonly logger = new Logger(MenuConfigService.name);
  private readonly CACHE_KEY = 'menu:config';
  private readonly CACHE_TTL = 300; // 5 phút

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Lấy cấu hình menu chính (MegaMenu) — public, có Redis cache
   */
  async getConfig(): Promise<any> {
    // 1. Kiểm tra cache Redis
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.error('Failed to parse cached menu config', e);
      }
    }

    // 2. Lấy từ database (Prisma)
    const record = await this.prisma.menuConfig.findUnique({
      where: { id: 'main-menu' }
    });
    
    const config = record ? record.data : DEFAULT_MENU_CONFIG;

    // 3. Lưu vào cache Redis
    await this.redisService.set(this.CACHE_KEY, JSON.stringify(config), this.CACHE_TTL);

    return config;
  }

  /**
   * Cập nhật cấu hình menu (Chỉ dành cho Admin), xóa cache
   */
  async updateConfig(data: any): Promise<any> {
    const record = await this.prisma.menuConfig.upsert({
      where: { id: 'main-menu' },
      update: { data: data as Prisma.InputJsonValue },
      create: { id: 'main-menu', data: data as Prisma.InputJsonValue },
    });

    // Xóa cache Redis
    await this.redisService.del(this.CACHE_KEY);
    this.logger.log('Menu config updated & cache invalidated');

    return record.data;
  }
}
