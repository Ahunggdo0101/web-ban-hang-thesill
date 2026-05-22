import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo đơn hàng mới trong một Database Transaction để đảm bảo tính toàn vẹn
   */
  async checkout(dto: CheckoutDto, userId?: string) {
    if (dto.items.length === 0) {
      throw new BadRequestException('Shopping cart cannot be empty');
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsToCreate = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID "${item.productId}" not found in catalog`);
        }

        const itemPrice = product.price;
        subtotal += itemPrice * item.quantity;

        itemsToCreate.push({
          productId: item.productId,
          potStyle: item.potStyle,
          potColor: item.potColor,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      const discount = dto.discount ?? 0;
      const shippingCost = dto.shippingCost ?? 0;
      const totalAmount = Math.max(0, subtotal - discount + shippingCost);

      const order = await tx.order.create({
        data: {
          userId: userId || null,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          phone: dto.phone,
          address: dto.address,
          district: dto.district,
          city: dto.city,
          totalAmount,
          discount,
          shippingCost,
          status: 'pending',
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      return order;
    });
  }

  /**
   * Lấy lịch sử đơn hàng của người dùng
   */
  async findAllByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    if (userId && order.userId !== userId) {
      throw new BadRequestException('You do not have access to view this order');
    }

    return order;
  }

  // ─── Admin-only methods ──────────────────────────────────────────────────────

  /**
   * [Admin] Lấy tất cả đơn hàng có phân trang, lọc trạng thái và tìm kiếm
   */
  async findAllAdmin(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          items: {
            include: { product: { select: { id: true, name: true, image: true } } },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * [Admin] Thống kê doanh thu và đơn hàng
   */
  async getAdminStats() {
    const [totalOrders, totalRevenue, ordersByStatus, recentOrders, totalUsers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true, image: true } } } },
        },
      }),
      this.prisma.user.count(),
    ]);

    const statusCounts = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      statusCounts,
      recentOrders,
      totalUsers,
    };
  }

  /**
   * [Admin] Cập nhật trạng thái đơn hàng
   */
  async updateStatus(id: string, status: string) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  /**
   * [Admin] Xóa đơn hàng
   */
  async removeOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    await this.prisma.order.delete({ where: { id } });
    return { success: true, message: `Order "${id}" successfully deleted` };
  }
}
