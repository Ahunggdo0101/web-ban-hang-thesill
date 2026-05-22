import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng
   */
  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   */
  async addToWishlist(userId: string, productId: string) {
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID "${productId}" không tồn tại`);
    }

    // Kiểm tra xem đã có trong danh sách chưa
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Tạo mới
    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });
  }

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   */
  async removeFromWishlist(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Sản phẩm yêu thích với ID "${productId}" không tồn tại trong danh sách của bạn`);
    }

    return this.prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}
