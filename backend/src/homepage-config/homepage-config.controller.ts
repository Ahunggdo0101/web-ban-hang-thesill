import { Controller, Get, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomepageConfigService } from './homepage-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Homepage Config')
@Controller('homepage-config')
export class HomepageConfigController {
  constructor(private readonly homepageConfigService: HomepageConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get homepage configuration (public)' })
  @ApiResponse({ status: 200, description: 'Homepage configuration retrieved successfully.' })
  async getConfig() {
    return this.homepageConfigService.getConfig();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update homepage configuration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Homepage configuration updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin role required).' })
  async updateConfig(@Body() data: Record<string, any>) {
    return this.homepageConfigService.updateConfig(data);
  }
}
