import { Module } from '@nestjs/common';
import { MenuConfigService } from './menu-config.service';
import { MenuConfigController } from './menu-config.controller';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [MenuConfigController],
  providers: [MenuConfigService],
  exports: [MenuConfigService],
})
export class MenuConfigModule {}
