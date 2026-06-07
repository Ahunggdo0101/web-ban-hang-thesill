import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto, UpdateVoucherDto, ApplyVoucherDto } from './dto/voucher-mutations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * [Admin] Tạo voucher mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new voucher' })
  @ApiResponse({ status: 201, description: 'Voucher successfully created.' })
  async create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  /**
   * [Admin] Lấy tất cả voucher
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get list of all vouchers' })
  async findAll() {
    return this.vouchersService.findAll();
  }

  /**
   * Lấy các voucher khả dụng của user hiện tại (Public và Personal nếu đã đăng nhập)
   */
  @Get('my-vouchers')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get list of available vouchers for the user (including guest)' })
  async getMyVouchers(@GetUser() user?: any) {
    const userId = user ? user.id : undefined;
    return this.vouchersService.findAllAvailableForUser(userId);
  }

  /**
   * [Public / User] Áp dụng voucher và tính số tiền giảm giá
   */
  @Post('apply')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Validate and calculate discount for a voucher code' })
  async applyVoucher(
    @Body() dto: ApplyVoucherDto,
    @GetUser() user?: any
  ) {
    const userId = user ? user.id : undefined;
    return this.vouchersService.validateAndCalculateDiscount(dto.code, userId, dto.items);
  }

  /**
   * [Admin] Chi tiết voucher
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get details of a single voucher' })
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  /**
   * [Admin] Cập nhật voucher
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update voucher configuration' })
  async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(id, dto);
  }

  /**
   * [Admin] Xóa voucher
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete a voucher' })
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
