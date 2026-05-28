import { Module } from '@nestjs/common';
import { HomepageConfigController } from './homepage-config.controller';
import { HomepageConfigService } from './homepage-config.service';

@Module({
  controllers: [HomepageConfigController],
  providers: [HomepageConfigService],
})
export class HomepageConfigModule {}
