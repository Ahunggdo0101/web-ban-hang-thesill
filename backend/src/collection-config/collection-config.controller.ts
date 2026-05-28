import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionConfigService } from './collection-config.service';
import { UpdateCollectionConfigDto } from './dto/update-collection-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Collection Config')
@Controller('collection-config')
export class CollectionConfigController {
  constructor(private readonly collectionConfigService: CollectionConfigService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy cấu hình các slots hiển thị của bộ sưu tập theo ID' })
  @ApiResponse({ status: 200, description: 'Đọc cấu hình thành công.' })
  async findOne(@Param('id') id: string) {
    return this.collectionConfigService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật các slots hiển thị của bộ sưu tập (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật slots thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionConfigDto,
  ) {
    return this.collectionConfigService.update(id, dto.slots, dto.trending);
  }
}
