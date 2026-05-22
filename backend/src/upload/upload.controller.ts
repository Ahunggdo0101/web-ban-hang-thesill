import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpStatus,
  HttpCode,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';
import { DeleteImageDto } from './dto/delete-image.dto';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload product image to Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        this.logger.error('Upload attempt failed: No file provided');
        throw new BadRequestException('Không tìm thấy file tải lên');
      }

      // 1. Kiểm tra định dạng (mimetype)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        this.logger.warn(`Upload rejected: Unsupported file format ${file.mimetype}`);
        throw new UnsupportedMediaTypeException('Chỉ chấp nhận định dạng ảnh JPEG, PNG và WEBP');
      }

      // 2. Kiểm tra dung lượng tối đa 5MB (5 * 1024 * 1024 bytes)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.logger.warn(`Upload rejected: File size ${file.size} bytes exceeds 5MB limit`);
        throw new PayloadTooLargeException('Dung lượng ảnh vượt quá giới hạn 5MB');
      }

      const result = await this.uploadService.uploadImage(file);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (error) {
      this.logger.error(`Error during file upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Delete('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete image from Cloudinary' })
  async deleteImage(@Body() dto: DeleteImageDto) {
    try {
      this.logger.log(`Received request to delete image: ${dto.url}`);
      return await this.uploadService.deleteImage(dto.url);
    } catch (error) {
      this.logger.error(`Error in deleteImage controller: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

