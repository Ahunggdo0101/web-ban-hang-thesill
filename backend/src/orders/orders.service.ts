import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private vouchersService: VouchersService,
  ) {}

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

      // Truy vấn toàn bộ sản phẩm cùng các variants trong giỏ hàng bằng một câu lệnh duy nhất
      const productIds = dto.items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      for (const item of dto.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new NotFoundException(`Product with ID "${item.productId}" not found in catalog`);
        }

        // Tìm variant tương ứng với size được chọn
        const variant = product.variants.find(v => v.size === item.size);
        if (!variant) {
          throw new BadRequestException(`Kích cỡ "${item.size}" không tồn tại cho sản phẩm "${product.name}".`);
        }

        // Kiểm tra tồn kho của variant
        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" cỡ "${item.size}" không đủ hàng. Chỉ còn ${variant.stock} sản phẩm.`
          );
        }

        // Giảm tồn kho của variant tương ứng
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        const itemPrice = variant.price;
        subtotal += itemPrice * item.quantity;

        itemsToCreate.push({
          productId: item.productId,
          potStyle: item.potStyle,
          potColor: item.potColor,
          size: item.size,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      // Tạo danh sách item info phục vụ cho việc validate voucher
      const cartItemInfos = itemsToCreate.map(item => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      }));

      let calculatedDiscount = 0;
      let appliedProductVoucherCode: string | null = null;
      let appliedShippingVoucherCode: string | null = null;
      const shippingCost = dto.shippingCost ?? 0;

      // 1. Áp dụng mã giảm giá sản phẩm
      if (dto.productVoucherCode) {
        const resProduct = await this.vouchersService.validateAndCalculateDiscount(
          dto.productVoucherCode,
          userId,
          cartItemInfos,
        );
        if (resProduct.type !== 'product') {
          throw new BadRequestException(`Mã "${dto.productVoucherCode}" không phải là mã giảm giá sản phẩm.`);
        }
        calculatedDiscount += resProduct.discountAmount;
        appliedProductVoucherCode = resProduct.code;
      }

      // 2. Áp dụng mã ưu đãi vận chuyển
      if (dto.shippingVoucherCode) {
        const resShipping = await this.vouchersService.validateAndCalculateDiscount(
          dto.shippingVoucherCode,
          userId,
          cartItemInfos,
        );
        if (resShipping.type !== 'shipping') {
          throw new BadRequestException(`Mã "${dto.shippingVoucherCode}" không phải là mã ưu đãi vận chuyển.`);
        }
        
        // Mức giảm ship tối đa bằng phí ship thực tế
        const shippingDiscountAmount = Math.min(resShipping.discountAmount, shippingCost);
        calculatedDiscount += shippingDiscountAmount;
        appliedShippingVoucherCode = resShipping.code;
      }

      // 3. Cập nhật lượt sử dụng của các voucher trong transaction
      if (appliedProductVoucherCode) {
        await tx.voucher.update({
          where: { code: appliedProductVoucherCode },
          data: { usedCount: { increment: 1 } },
        });
      }
      if (appliedShippingVoucherCode) {
        await tx.voucher.update({
          where: { code: appliedShippingVoucherCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      const totalAmount = Math.max(0, subtotal - calculatedDiscount + shippingCost);

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
          discount: calculatedDiscount,
          shippingCost,
          productVoucherCode: appliedProductVoucherCode,
          shippingVoucherCode: appliedShippingVoucherCode,
          status: 'pending',
          paymentMethod: dto.paymentMethod || 'COD',
          vatRequested: dto.vatRequested ?? false,
          vatCompanyName: dto.vatCompanyName || null,
          vatTaxCode: dto.vatTaxCode || null,
          vatCompanyAddr: dto.vatCompanyAddr || null,
          vatEmail: dto.vatEmail || null,
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
      const trimmedSearch = search.trim();
      let cleanSearch = trimmedSearch;
      
      // Tự động cắt bỏ tiền tố TS- (hoặc ts-) nếu admin copy nguyên mã chuyển khoản vào
      if (trimmedSearch.toLowerCase().startsWith('ts-')) {
        cleanSearch = trimmedSearch.substring(3);
      }

      where.OR = [
        { customerName: { contains: trimmedSearch, mode: 'insensitive' } },
        { customerEmail: { contains: trimmedSearch, mode: 'insensitive' } },
        { id: { contains: cleanSearch, mode: 'insensitive' } },
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

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }

      // Hoàn kho và hoàn lượt dùng mã giảm giá khi hủy đơn hàng (từ trạng thái khác sang cancelled)
      if (status === 'cancelled' && order.status !== 'cancelled') {
        // 1. Hoàn kho sản phẩm
        for (const item of order.items) {
          if (!item.size) continue;
          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
            },
          });
          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        // 2. Hoàn lượt dùng mã giảm giá sản phẩm
        if (order.productVoucherCode) {
          const pv = await tx.voucher.findUnique({ where: { code: order.productVoucherCode } });
          if (pv && pv.usedCount > 0) {
            await tx.voucher.update({
              where: { code: order.productVoucherCode },
              data: { usedCount: { decrement: 1 } },
            });
          }
        }

        // 3. Hoàn lượt dùng mã ưu đãi vận chuyển
        if (order.shippingVoucherCode) {
          const sv = await tx.voucher.findUnique({ where: { code: order.shippingVoucherCode } });
          if (sv && sv.usedCount > 0) {
            await tx.voucher.update({
              where: { code: order.shippingVoucherCode },
              data: { usedCount: { decrement: 1 } },
            });
          }
        }
      }
      // Trừ kho và trừ lượt dùng mã giảm giá khi khôi phục đơn hàng bị hủy (từ cancelled sang trạng thái khác)
      else if (order.status === 'cancelled' && status !== 'cancelled') {
        // 1. Trừ kho sản phẩm (và check hàng)
        for (const item of order.items) {
          if (!item.size) continue;
          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
            },
          });
          if (variant) {
            if (variant.stock < item.quantity) {
              throw new BadRequestException(
                `Không thể khôi phục đơn hàng. Kích cỡ "${item.size}" của sản phẩm ID "${item.productId}" không đủ tồn kho (chỉ còn ${variant.stock}).`
              );
            }
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        // 2. Trực tiếp kiểm tra và trừ lượt dùng mã giảm sản phẩm
        if (order.productVoucherCode) {
          const pv = await tx.voucher.findUnique({ where: { code: order.productVoucherCode } });
          if (pv) {
            if (pv.usageLimit !== null && pv.usedCount >= pv.usageLimit) {
              throw new BadRequestException(
                `Không thể khôi phục đơn hàng. Mã giảm giá sản phẩm "${order.productVoucherCode}" đã hết lượt sử dụng trên hệ thống.`
              );
            }
            await tx.voucher.update({
              where: { code: order.productVoucherCode },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        // 3. Trực tiếp kiểm tra và trừ lượt dùng mã ưu đãi vận chuyển
        if (order.shippingVoucherCode) {
          const sv = await tx.voucher.findUnique({ where: { code: order.shippingVoucherCode } });
          if (sv) {
            if (sv.usageLimit !== null && sv.usedCount >= sv.usageLimit) {
              throw new BadRequestException(
                `Không thể khôi phục đơn hàng. Mã ưu đãi vận chuyển "${order.shippingVoucherCode}" đã hết lượt sử dụng trên hệ thống.`
              );
            }
            await tx.voucher.update({
              where: { code: order.shippingVoucherCode },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: { include: { product: true } },
        },
      });
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

  /**
   * Khách hàng xác nhận đã chuyển khoản
   */
  async confirmPaymentByUser(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    if (userId && order.userId !== userId) {
      throw new BadRequestException('You do not have access to confirm payment for this order');
    }

    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus: 'pending_verification' },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  /**
   * [Admin] Cập nhật trạng thái thanh toán của đơn hàng
   */
  async updatePaymentStatusByAdmin(id: string, paymentStatus: string) {
    const validStatuses = ['unpaid', 'pending_verification', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestException(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: { include: { product: true } },
      },
    });
  }
}
