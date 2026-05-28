import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] Lấy danh sách ảnh thư viện (có tìm kiếm + phân trang)' })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.mediaService.findAll(search, Number(page), Number(limit));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload ảnh mới lên Cloudinary và lưu vào thư viện' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh để tải lên');
    if (!title || !title.trim()) throw new BadRequestException('Vui lòng đặt tên ảnh (title) để dễ tìm kiếm sau này');

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Chỉ chấp nhận định dạng JPEG, PNG và WEBP');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new PayloadTooLargeException('Dung lượng ảnh vượt quá giới hạn 5MB');
    }

    return this.mediaService.uploadAndCreate(file, title);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Đồng bộ hình ảnh sẵn có từ Cloudinary về thư viện ảnh DB' })
  async sync() {
    return this.mediaService.syncFromCloudinary();
  }

  @Get('cloudinary')
  @ApiOperation({ summary: '[Admin] Lấy danh sách ảnh trực tiếp từ Cloudinary API thời gian thực' })
  async getCloudinaryRaw(
    @Query('nextCursor') nextCursor?: string,
    @Query('limit') limit = '20',
  ) {
    return this.mediaService.getCloudinaryRawResources(nextCursor, Number(limit));
  }

  @Delete('cloudinary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Xoá ảnh vĩnh viễn trực tiếp trên Cloudinary API và DB cục bộ' })
  async deleteCloudinaryRaw(@Query('publicId') publicId: string) {
    if (!publicId) throw new BadRequestException('Vui lòng cung cấp publicId của ảnh cần xoá');
    return this.mediaService.deleteCloudinaryRawResource(publicId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Đổi tên nhãn của ảnh trong thư viện' })
  async updateTitle(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    if (!title || !title.trim()) throw new BadRequestException('Tên nhãn không được để trống');
    return this.mediaService.updateTitle(id, title);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Xoá ảnh khỏi thư viện (đồng bộ cả DB lẫn Cloudinary)' })
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}

