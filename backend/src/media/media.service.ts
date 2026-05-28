import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async uploadAndCreate(file: Express.Multer.File, title: string) {
    const result = await this.uploadService.uploadImage(file);

    const media = await this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        title: title.trim(),
        bytes: result.bytes ?? null,
        format: result.format ?? null,
        width: result.width ?? null,
        height: result.height ?? null,
      },
    });

    this.logger.log(`Media created: ${media.id} — "${media.title}"`);
    return media;
  }

  async updateTitle(id: string, title: string) {
    const existing = await this.prisma.media.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Media ${id} not found`);

    return this.prisma.media.update({
      where: { id },
      data: { title: title.trim() },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.media.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Media ${id} not found`);

    // Xóa ảnh trên Cloudinary bằng publicId lưu sẵn trong DB
    await this.uploadService.deleteByPublicId(existing.publicId);

    // Xóa bản ghi trong DB
    await this.prisma.media.delete({ where: { id } });
    this.logger.log(`Media deleted: ${id} — "${existing.title}"`);

    return { success: true, message: 'Đã xóa ảnh thành công' };
  }

  /**
   * Đồng bộ toàn bộ hình ảnh có sẵn từ tài khoản Cloudinary về Database
   */
  async syncFromCloudinary() {
    try {
      this.logger.log('Starting Cloudinary media synchronization...');
      
      // Lấy danh sách ảnh từ Cloudinary (tối đa 150 ảnh)
      const result = await this.uploadService.listResources(150);
      const resources = result.resources || [];
      this.logger.log(`Found ${resources.length} resources on Cloudinary for synchronization`);

      let createdCount = 0;
      for (const resource of resources) {
        // Kiểm tra xem publicId đã tồn tại trong DB chưa
        const existing = await this.prisma.media.findUnique({
          where: { publicId: resource.public_id },
        });

        if (!existing) {
          const friendlyTitle = this.generateFriendlyTitle(resource.public_id, resource.filename);

          await this.prisma.media.create({
            data: {
              url: resource.secure_url,
              publicId: resource.public_id,
              title: friendlyTitle,
              bytes: resource.bytes ?? null,
              format: resource.format ?? null,
              width: resource.width ?? null,
              height: resource.height ?? null,
            },
          });
          createdCount++;
        }
      }

      this.logger.log(`Synchronization completed. Created ${createdCount} new media records.`);
      return {
        success: true,
        message: `Đồng bộ thành công! Đã thêm ${createdCount} hình ảnh mới từ Cloudinary vào thư viện.`,
        addedCount: createdCount,
      };
    } catch (error) {
      this.logger.error(`Failed to sync from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Không thể đồng bộ từ Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lấy danh sách ảnh trực tiếp từ Cloudinary API thời gian thực
   */
  async getCloudinaryRawResources(nextCursor?: string, limit = 20) {
    try {
      this.logger.log(`Fetching raw resources from Cloudinary API (limit: ${limit}, nextCursor: ${nextCursor || 'none'})...`);
      const result = await this.uploadService.listResources(limit, nextCursor);
      
      const resources = (result.resources || []).map((resource: any) => {
        const friendlyTitle = this.generateFriendlyTitle(resource.public_id, resource.filename);

        return {
          id: resource.asset_id || resource.public_id,
          url: resource.secure_url,
          publicId: resource.public_id,
          title: friendlyTitle,
          bytes: resource.bytes,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          createdAt: resource.created_at,
        };
      });

      return {
        items: resources,
        nextCursor: result.next_cursor || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get raw Cloudinary resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Không thể lấy danh sách ảnh từ Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Xóa ảnh trực tiếp trên Cloudinary API và đồng thời xóa trong DB cục bộ nếu có
   */
  async deleteCloudinaryRawResource(publicId: string) {
    try {
      this.logger.log(`Deleting raw resource directly from Cloudinary: ${publicId}`);
      
      // 1. Gọi API Cloudinary để xóa tài nguyên thực tế
      const result = await this.uploadService.deleteByPublicId(publicId);
      
      // 2. Xóa bản ghi trong Database local nếu tồn tại để tránh xung đột dữ liệu
      const dbMedia = await this.prisma.media.findFirst({
        where: { publicId }
      });
      if (dbMedia) {
        await this.prisma.media.delete({
          where: { id: dbMedia.id }
        });
        this.logger.log(`Also deleted local database media record for publicId: ${publicId}`);
      }

      return {
        success: true,
        message: 'Đã xóa ảnh vĩnh viễn trên Cloudinary thành công.',
        cloudinaryResult: result,
      };
    } catch (error) {
      this.logger.error(`Failed to delete raw Cloudinary resource ${publicId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Không thể xóa ảnh trên Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateFriendlyTitle(publicId: string, resourceFilename?: string): string {
    // 1. Lấy phần thô của tên file (ưu tiên resourceFilename hoặc cắt từ publicId)
    let baseName = resourceFilename;
    if (!baseName) {
      const parts = publicId.split('/');
      baseName = parts[parts.length - 1];
    }

    // 2. Làm sạch các mã hash ngẫu nhiên hoặc timestamp mà Cloudinary hoặc hệ thống sinh ra
    // Ví dụ xóa timestamp số ở cuối (dạng _1779354221 hoặc -1779354221)
    baseName = baseName.replace(/[-_]\d{9,13}$/, '');

    // Xóa các mã hash ngắn ngẫu nhiên alpha-numeric 6-10 ký tự ở cuối (ví dụ: -cuxy7z, _a1b2c3d4)
    baseName = baseName.replace(/[-_][a-zA-Z0-9]{6,10}$/, (match) => {
      // Chỉ xóa nếu chứa cả số lẫn chữ hoặc chỉ toàn chữ số (thường là mã hash ngẫu nhiên)
      if (/[0-9]/.test(match)) {
        return '';
      }
      return match;
    });

    // 3. Thay thế các ký tự gạch nối và gạch dưới thành dấu cách
    let title = baseName.replace(/[-_]/g, ' ').trim();

    // 4. Viết hoa chữ cái đầu của mỗi từ (Title Case)
    title = title
      .split(/\s+/)
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .filter(Boolean)
      .join(' ');

    // 5. Nếu kết quả trống, trả về tên mặc định đẹp đẽ
    return title || 'Hình ảnh thư viện';
  }
}

