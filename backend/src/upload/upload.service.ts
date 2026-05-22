import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    try {
      this.logger.log(`Starting upload for file: ${file.originalname} (${file.size} bytes)`);
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'the_sill_products',
            resource_type: 'image',
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              this.logger.error(`Cloudinary upload stream error: ${error.message}`, error.stack);
              return reject(new BadGatewayException(`Cloudinary upload failed: ${error.message}`));
            }
            if (!result) {
              this.logger.error('Cloudinary upload stream returned empty result');
              return reject(new BadGatewayException('Cloudinary upload failed: empty response'));
            }
            this.logger.log(`Cloudinary upload success: ${result.secure_url}`);
            resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException(`Upload service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImage(url: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Attempting to delete image with URL: ${url}`);
      
      // 1. Trích xuất public_id an toàn (O(N), chống ReDoS)
      let publicId = '';
      try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname; // "/dpk0jxpg7/image/upload/v1779354221/the_sill_products/monstera.png"
        const segments = pathname.split('/');
        
        const uploadIndex = segments.indexOf('upload');
        if (uploadIndex === -1) {
          this.logger.warn(`Could not find 'upload' segment in image URL path: ${pathname}`);
          return { success: true, message: 'Invalid URL format for Cloudinary, deletion skipped' };
        }
        
        let startIdx = uploadIndex + 1;
        // Kiểm tra xem segment tiếp theo có phải là version segment (ví dụ: v1779354221)
        if (segments[startIdx] && segments[startIdx].startsWith('v') && !isNaN(Number(segments[startIdx].substring(1)))) {
          startIdx += 1;
        }
        
        const publicIdWithExt = segments.slice(startIdx).join('/'); // "the_sill_products/monstera.png"
        const lastDotIdx = publicIdWithExt.lastIndexOf('.');
        publicId = lastDotIdx !== -1 ? publicIdWithExt.substring(0, lastDotIdx) : publicIdWithExt;
      } catch (e) {
        this.logger.warn(`Failed to parse URL ${url}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        return { success: true, message: 'URL parsing failed, deletion skipped' };
      }

      if (!publicId) {
        this.logger.warn(`Parsed publicId is empty for URL: ${url}`);
        return { success: true, message: 'Empty public_id parsed, deletion skipped' };
      }

      this.logger.log(`Parsed public_id: ${publicId}. Triggering Cloudinary destroy...`);

      // 2. Gọi API Cloudinary trong try-catch độc lập (Fault Tolerance)
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        this.logger.log(`Cloudinary destroy response for ${publicId}: ${JSON.stringify(result)}`);
      } catch (cloudinaryError) {
        // Eventual Consistency: log warning chứ không quăng lỗi để tránh chặn luồng kinh doanh
        this.logger.warn(
          `Cloudinary API error during deletion of ${publicId}: ${
            cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'
          }`
        );
      }

      return { success: true, message: 'Delete request processed successfully' };
    } catch (err) {
      // Bọc toàn bộ try-catch ngoài để đảm bảo tuyệt đối không crash main transaction
      this.logger.warn(`General exception in deleteImage: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return { success: true, message: 'Delete request processed with general warning' };
    }
  }
}
