import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, UploadModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
