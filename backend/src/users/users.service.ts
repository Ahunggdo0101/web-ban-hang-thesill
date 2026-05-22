import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    this.logger.log(`Fetching all users - page: ${page}, limit: ${limit}, search: ${search || 'none'}`);
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);

    return {
      items,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
    };
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    this.logger.log(`Updating role for user ${id} to ${dto.role}`);
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async deleteUser(id: string) {
    this.logger.log(`Deleting user ${id}`);
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: `User "${id}" deleted` };
  }
}
