import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVoucherDto, UpdateVoucherDto, CartItemInfo } from './dto/voucher-mutations.dto';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo voucher mới (Chỉ dành cho Admin)
   */
  async create(dto: CreateVoucherDto) {
    // Kiểm tra xem mã giảm giá đã tồn tại chưa
    const existing = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Voucher code "${dto.code.toUpperCase()}" already exists`);
    }

    // Nếu gán cho cá nhân, kiểm tra xem user có tồn tại không
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID "${dto.userId}" not found`);
      }
    }

    return this.prisma.voucher.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Lấy tất cả các voucher (Chỉ dành cho Admin)
   */
  async findAll() {
    return this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Chi tiết voucher
   */
  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher with ID "${id}" not found`);
    }

    return voucher;
  }

  /**
   * Cập nhật voucher (Chỉ dành cho Admin)
   */
  async update(id: string, dto: UpdateVoucherDto) {
    const voucher = await this.findOne(id);

    if (dto.code && dto.code.toUpperCase() !== voucher.code) {
      const existing = await this.prisma.voucher.findUnique({
        where: { code: dto.code.toUpperCase() },
      });
      if (existing) {
        throw new BadRequestException(`Voucher code "${dto.code.toUpperCase()}" already exists`);
      }
    }

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID "${dto.userId}" not found`);
      }
    }

    return this.prisma.voucher.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Xóa voucher (Chỉ dành cho Admin)
   */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.voucher.delete({
      where: { id },
    });
    return { success: true, message: `Voucher successfully deleted` };
  }

  /**
   * Lấy danh sách các voucher khả dụng của user hiện tại (Gồm Public và Personal)
   */
  async findAllAvailableForUser(userId?: string) {
    const now = new Date();

    const whereClause: any = {
      AND: [
        // Điều kiện về thời gian
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        // Điều kiện về giới hạn lượt dùng
        {
          OR: [
            { usageLimit: null },
            {
              usageLimit: { not: null },
              usedCount: { lt: this.prisma.voucher.fields.usageLimit },
            },
          ],
        },
        // Điều kiện về đối tượng
        {
          OR: [
            { isPublic: true, userId: null },
            ...(userId ? [{ userId }] : []),
          ],
        },
      ],
    };

    // Note: Do Prisma field-to-field comparison can be tricky, we'll fetch and filter the usedCount < usageLimit manually or structure correctly:
    const vouchers = await this.prisma.voucher.findMany({
      where: whereClause,
      orderBy: { endDate: 'asc' },
    });

    // Filter usedCount < usageLimit client-side to be 100% safe
    return vouchers.filter(v => v.usageLimit === null || v.usedCount < v.usageLimit);
  }

  /**
   * Kiểm tra tính hợp lệ và tính toán giá trị giảm giá thực tế của một voucher
   */
  async validateAndCalculateDiscount(code: string, userId: string | undefined, items: CartItemInfo[]) {
    const now = new Date();
    const cleanCode = code.trim().toUpperCase();

    const voucher = await this.prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (!voucher) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" không tồn tại trên hệ thống.`);
    }

    // 1. Kiểm tra thời gian hiệu lực
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" chưa đến thời gian áp dụng.`);
    }
    if (voucher.endDate && new Date(voucher.endDate) < now) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết hạn sử dụng.`);
    }

    // 2. Kiểm tra giới hạn lượt dùng
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException(`Mã giảm giá "${cleanCode}" đã hết lượt sử dụng trên hệ thống.`);
    }

    // 3. Kiểm tra đối tượng sở hữu (mã cá nhân)
    if (!voucher.isPublic && voucher.userId) {
      if (!userId) {
        throw new BadRequestException(`Mã giảm giá "${cleanCode}" là mã cá nhân, vui lòng đăng nhập để sử dụng.`);
      }
      if (voucher.userId !== userId) {
        throw new BadRequestException(`Bạn không có quyền sử dụng mã giảm giá cá nhân "${cleanCode}".`);
      }
    }

    // 4. Tìm kiếm thông tin danh mục của sản phẩm trong giỏ hàng
    const productIds = items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categories: true },
    });

    const productCategoriesMap = new Map(products.map(p => [p.id, p.categories || []]));

    // 5. Tính tổng giá trị đơn hàng (Cart subtotal) hoặc tổng giá trị các sản phẩm được giảm theo danh mục
    let applicableSubtotal = 0;
    let totalCartSubtotal = 0;

    for (const item of items) {
      const itemSubtotal = item.price * item.quantity;
      totalCartSubtotal += itemSubtotal;

      const productCategories = productCategoriesMap.get(item.productId) || [];
      
      // Nếu voucher giới hạn danh mục sản phẩm (ví dụ: plants)
      if (voucher.categoryLimit) {
        if (productCategories.includes(voucher.categoryLimit)) {
          applicableSubtotal += itemSubtotal;
        }
      } else {
        applicableSubtotal += itemSubtotal;
      }
    }

    // Nếu voucher có categoryLimit nhưng trong giỏ không có sản phẩm nào thuộc category đó
    if (voucher.categoryLimit && applicableSubtotal === 0) {
      throw new BadRequestException(
        `Mã giảm giá "${cleanCode}" chỉ áp dụng cho danh mục sản phẩm "${voucher.categoryLimit}".`
      );
    }

    // 6. Kiểm tra giá trị đơn hàng tối thiểu
    // minOrderValue thường so sánh với tổng giá trị giỏ hàng (hoặc phần giỏ hàng thỏa mãn danh mục tùy thiết kế. Chúng ta chọn so sánh với totalCartSubtotal).
    if (totalCartSubtotal < voucher.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ để sử dụng mã "${cleanCode}".`
      );
    }

    // 7. Tính toán số tiền được giảm giá
    let discountAmount = 0;
    if (voucher.discountType === 'fixed') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'percentage') {
      discountAmount = applicableSubtotal * (voucher.discountValue / 100);
      if (voucher.maxDiscount !== null) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    }

    // Số tiền giảm không được vượt quá số tiền của sản phẩm áp dụng được
    discountAmount = Math.min(discountAmount, applicableSubtotal);

    return {
      discountAmount,
      code: voucher.code,
      type: voucher.type,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      categoryLimit: voucher.categoryLimit,
      minOrderValue: voucher.minOrderValue,
    };
  }
}
