import { Controller, Get, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuConfigService } from './menu-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Menu Config')
@Controller('menu-config')
export class MenuConfigController {
  constructor(private readonly menuConfigService: MenuConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu configuration (public)' })
  @ApiResponse({ status: 200, description: 'Menu configuration retrieved successfully.' })
  async getConfig() {
    return this.menuConfigService.getConfig();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update menu configuration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu configuration updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin role required).' })
  async updateConfig(@Body() data: any[]) {
    return this.menuConfigService.updateConfig(data);
  }
}
