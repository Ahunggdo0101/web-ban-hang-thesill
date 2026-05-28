import { Module } from '@nestjs/common';
import { CollectionConfigController } from './collection-config.controller';
import { CollectionConfigService } from './collection-config.service';

@Module({
  controllers: [CollectionConfigController],
  providers: [CollectionConfigService],
  exports: [CollectionConfigService],
})
export class CollectionConfigModule {}
